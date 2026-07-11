import json
import os

with open("res.json", "r", encoding="utf-8") as f:
    data = json.load(f)

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

for hit in data.get("hits", []):
    source = hit["source"]
    name = source.get("name", "").replace("'", "''")
    album = source.get("album", "").replace("'", "''")
    artist = source.get("artists", "").replace("'", "''")
    image = source.get("image", "").replace("'", "''")
    link = source.get("spotify_link", "").replace("'", "''")
    genre = source.get("genres", "Pop").replace("'", "''")

    sql = f"INSERT INTO spotify_track (name, album, artist, image, spotify_link, emotion) VALUES ('{name}', '{album}', '{artist}', '{image}', '{link}', '{genre}');"
    sql_statements.append(sql)

os.makedirs("../database_init", exist_ok=True)
with open("../database_init/init.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_statements))
    f.write("\n")

print("Created ../database_init/init.sql with sample data!")
