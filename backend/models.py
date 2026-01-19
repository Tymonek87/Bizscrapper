
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

class Lead(BaseModel):
    name: str
    address: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    place_id: Optional[str] = None

class ScrapeRequest(BaseModel):
    query: str
    max_results: int = 20

class ScrapeStatus(BaseModel):
    task_id: UUID
    status: str
    progress: int
    results_count: int
    csv_url: Optional[str] = None
    error: Optional[str] = None
