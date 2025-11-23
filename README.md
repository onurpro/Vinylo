# Vinylo
 
Vinylo (formerly AlbumELO) is a web-based application that allows you to rank your Last.fm albums using an ELO rating system. It fetches your top albums from Last.fm and presents them in 1v1 matchups, letting you decide which one you prefer. Over time, this builds a personalized ranking of your music library.

## Features

-   **Last.fm Integration**: Automatically fetches your top albums from your Last.fm profile.
-   **ELO Rating System**: Uses a robust ELO algorithm to calculate album rankings based on your choices.
-   **Interactive Play Mode**: 1v1 matchups with album art, artist names, and current scores.
-   **Smart Filtering**: Automatically filters out "clutter" such as singles, EPs, and albums with low playcounts (< 10).
-   **Ignore Feature**: Manually ignore albums you don't want to rank.
-   **Scoreboard**: View your top 50 ranked albums in a beautiful leaderboard.
-   **Persistence**: Automatically saves your progress and rankings locally.

## Prerequisites

-   Python 3.x
-   A Last.fm API Key (Get one [here](https://www.last.fm/api/account/create))

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/AlbumELO.git
    cd AlbumELO
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Create a `.env` file in the root directory and add your Last.fm API Key:
    ```env
    API_KEY=your_lastfm_api_key_here
    ```

## Usage

1.  Run the application:
    ```bash
    python run.py
    ```

2.  Open your web browser and navigate to:
    `http://127.0.0.1:5000`

3.  Start ranking!

## Project Structure

-   `app/`: Contains the application source code.
    -   `server.py`: Flask server and route definitions.
    -   `models.py`: Data models for Albums.
    -   `api_client.py`: Last.fm API integration.
    -   `elo_ranker.py`: ELO calculation logic.
    -   `storage.py`: JSON file persistence.
    -   `templates/`: HTML templates.
    -   `static/`: CSS and other static assets.
-   `run.py`: Entry point script.
-   `requirements.txt`: Python dependencies.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
