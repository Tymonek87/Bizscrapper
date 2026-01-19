
import os
from apify_client import ApifyClient
from typing import List, Dict
from .models import Lead

def run_google_maps_scraper(query: str, max_results: int) -> List[Lead]:
    """
    Triggers 'apify/google-maps-scraper' actor.
    """
    token = os.getenv('APIFY_API_TOKEN')
    if not token:
        raise ValueError("Brak tokena APIFY_API_TOKEN w zmiennych środowiskowych.")

    # Initialize ApifyClient
    try:
        client = ApifyClient(token)
    except Exception as e:
        raise ConnectionError(f"Nie udało się zainicjować klienta Apify: {str(e)}")

    # Actor input configuration
    run_input = {
        "searchStrings": [query],
        "maxItems": max_results,
        "searchMode": "all",
        "language": "pl",
    }

    try:
        # Run the actor and wait for it to finish
        run = client.actor("apify/google-maps-scraper").call(run_input=run_input)
    except Exception as e:
        raise RuntimeError(f"Błąd podczas uruchamiania aktora Apify: {str(e)}")

    if not run:
        raise RuntimeError("Apify nie zwróciło danych uruchomienia (run object is None).")

    leads = []
    try:
        # Fetch and process results
        dataset = client.dataset(run["defaultDatasetId"])
        for item in dataset.iterate_items():
            leads.append(Lead(
                name=item.get('title', 'Nieznana nazwa'),
                address=item.get('address', ''),
                website=item.get('website', ''),
                place_id=item.get('placeId', '')
            ))
    except Exception as e:
        raise RuntimeError(f"Błąd podczas pobierania wyników z datasetu Apify: {str(e)}")
    
    return leads
