import random
import json
import os
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

import models, schemas, database, elo_ranker, api_client

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS setup
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*" # Allow all for now to fix connection issues on TrueNAS
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "AlbumELO API is running"}

@app.post("/api/init/{username}")
def initialize_user(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    # Check if user already has data
    count = db.query(models.Album).filter(
        models.Album.username == username,
        models.Album.source == source
    ).count()
    if count > 0:
        return {"message": f"User {username} ({source}) already has {count} albums."}

    # Check for legacy JSON file in root
    # Assuming CWD is the project root (AlbumELO)
    json_path = f"{username}_data.json"
    if os.path.exists(json_path):
        print(f"Found legacy data for {username}, migrating...")
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
                for item in data:
                    # Map legacy fields to new model
                    db_album = models.Album(
                        username=username,
                        name=item['name'],
                        artist_name=item['artistName'],
                        url=item['url'],
                        mbid=item.get('mbid'),
                        image_url=item['imageURL'],
                        playcount=item.get('playcount', 0),
                        elo_score=item.get('eloScore', 1500.0),
                        ignored=item.get('ignored', False),
                        source=source
                    )
                    db.add(db_album)
            db.commit()
            return {"message": f"Migrated {len(data)} albums from JSON."}
        except Exception as e:
            print(f"Migration failed: {e}")
            # Fallback to API fetch if migration fails?
            pass

    # Fetch from Last.fm
    print(f"Fetching from Last.fm for {username}...")
    albums_data = api_client.fetch_albums_from_lastfm(username)
    if not albums_data:
        raise HTTPException(status_code=404, detail="Could not fetch data from Last.fm")
    
    for album_dict in albums_data:
        db_album = models.Album(**album_dict)
        db.add(db_album)
    
    db.commit()
    db.commit()
    return {"message": f"Fetched {len(albums_data)} albums from Last.fm."}

@app.delete("/api/reset/{username}")
def reset_user_data(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    # Delete all albums for the user
    count = db.query(models.Album).filter(
        models.Album.username == username,
        models.Album.source == source
    ).delete()
    db.commit()

    # Delete legacy JSON file if it exists
    json_path = f"{username}_data.json"
    file_deleted = False
    if os.path.exists(json_path):
        try:
            os.remove(json_path)
            file_deleted = True
            print(f"Deleted legacy data file: {json_path}")
        except Exception as e:
            print(f"Failed to delete legacy data file {json_path}: {e}")

    return {
        "message": f"Deleted {count} albums for user {username}", 
        "deleted_count": count,
        "legacy_file_deleted": file_deleted
    }

@app.get("/api/login/lastfm")
def login_lastfm():
    try:
        url = api_client.get_lastfm_auth_url()
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/callback/lastfm")
def callback_lastfm(token: str, db: Session = Depends(get_db)):
    try:
        username = api_client.get_lastfm_session(token)
        print(f"DEBUG: Authenticated Last.fm user: {username}")
        
        # Check if user already has data
        count = db.query(models.Album).filter(
            models.Album.username == username,
            models.Album.source == "lastfm"
        ).count()
        
        if count == 0:
            # Fetch from Last.fm
            print(f"Fetching from Last.fm for {username}...")
            albums_data = api_client.fetch_albums_from_lastfm(username)
            
            if albums_data:
                for album_dict in albums_data:
                    db_album = models.Album(**album_dict)
                    db.add(db_album)
                db.commit()
                print(f"DEBUG: Inserted {len(albums_data)} albums into DB")
        
        # Redirect to frontend
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}?username={username}&source=lastfm")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/login/spotify")
def login_spotify():
    try:
        url = api_client.get_spotify_auth_url()
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/callback/spotify")
def callback_spotify(code: str, db: Session = Depends(get_db)):
    try:
        token = api_client.get_spotify_token(code)
        albums_data, username = api_client.fetch_albums_from_spotify(token)
        print(f"DEBUG: Fetched {len(albums_data)} albums from Spotify for {username}")
        
        # Check if user already exists, if so, maybe update? 
        # For now, similar logic to init: check count
        count = db.query(models.Album).filter(
            models.Album.username == username,
            models.Album.source == "spotify"
        ).count()
        print(f"DEBUG: Current album count in DB for {username}: {count}")
        
        if count == 0:
            for album_dict in albums_data:
                db_album = models.Album(**album_dict)
                db.add(db_album)
            db.commit()
            print(f"DEBUG: Inserted {len(albums_data)} albums into DB")
            
        # Redirect to frontend with username and source
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        return RedirectResponse(url=f"{frontend_url}?username={username}&source=spotify")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings/{username}", response_model=schemas.UserSettings)
def get_settings(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.username == username,
        models.UserSettings.source == source
    ).first()
    
    if not settings:
        # Return default settings
        return schemas.UserSettings(username=username, source=source, scrobble_threshold=50)
    
    return settings

