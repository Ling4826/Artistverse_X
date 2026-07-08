import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    os.getenv('SPOTIPY_CLIENT_ID'),
    os.getenv('SPOTIPY_CLIENT_SECRET')
))

emotion_queries = {
    "Angry": "genre:metal",
    "Disgusted": "genre:punk",
    "Fearful": "genre:ambient",
    "Happy": "genre:pop",
    "Neutral": "genre:chill",
    "Sad": "genre:sad",
    "Surprised": "genre:electronic"
}

sql_statements = [
    "CREATE DATABASE IF NOT EXISTS ArtistverseX;",
    "USE ArtistverseX;",
    "CREATE TABLE IF NOT EXISTS spotify_track (",
    "    id INT AUTO_INCREMENT PRIMARY KEY,",
    "    name VARCHAR(255) NOT NULL,",
    "    album VARCHAR(255),",
    "    artist VARCHAR(255),",
    "    image VARCHAR(512),",
    "    spotify_link VARCHAR(512),",
    "    emotion VARCHAR(50)",
    ");",
    "TRUNCATE TABLE spotify_track;"
]

for emotion, query in emotion_queries.items():
    print(f"Fetching {emotion} tracks...")
    try:
        results = sp.search(q=query, type='track', limit=20)
        tracks = results['tracks']['items']
        for track in tracks:
            name = track['name'].replace("'", "''")
            album = track['album']['name'].replace("'", "''")
            artist = track['artists'][0]['name'].replace("'", "''")
            image = track['album']['images'][0]['url'] if track['album']['images'] else ""
            spotify_link = track['external_urls'].get('spotify', "")
            
            sql = f"INSERT INTO spotify_track (name, album, artist, image, spotify_link, emotion) VALUES ('{name}', '{album}', '{artist}', '{image}', '{spotify_link}', '{emotion}');"
            sql_statements.append(sql)
    except Exception as e:
        print(f"Error fetching {emotion}: {e}")

os.makedirs("../database_init", exist_ok=True)
with open("../database_init/init.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_statements))
    f.write("\n")

print("Generated database_init/init.sql successfully!")
