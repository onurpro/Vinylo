# Deployment Guide for AlbumELO

This guide explains how to deploy the AlbumELO application using Docker and Docker Compose. This setup is ideal for home servers like TrueNAS Scale.

## Prerequisites

- Docker and Docker Compose installed on your server.
- SSH access to your server (recommended).

## Project Structure

The deployment relies on the following files:
- `docker-compose.prod.yml`: Orchestrates the Backend and Frontend services (Production).
- `backend/Dockerfile`: Builds the Python FastAPI backend.
- `frontend/Dockerfile`: Builds the React frontend and serves it with Nginx.
- `frontend/nginx.conf`: Configures Nginx to serve the app and proxy API requests.

## Deployment Steps

### 1. Transfer Files
Copy the entire `AlbumELO` directory to your server. You can use `scp` or `git clone` if you push this to a repo.

```bash
scp -r AlbumELO user@your-server:/path/to/apps/
```

### 2. Run with Docker Compose
Navigate to the directory and start the services:

```bash
cd AlbumELO
docker-compose -f docker-compose.prod.yml up -d --build
```

This command will:
- Build the backend and frontend images.
- Start the containers in detached mode.
- Create a `data` directory for persistent storage (SQLite database).

### 3. Access the Application
- **Frontend**: Open `http://<your-server-ip>` in your browser.
- **Backend API**: Accessible at `http://<your-server-ip>/api` (proxied by Nginx).

## TrueNAS Scale Deployment (Custom App)

TrueNAS Scale's "Custom App" feature works best with pre-built images rather than building from source.

### 1. Build and Push Images (Local Machine)
Before deploying on TrueNAS, you must build the Docker images on your computer and push them to Docker Hub.

1.  **Edit Configuration**:
    - Open `docker-compose.prod.yml` and `build_and_push.sh`.
    - Replace `myusername` with your actual Docker Hub username.

2.  **Run Build Script**:
    ```bash
    ./build_and_push.sh
    ```
    This will build `vinylo-backend` and `vinylo-frontend` and push them to your Docker Hub account.

### 2. Install on TrueNAS Scale
1.  **Open Apps**: Go to the "Apps" tab in TrueNAS Scale.
2.  **Discover Apps**: Click "Discover Apps" -> "Custom App".
3.  **Install via YAML**:
    - Give the app a name (e.g., `vinylo`).
    - In the "Image" or "Configuration" section, look for an option to "Install via YAML" or paste a Compose file.
    - Paste the contents of your updated `docker-compose.prod.yml`.
4.  **Configure Storage (Crucial)**:
    - The `docker-compose.prod.yml` defines a volume: `./data:/app/data`.
    - TrueNAS might ask you to map this explicitly.
    - **Host Path**: Choose a dataset on your TrueNAS pool (e.g., `/mnt/tank/apps/vinylo/data`).
    - **Mount Path**: `/app/data`
    - **Permissions**: Ensure the "apps" user (usually UID 568) has write access to this dataset, or configure the container to run as root (less secure, but easier).
5.  **Deploy**: Click Install/Save.

### 3. Updates
To update the app:
1.  Run `./build_and_push.sh` on your local machine.
2.  On TrueNAS, go to the App details and click "Update" or "Pull Images" (depending on the UI version) to fetch the latest `latest` tag.

## Configuration

### Spotify Configuration (Required for Spotify Login)
To enable Spotify login, you must set the following environment variables in your TrueNAS App configuration (or `docker-compose.prod.yml`):

-   `SPOTIFY_CLIENT_ID`: Your Spotify App Client ID.
-   `SPOTIFY_CLIENT_SECRET`: Your Spotify App Client Secret.
-   `SPOTIFY_REDIRECT_URI`: The URL where Spotify redirects after login.
    -   Format: `http://<your-server-ip>:8000/api/callback/spotify`
    -   **Important**: You must also add this exact URL to the "Redirect URIs" in your Spotify Developer Dashboard.
-   `FRONTEND_URL`: The URL of your frontend application.
    -   Format: `http://<your-server-ip>` (or whatever port/domain you use).
    -   This is where the backend will redirect the user after successful Spotify login.

### Other Configuration
- **Database**: The SQLite database is stored in the mapped volume. Back up your TrueNAS dataset to save your data.
- **Ports**:
    - Frontend: Port `80` inside container. You may need to map this to a different port (e.g., `9080`) if port 80 is in use by TrueNAS.
    - Backend: Port `8000` inside container.

## Troubleshooting

- **"Connection Refused"**: Ensure the containers are running. Check TrueNAS App logs.
- **Data not saving**: Check permissions on the TrueNAS dataset mapped to `/app/data`.
- **Images not found**: Ensure you have successfully pushed images to Docker Hub and the repository is Public (or you have configured image pull secrets).
