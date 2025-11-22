import os
import requests

from .models import Album
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = "http://ws.audioscrobbler.com/2.0"

def getData(username, pageNumber):

    params = {
        'method': 'user.gettopalbums',
        'user': username,
        'api_key': API_KEY,
        'format': 'json',
        'limit': 1000,
        'page': pageNumber
    }
        
    try:
        response = requests.get(BASE_URL, params=params) 

        # print(response.url) # DEBUG LINE

        response.raise_for_status()
        data = response.json()

        if 'error' in data:
            print(f"Last.fm API Error: {data['message']} (Code: {data['error']})") # DEBUG LINE

        return data
    
    except requests.exceptions.RequestException as e:
        print(f"HTTP Error occurred: {e}")

        try:
            errorData = e.response.json()
            if 'error' in errorData:
                print(f"Last.fm API Error (from {e.response.status_code}): {errorData['message']} (Code: {errorData['error']})") # DEBUG LINE
        except requests.exceptions.JSONDecodeError:
            print(f"HTTP Error Body (non-JSON): {e.response.text}") # DEBUG LINE

        return None
    
    except requests.exceptions.RequestException as req_err:
        print(f"A network error occured: {req_err}") # DEBUG LINE


def parseAlbums(data, list, pageNumber, totalPages):
    print(f"getting albums: {pageNumber/totalPages*100}%") # DEBUG LINE
    for item in data['topalbums']['album']:
        album = Album(
            name=item['name'],
            url=item['url'],
            mbid=item['mbid'],
            artistName=item['artist']['name'],
            imageURL=item['image'][-1]['#text']
        )
        album.playcount = int(item.get('playcount', 0))
        list.append(album)    


def getAlbums(username):
    # TODO: Album filtering
    # TODO: Album Caching for faster performance
    albumList = []
    data = getData(username, 1)
    
    if data is None:
        print("Could not fetch initial album data. Aborting.") # DEBUG LINE
        return[]
    
    totalPages = int(data['topalbums']['@attr']['totalPages'])
    
    parseAlbums(data, albumList, 1, totalPages)
    
    if totalPages > 1:
        for page in range(2, totalPages + 1):
            parseAlbums(getData(username, page), albumList, page, totalPages)

    print(f"Succesfully found {len(albumList)} albums")

    return albumList
