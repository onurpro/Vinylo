import os
import requests
import hashlib
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")
LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0"
LASTFM_SHARED_SECRET = os.getenv("LASTFM_SHARED_SECRET")
LASTFM_REDIRECT_URI = os.getenv("LASTFM_REDIRECT_URI")




def get_data(username: str, page: int) -> Optional[dict]:
    params = {
        'method': 'user.gettopalbums',
        'user': username,
        'api_key': LASTFM_API_KEY,
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
    if not LASTFM_API_KEY:
        print("Error: LASTFM_API_KEY not found in environment variables.")
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

def get_lastfm_auth_url() -> str:
    """
    Returns the URL to redirect the user to for Last.fm authorization.
    """
    if not LASTFM_API_KEY:
        raise Exception("LASTFM_API_KEY not set in environment variables.")
    
    # Last.fm doesn't strictly require a redirect_uri in the auth URL for web apps 
    # if it's configured in the API account, but we can pass it as cb.
    return (
        f"http://www.last.fm/api/auth/"
        f"?api_key={LASTFM_API_KEY}"
        f"&cb={LASTFM_REDIRECT_URI}"
    )

def get_lastfm_session(token: str) -> str:
    """
    Exchanges the authentication token for a session key.
    Returns the username associated with the session.
    """
    if not LASTFM_API_KEY or not LASTFM_SHARED_SECRET:
        raise Exception("Last.fm credentials (LASTFM_API_KEY, SHARED_SECRET) not set.")

    # Generate API signature
    # Sort parameters alphabetically by name
    params = {
        'api_key': LASTFM_API_KEY,
        'method': 'auth.getSession',
        'token': token
    }
    
    # Concatenate name+value (no '=' or '&')
    sorted_params = sorted(params.items())
    sig_str = "".join([f"{k}{v}" for k, v in sorted_params])
    
    # Append secret
    sig_str += LASTFM_SHARED_SECRET
    
    # MD5 hash
    api_sig = hashlib.md5(sig_str.encode('utf-8')).hexdigest()
    
    # Make request
    params['api_sig'] = api_sig
    params['format'] = 'json'
    
    response = requests.get(LASTFM_BASE_URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    if 'session' not in data:
        raise Exception("Failed to obtain Last.fm session")
        
    # We could store the session key if we needed to make write requests
    # session_key = data['session']['key']
    username = data['session']['name']
    
    return username


