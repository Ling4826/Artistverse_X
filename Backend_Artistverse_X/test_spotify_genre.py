import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os
from dotenv import load_dotenv

load_dotenv('d:\\Artistverse_X\\Backend_Artistverse_X\\.env')

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv('SPOTIPY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIPY_CLIENT_SECRET')
))

try:
    res = sp.search(q='genre:Pop', type='track', limit=5)
    print("genre:Pop ->", len(res['tracks']['items']))
    
    res = sp.search(q='genre:pop', type='track', limit=5)
    print("genre:pop ->", len(res['tracks']['items']))
    
    res = sp.search(q='genre:"pop"', type='track', limit=5)
    print("genre:\"pop\" ->", len(res['tracks']['items']))
except Exception as e:
    print("Error:", e)
