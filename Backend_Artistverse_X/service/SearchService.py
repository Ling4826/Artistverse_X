from flask import jsonify
import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from database.db_connection import create_connection, close_connection

class SearchService:
    def __init__(self):
        # We now use MySQL instead of Elasticsearch
        pass

    def get_all_songs(self, size=20, sort_by="score"):
        """
        Get all songs from the database (for initial display)
        """
        conn = None
        try:
            conn = create_connection()
            cursor = conn.cursor(dictionary=True)
            # Fetch random songs to show on homepage
            query = "SELECT id, name, album, artist as artists, image, spotify_link, emotion as genres FROM spotify_track ORDER BY RAND() LIMIT %s"
            cursor.execute(query, (size,))
            records = cursor.fetchall()
            
            cursor.execute("SELECT COUNT(*) as total FROM spotify_track")
            total_records = cursor.fetchone()["total"]

            results = []
            for hit in records:
                results.append({
                    "id": hit["id"],
                    "score": 1.0,
                    "source": {
                        "name": hit["name"],
                        "artists": hit["artists"],
                        "album": hit["album"],
                        "image": hit["image"],
                        "spotify_link": hit["spotify_link"],
                        "genres": hit["genres"],
                        "year": "" # Database currently has no year
                    }
                })

            return jsonify({
                "query": "",
                "field": "all",
                "hits": results,
                "total": total_records
            })

        except Exception as e:
            raise RuntimeError(f"Failed to get songs: {str(e)}")
        finally:
            if conn:
                close_connection(conn)
            
    def search(self, query_text, field="name", size=10):
        """
        Search for songs in MySQL
        """
        conn = None
        try:
            conn = create_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Map frontend fields to DB columns
            if field == "artists":
                db_field = "artist"
            elif field == "genres":
                db_field = "emotion"
            else:
                db_field = "name"

            sql = f"SELECT id, name, album, artist as artists, image, spotify_link, emotion as genres FROM spotify_track WHERE {db_field} LIKE %s LIMIT %s"
            search_param = f"%{query_text}%"
            cursor.execute(sql, (search_param, size))
            records = cursor.fetchall()
            
            count_sql = f"SELECT COUNT(*) as total FROM spotify_track WHERE {db_field} LIKE %s"
            cursor.execute(count_sql, (search_param,))
            total_records = cursor.fetchone()["total"]

            results = []
            
            # --- Fallback to Spotify API if no local results ---
            if len(records) == 0:
                try:
                    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
                        client_id=os.getenv('SPOTIPY_CLIENT_ID'),
                        client_secret=os.getenv('SPOTIPY_CLIENT_SECRET')
                    ))
                    
                    sp_query = query_text
                    if field == "artists":
                        sp_query = f"artist:{query_text}"
                    elif field == "genres":
                        sp_query = f"genre:{query_text}"
                    requested_size = int(size)
                    total_records = 0
                    
                    # Spotify API limits some searches to 10 items per request, so we chunk them
                    for offset in range(0, requested_size, 10):
                        chunk_limit = min(10, requested_size - offset)
                        sp_results = sp.search(q=sp_query, type='track', limit=chunk_limit, offset=offset)
                        
                        if sp_results and 'tracks' in sp_results and 'items' in sp_results['tracks']:
                            total_records = sp_results['tracks']['total']
                            items = sp_results['tracks']['items']
                            
                            if not items:
                                break # No more items from Spotify
                                
                            for track in items:
                                image_url = None
                                if track['album']['images']:
                                    image_url = track['album']['images'][0]['url']
                                    
                                results.append({
                                    "id": track['id'],
                                    "score": 1.0,
                                    "source": {
                                        "name": track['name'],
                                        "artists": ", ".join([a['name'] for a in track['artists']]),
                                        "album": track['album']['name'],
                                        "image": image_url,
                                        "spotify_link": track.get('external_urls', {}).get('spotify', ''),
                                        "genres": "Unknown", # Spotify search doesn't return track genres directly
                                        "year": track['album']['release_date'].split('-')[0] if track['album'].get('release_date') else ""
                                    }
                                })
                        else:
                            break
                except Exception as e:
                    print(f"Spotify API fallback error: {str(e)}")
                    raise RuntimeError(f"Spotify Search Failed: {str(e)}")
            # --------------------------------------------------
            
            for hit in records:
                results.append({
                    "id": hit["id"],
                    "score": 1.0, # Dummy score since MySQL LIKE doesn't have TF-IDF score
                    "source": {
                        "name": hit["name"],
                        "artists": hit["artists"],
                        "album": hit["album"],
                        "image": hit["image"],
                        "spotify_link": hit["spotify_link"],
                        "genres": hit["genres"],
                        "year": ""
                    }
                })

            return jsonify({
                "query": query_text,
                "field": field,
                "hits": results,
                "total": total_records
            })

        except Exception as e:
            raise RuntimeError(f"Search failed: {str(e)}")
        finally:
            if conn:
                close_connection(conn)
