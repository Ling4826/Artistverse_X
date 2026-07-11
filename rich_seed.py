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
    'CREATE DATABASE IF NOT EXISTS ArtistverseX;',
    'USE ArtistverseX;',
    'CREATE TABLE IF NOT EXISTS spotify_track (',
    '    id INT AUTO_INCREMENT PRIMARY KEY,',
    '    name VARCHAR(255) NOT NULL,',
    '    album VARCHAR(255),',
    '    artist VARCHAR(255),',
    '    image VARCHAR(512),',
    '    spotify_link VARCHAR(512),',
    '    emotion VARCHAR(50)',
    ');',
    'TRUNCATE TABLE spotify_track;'
]

for emotion, query in emotion_queries.items():
    res = requests.get(
        f'https://api.spotify.com/v1/search?q={query}&type=track&limit=30',
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

with open('database_init/init.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))
    f.write("\n")
print('Created rich init.sql!')
