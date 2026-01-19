
import os
import uuid
import pandas as pd
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .models import ScrapeRequest, ScrapeStatus, Lead
from .scraper import run_google_maps_scraper
from .enrichment import enrich_leads
from typing import Dict
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LeadFlow Poland API")

# Enable CORS (przydatne przy developmencie, w produkcji pliki są serwowane z tej samej domeny)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Baza danych w pamięci
tasks_db: Dict[uuid.UUID, dict] = {}

# Folder na wyniki CSV
os.makedirs("results", exist_ok=True)
app.mount("/download", StaticFiles(directory="results"), name="results")

# --- Logika Biznesowa ---

async def process_scrape_task(task_id: uuid.UUID, query: str, max_results: int):
    tasks_db[task_id]["status"] = "running"
    tasks_db[task_id]["error"] = None
    
    try:
        # Krok 1: Apify Google Maps
        print(f"[{task_id}] Uruchamianie scrapera Apify dla: {query}")
        leads = run_google_maps_scraper(query, max_results)
        
        if not leads:
            print(f"[{task_id}] Nie znaleziono żadnych wyników.")
            # Nie przerywamy, ale informujemy, że 0 wyników
        
        tasks_db[task_id]["progress"] = 50
        tasks_db[task_id]["results_count"] = len(leads)
        
        # Krok 2: Lokalne Wzbogacanie (Enrichment)
        tasks_db[task_id]["status"] = "enriching"
        print(f"[{task_id}] Rozpoczynanie wzbogacania {len(leads)} leadów.")
        enriched_leads = await enrich_leads(leads)
        tasks_db[task_id]["progress"] = 90
        
        # Krok 3: Zapis do CSV
        df = pd.DataFrame([l.dict() for l in enriched_leads])
        filename = f"{task_id}.csv"
        filepath = os.path.join("results", filename)
        df.to_csv(filepath, index=False)
        
        tasks_db[task_id]["status"] = "completed"
        tasks_db[task_id]["progress"] = 100
        tasks_db[task_id]["csv_url"] = f"/download/{filename}"
        print(f"[{task_id}] Zadanie zakończone sukcesem.")
        
    except Exception as e:
        error_msg = str(e)
        print(f"[{task_id}] BŁĄD KRYTYCZNY: {error_msg}")
        tasks_db[task_id]["status"] = "failed"
        tasks_db[task_id]["error"] = error_msg

# --- Endpointy API ---

@app.post("/api/scrape", response_model=dict)
async def start_scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    task_id = uuid.uuid4()
    tasks_db[task_id] = {
        "status": "pending",
        "progress": 0,
        "results_count": 0,
        "query": request.query,
        "error": None
    }
    background_tasks.add_task(process_scrape_task, task_id, request.query, request.max_results)
    return {"task_id": task_id}

@app.get("/api/status/{task_id}", response_model=ScrapeStatus)
async def get_status(task_id: uuid.UUID):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    
    t = tasks_db[task_id]
    return ScrapeStatus(
        task_id=task_id,
        status=t["status"],
        progress=t["progress"],
        results_count=t["results_count"],
        csv_url=t.get("csv_url"),
        error=t.get("error")
    )

# --- Serwowanie Frontendu (Musi być na końcu) ---

# Sprawdzamy czy istnieje folder static (utworzony przez Dockerfile)
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        # Jeśli plik istnieje w static (np. favicon.ico), zwróć go
        file_path = os.path.join("static", catchall)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        # W przeciwnym razie zwróć index.html (dla routingu Reacta)
        return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    # Uruchamiamy na porcie 8000 wewnątrz kontenera
    uvicorn.run(app, host="0.0.0.0", port=8000)
