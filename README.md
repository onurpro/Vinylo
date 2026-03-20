# Vinylo 💿

**Your Personal Music Ranker**

Vinylo is your indie, open-source companion for discovering your true music taste. It connects to your Last.fm history and pits your favorite albums against each other in 1v1 battles. By forcing you to make simple "this or that" decisions, Vinylo uses a chess-like ELO rating system to build a highly accurate, personalized leaderboard of your music library. Say goodbye to struggling with manual top 10 lists!

## Tech Stack
-   **Backend**: FastAPI, Python, SQLite
-   **Frontend**: React, Node.js
-   **Deployment**: Docker

## Features
-   **Connect Your Music**: Seamlessly pull your top albums from Last.fm.
-   **1v1 Battles**: Making choices is easy when you only have to pick between two albums at a time.
-   **Smart Ranking**: Our ELO algorithm handles the heavy lifting to score and rank your collection.
-   **Clean Up**: Filter out those compilation albums or random singles you don't care about.
-   **Leaderboard**: Watch your favorites climb the ranks on your personal scoreboard.

## How to Use
1.  **Connect**: Launch Vinylo and link your Last.fm account.
2.  **Start Ranking**: You'll see two albums side-by-side. Click the one you prefer! The winner gains points, the loser loses points, and a new matchup appears instantly.
3.  **View Your Stats**: Click the **Leaderboard** button to see your top 50 albums.
4.  **Manage Data**: "Ignore" albums you don't want to rank, or reset your progress entirely in the Settings menu.

## Contributing
Want to hack on Vinylo? Check out [CONTRIBUTING.md](CONTRIBUTING.md) for a quick and simple local dev setup. Please **open an issue** before submitting large PRs so we can chat about your idea first!

## Self-Hosting

Deploy Vinylo on your own server (like TrueNAS or a VPS) using Docker Compose.

### 1. Environment Variables
Create a `.env` file or configure these variables in your deployment environment:
```env
LASTFM_API_KEY=your_lastfm_api_key_here
LASTFM_API_SECRET=your_lastfm_api_secret_here
FRONTEND_URL=http://<your-server-ip>
```

### 2. Run with Docker Compose
To run the production build:
```bash
git clone https://github.com/onurpro/Vinylo.git
cd Vinylo
docker-compose -f docker-compose.prod.yml up -d --build
```
This spins up the backend and frontend containers, creating a `./data` directory for your SQLite database.

### 3. Access the App
-   **Frontend**: `http://<your-server-ip>`
-   **Backend API**: `http://<your-server-ip>/api`

### Building Images Manually
If you need to build and push images to a registry (for example, to deploy on TrueNAS via Custom App):
1.  Update `myusername` to your Docker Hub username in `docker-compose.prod.yml` and `build_and_push.sh`.
2.  Run `./build_and_push.sh`.

## Support & Feedback
Found a bug? Have a killer feature idea? [Open an issue](https://github.com/onurpro/vinylo/issues) on GitHub. Let's build something awesome together!
