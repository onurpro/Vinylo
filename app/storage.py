import json
import os
from .models import Album

def get_filename(username):
    return f"{username}_data.json"

def save_data(username, albums):
    filename = get_filename(username)
    data = [album.to_dict() for album in albums]
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
        print(f"Successfully saved data for {username} to {filename}")
    except Exception as e:
        print(f"Error saving data: {e}")

def load_data(username):
    filename = get_filename(username)
    if not os.path.exists(filename):
        return None
    
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        albums = [Album.from_dict(item) for item in data]
        print(f"Successfully loaded {len(albums)} albums for {username} from {filename}")
        return albums
    except Exception as e:
        print(f"Error loading data: {e}")
        return None
