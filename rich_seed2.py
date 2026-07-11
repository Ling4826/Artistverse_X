import os, requests, base64
from dotenv import load_dotenv

load_dotenv('Backend_Artistverse_X/.env')
client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')

auth_str = f"{client_id}:{client_secret}"
b64_auth_str = base64.b64encode(auth_str.encode()).decode()

response = requests.post(
    'https://accounts.spotify.com/api/token',
    data={'grant_type': 'client_credentials'},
    headers={'Authorization': f'Basic {b64_auth_str}', 'Content-Type': 'application/x-www-form-urlencoded'}
)
token = response.json().get('access_token')

emotion_queries = {
    'Angry': 'genre:metal',
    'Disgusted': 'genre:punk',
    'Fearful': 'genre:ambient',
    'Happy': 'genre:pop',
    'Neutral': 'genre:chill',
    'Sad': 'genre:sad',
    'Surprised': 'genre:electronic'
}

sql_statements = [
    'CREATE DATABASE IF NOT EXISTS ArtistverseX CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    'USE ArtistverseX;',
    'DROP TABLE IF EXISTS spotify_track;',
    'CREATE TABLE IF NOT EXISTS spotify_track (',
    '    id INT AUTO_INCREMENT PRIMARY KEY,',
    '    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,',
    '    album VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,',
    '    artist VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,',
    '    image VARCHAR(512),',
    '    spotify_link VARCHAR(512),',
    '    emotion VARCHAR(50)',
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;',
    'TRUNCATE TABLE spotify_track;'
]

import time

for emotion, query in emotion_queries.items():
    print(f"Fetching {emotion}...")
    for offset in range(0, 300, 10):
        try:
            res = requests.get(
                f'https://api.spotify.com/v1/search?q={query}&type=track&limit=10&offset={offset}',
                headers={'Authorization': f'Bearer {token}'}
            )
            data = res.json()
            if 'tracks' in data:
                for track in data['tracks']['items']:
                    name = track['name'].replace("'", "''")
                    album = track['album']['name'].replace("'", "''")
                    artist = track['artists'][0]['name'].replace("'", "''")
                    image = track['album']['images'][0]['url'] if track['album']['images'] else ''
                    link = track['external_urls'].get('spotify', '')
                    sql = f"INSERT INTO spotify_track (name, album, artist, image, spotify_link, emotion) VALUES ('{name}', '{album}', '{artist}', '{image}', '{link}', '{emotion}');"
                    sql_statements.append(sql)
            time.sleep(0.1) # Be nice to Spotify API
        except Exception as e:
            print(f"Error fetching {emotion} at offset {offset}: {e}")

with open('init.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
    f.write("\n")
print('Created rich init.sql with 210 tracks!')
