# Vinylo

Vinylo (formerly AlbumELO) is a web-based application that allows you to rank your Last.fm albums using an ELO rating system. It fetches your top albums from Last.fm and presents them in 1v1 matchups, letting you decide which one you prefer. Over time, this builds a personalized ranking of your music library.

## Features

-   **Last.fm & Spotify Integration**: Automatically fetches your top albums from your Last.fm profile or Spotify top tracks.
-   **ELO Rating System**: Uses a robust ELO algorithm to calculate album rankings based on your choices.
-   **Interactive Play Mode**: 1v1 matchups with album art, artist names, and current scores.
-   **Smart Filtering**: Automatically filters out "clutter" such as singles, EPs, and albums with low playcounts (< 10).
-   **Ignore Feature**: Manually ignore albums you don't want to rank.
-   **Scoreboard**: View your top 50 ranked albums in a beautiful leaderboard.
-   **Persistence**: Automatically saves your progress and rankings locally.

## Prerequisites

-   Python 3.x
-   Node.js & npm
-   A Last.fm API Key (Get one [here](https://www.last.fm/api/account/create))
-   A Spotify App Client ID & Secret (Get one [here](https://developer.spotify.com/dashboard))

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/AlbumELO.git
    cd AlbumELO
    ```

### Backend Setup

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
    API_KEY=your_lastfm_api_key_here
    
    SPOTIFY_CLIENT_ID=your_spotify_client_id
    SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
    SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/api/callback/spotify
    ```
    *Note: Ensure your Spotify App Redirect URI in the dashboard matches `http://127.0.0.1:8000/api/callback/spotify` exactly.*

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install Node dependencies:
    ```bash
    npm install
    ```

## Usage

You need to run both the backend and frontend servers.

1.  **Start the Backend**:
    From the root directory:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```

2.  **Start the Frontend**:
    From the `frontend` directory:
    ```bash
    npm run dev
    ```

3.  Open your web browser and navigate to:
    `http://localhost:5173`

4.  Start ranking!

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
-   `requirements.txt`: Python dependencies (legacy root file removed, see `backend/requirements.txt`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
