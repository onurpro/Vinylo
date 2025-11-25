import os
import requests
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

API_KEY = os.getenv("API_KEY")
LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0"

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")


def get_data(username: str, page: int) -> Optional[dict]:
    params = {
        'method': 'user.gettopalbums',
        'user': username,
        'api_key': API_KEY,
        'format': 'json',
        'limit': 1000, # Max limit
        'page': page
    }
    try:
        response = requests.get(LASTFM_BASE_URL, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data from Last.fm: {e}")
        return None

def fetch_albums_from_lastfm(username: str) -> List[dict]:
    """
    Fetches all top albums for a user from Last.fm and returns a list of dicts
    ready to be inserted into the database.
    """
    if not API_KEY:
        print("Error: API_KEY not found in environment variables.")
        return []

    albums_data = []
    page = 1
    
    # Initial fetch to get total pages
    data = get_data(username, page)
    if not data or 'topalbums' not in data:
        return []
        
    total_pages = int(data['topalbums']['@attr']['totalPages'])
    
    def parse_page(data):
        for item in data['topalbums']['album']:
            # Get the largest image
            image_url = ""
            if 'image' in item and len(item['image']) > 0:
                image_url = item['image'][-1]['#text']
                
            albums_data.append({
                "name": item['name'],
                "artist_name": item['artist']['name'],
                "url": item['url'],
                "mbid": item.get('mbid'),
                "image_url": image_url,
                "playcount": int(item.get('playcount', 0)),
                "username": username,
                "elo_score": 1500.0,
                "ignored": False,
                "source": "lastfm"
            })

    parse_page(data)
    
    # Fetch remaining pages
    if total_pages > 1:
        for p in range(2, total_pages + 1):
            print(f"Fetching page {p}/{total_pages}...")
            p_data = get_data(username, p)
            if p_data:
                parse_page(p_data)
                
    return albums_data

def get_spotify_auth_url() -> str:
    """
    Returns the URL to redirect the user to for Spotify authorization.
    """
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_REDIRECT_URI:
        raise Exception("Spotify credentials not set in environment variables.")
        
    scope = "user-top-read"
    return (
        f"https://accounts.spotify.com/authorize"
        f"?client_id={SPOTIFY_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={SPOTIFY_REDIRECT_URI}"
        f"&scope={scope}"
    )

def get_spotify_token(code: str) -> str:
    """
    Exchanges the authorization code for an access token.
    """
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET or not SPOTIFY_REDIRECT_URI:
        raise Exception("Spotify credentials not set in environment variables.")
        
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        }
    )
    response.raise_for_status()
    return response.json()["access_token"]

def fetch_albums_from_spotify(access_token: str) -> List[dict]:
    """
    Fetches the user's top tracks from Spotify and extracts unique albums.
    Returns a list of dicts ready to be inserted into the database.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Fetch user profile to get username/id
    user_resp = requests.get("https://api.spotify.com/v1/me", headers=headers)
    user_resp.raise_for_status()
    user_data = user_resp.json()
    username = user_data["id"] # Use Spotify ID as username
    
    albums_map = {}
    
    # Fetch top tracks (long_term to get all-time favorites)
    # Spotify allows limit up to 50. We can make multiple requests if needed, 
    # but 50 tracks might yield ~30-40 albums. Let's try to get more if possible?
    # For now, let's just get 50.
    params = {
        "limit": 50,
        "time_range": "long_term"
    }
    
    resp = requests.get("https://api.spotify.com/v1/me/top/tracks", headers=headers, params=params)
    resp.raise_for_status()
    data = resp.json()
    
    for item in data.get("items", []):
        album = item["album"]
        
        # Filter out singles and compilations, keep only "album"
        if album.get("album_type") != "album":
            continue
            
        album_name = album["name"]
        
        # Key by name to avoid duplicates
        if album_name not in albums_map:
            # Get largest image
            image_url = ""
            if album["images"]:
                image_url = album["images"][0]["url"]
                
            albums_map[album_name] = {
                "name": album_name,
                "artist_name": album["artists"][0]["name"],
                "url": album["external_urls"]["spotify"],
                "mbid": None, # Spotify doesn't give MBID easily
                "image_url": image_url,
                "playcount": 0, # Spotify doesn't give playcounts per user easily
                "username": username,
                "elo_score": 1500.0,
                "ignored": False,
                "source": "spotify"
            }
            
    return list(albums_map.values()), username