@app.post("/api/settings/{username}", response_model=schemas.UserSettings)
def update_settings(username: str, settings: schemas.UserSettingsCreate, source: str = "lastfm", db: Session = Depends(get_db)):
    db_settings = db.query(models.UserSettings).filter(
        models.UserSettings.username == username,
        models.UserSettings.source == source
    ).first()
    
    if not db_settings:
        db_settings = models.UserSettings(
            username=username, 
            source=source, 
            scrobble_threshold=settings.scrobble_threshold
        )
        db.add(db_settings)
    else:
        db_settings.scrobble_threshold = settings.scrobble_threshold
        
    db.commit()
    db.refresh(db_settings)
    return db_settings

@app.get("/api/matchup/{username}", response_model=List[schemas.Album])
def get_matchup(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    # Filter active albums
    # Logic: playcount >= 50, not ignored, no "EP"/"Single" in title (simplified for now)
    # We can make these filters configurable later
    
    # Get user settings for threshold
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.username == username,
        models.UserSettings.source == source
    ).first()
    
    # Force threshold to 0 for Spotify since playcounts are 0
    if source == "spotify":
        threshold = 0
    else:
        threshold = settings.scrobble_threshold if settings else 50
    
    query = db.query(models.Album).filter(
        models.Album.username == username,
        models.Album.source == source,
        models.Album.ignored == False,
        models.Album.playcount >= threshold
    )
    
    # Simple exclusion of EPs/Singles
    excluded_keywords = [" EP", " (EP)", " - EP", " Single", " (Single)", " - Single"]
    for keyword in excluded_keywords:
        query = query.filter(models.Album.name.notilike(f"%{keyword}%"))
        
    count = query.count()
    if count < 2:
        raise HTTPException(status_code=400, detail="Not enough albums for a matchup")
        
    # Get 2 random albums
    # Ideally use a more efficient random selection for large DBs
    # For now, fetch all IDs and pick 2
    # Or use func.random()
    
    random_albums = query.order_by(func.random()).limit(2).all()
    return random_albums

@app.post("/api/vote")
def vote(vote_req: schemas.VoteRequest, db: Session = Depends(get_db)):
    a1 = db.query(models.Album).filter(models.Album.id == vote_req.album1_id).first()
    a2 = db.query(models.Album).filter(models.Album.id == vote_req.album2_id).first()
    
    if not a1 or not a2:
        raise HTTPException(status_code=404, detail="Album not found")
        
    score = 1.0 if vote_req.winner == "1" else 0.0
    
    new_rating1, new_rating2 = elo_ranker.calculate_new_rating(a1.elo_score, a2.elo_score, score)
    
    a1.elo_score = new_rating1
    a2.elo_score = new_rating2
    
    db.commit()
    
    return {
        "success": True, 
        "new_scores": {
            "album1": new_rating1, 
            "album2": new_rating2
        }
    }

@app.get("/api/stats/{username}", response_model=List[schemas.Album])
def get_stats(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    # Get user settings for threshold
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.username == username,
        models.UserSettings.source == source
    ).first()
    
    # Force threshold to 0 for Spotify since playcounts are 0
    if source == "spotify":
        threshold = 0
    else:
        threshold = settings.scrobble_threshold if settings else 50

    albums = db.query(models.Album).filter(
        models.Album.username == username,
        models.Album.source == source,
        models.Album.ignored == False,
        models.Album.playcount >= threshold
    ).order_by(models.Album.elo_score.desc()).all()
    return albums

@app.post("/api/ignore/{album_id}")
def ignore_album(album_id: int, db: Session = Depends(get_db)):
    album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    album.ignored = True
    db.commit()
    return {"success": True}

@app.get("/api/ignored/{username}", response_model=List[schemas.Album])
def get_ignored_albums(username: str, source: str = "lastfm", db: Session = Depends(get_db)):
    albums = db.query(models.Album).filter(
        models.Album.username == username,
        models.Album.source == source,
        models.Album.ignored == True
    ).all()
    return albums

@app.post("/api/unignore/{album_id}")
def unignore_album(album_id: int, db: Session = Depends(get_db)):
    album = db.query(models.Album).filter(models.Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    album.ignored = False
    db.commit()
    return {"success": True}
