
import asyncio
import httpx
import re
from typing import List, Optional
from .models import Lead

# Basic Regex for Emails and Polish Phone Numbers
EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:\+48|0048)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}'

async def scrape_site_for_contacts(client: httpx.AsyncClient, url: str) -> Dict[str, Optional[str]]:
    """Visits the website and /kontakt page to find contacts."""
    if not url or not url.startswith('http'):
        return {"email": None, "phone": None}
    
    try:
        # Check homepage
        response = await client.get(url, timeout=10.0, follow_redirects=True)
        text = response.text
        
        emails = re.findall(EMAIL_REGEX, text)
        phones = re.findall(PHONE_REGEX, text)
        
        # Simple heuristic: try /kontakt if nothing found on home
        if not emails:
            kontakt_url = url.rstrip('/') + '/kontakt'
            try:
                resp_k = await client.get(kontakt_url, timeout=5.0)
                text += resp_k.text
                emails = re.findall(EMAIL_REGEX, text)
                phones = re.findall(PHONE_REGEX, text)
            except:
                pass

        return {
            "email": list(set(emails))[0] if emails else None,
            "phone": list(set(phones))[0] if phones else None
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {"email": None, "phone": None}

async def enrich_leads(leads: List[Lead]) -> List[Lead]:
    """Concurrent enrichment for a list of leads."""
    async with httpx.AsyncClient(headers={"User-Agent": "LeadFlowBot/1.0"}) as client:
        tasks = [scrape_site_for_contacts(client, lead.website) for lead in leads]
        results = await asyncio.gather(*tasks)
        
        for lead, result in zip(leads, results):
            lead.email = result["email"]
            lead.phone = result["phone"]
            
    return leads
