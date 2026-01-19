
# LeadFlow Poland 🇵🇱

Production-ready B2B Lead Generation platform focused on the Polish market. Uses Apify's Google Maps Scraper and local contact enrichment to find business emails and phone numbers.

## Features
- **Fast Extraction**: Leveraging Apify Actor APIs for high-quality Maps data.
- **Local Enrichment**: Asynchronous shallow crawling of discovered websites to find `office@domain.pl` and Polish phone formats.
- **SaaS Dashboard**: Modern React interface with real-time progress monitoring.
- **CSV Export**: Download clean datasets ready for CRM import.

## Prerequisites
1. [Apify Account](https://apify.com/) & API Token.
2. Docker & Docker Compose installed.

## Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/leadflow-poland.git
   cd leadflow-poland
   ```

2. **Configure Environment**:
   Create a `.env` file in the root:
   ```env
   APIFY_API_TOKEN=your_real_apify_token_here
   ```

3. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

4. **Access the app**:
   Open `http://localhost` in your browser.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Lucide Icons.
- **Backend**: Python (FastAPI), Asyncio, HTTPX, Pandas.
- **Data**: Apify Google Maps Scraper Actor.
