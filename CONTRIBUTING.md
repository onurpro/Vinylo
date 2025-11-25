# Contributing to AlbumELO

Thank you for your interest in contributing to Vinylo! This document provides instructions for setting up the project locally for development.

## Prerequisites

-   Python 3.x
-   Node.js & npm
-   A Last.fm API Key & Secret (Get one [here](https://www.last.fm/api/account/create))
-   A Spotify App Client ID & Secret (Get one [here](https://developer.spotify.com/dashboard))

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/onurpro/Vinylo.git
cd Vinylo
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Create a `.env` file in the **root** directory (not backend) and add your keys:
    ```env
    LASTFM_API_KEY=your_lastfm_api_key_here
    LASTFM_API_SECRET=your_lastfm_api_secret_here
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/api/callback/spotify
    ```
    *Note: Ensure your Spotify App Redirect URI in the dashboard matches `http://127.0.0.1:8000/api/callback/spotify` exactly.*

4.  Start the Backend:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install Node dependencies:
    ```bash
    npm install
    ```

3.  Start the Frontend:
    ```bash
    npm run dev
    ```

4.  Open your web browser and navigate to:
    `http://localhost:5173`

### 4. Docker Development (Optional)

If you prefer to develop using Docker, you can use the provided `docker-compose.yml` which is configured for hot-reloading.

1.  **Start the environment**:
    ```bash
    docker-compose up
    ```

2.  **Access**:
    -   Frontend: `http://localhost:5173`
    -   Backend: `http://localhost:8000`

    *Note: The backend code is mounted, so changes will auto-reload. The frontend also supports HMR.*

## Project Structure

-   `backend/`: FastAPI backend source code.
    -   `main.py`: FastAPI app and route definitions.
    -   `models.py`: Data models.
    -   `api_client.py`: Last.fm API integration.
    -   `elo_ranker.py`: ELO calculation logic.
    -   `database.py`: Database connection.
-   `frontend/`: React frontend source code.
    -   `src/`: React components and logic.
    -   `public/`: Static assets.
-   `requirements.txt`: Python dependencies.

## Deployment

For deployment instructions, please refer to [deployment_guide.md](deployment_guide.md).
