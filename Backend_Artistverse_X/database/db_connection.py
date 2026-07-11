import mysql.connector


import os
from dotenv import load_dotenv

load_dotenv()

def create_connection():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "ArtistverseX"),
        database=os.getenv("DB_NAME", "ArtistverseX")
    )
    return connection

def close_connection(connection):
    connection.close()
