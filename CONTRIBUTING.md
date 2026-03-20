# Contributing to Vinylo

Thanks for wanting to help build Vinylo! Before making large pull requests, **please open an issue** so we can discuss the changes first.

## Dev Environment Setup

1. **Clone & Env**:
   ```bash
   git clone https://github.com/onurpro/Vinylo.git && cd Vinylo
   ```
   Create a root `.env` file with your API keys (see README for variables).

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn backend.main:app --reload --port 8000
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev # Access at http://localhost:5173
   ```
