from flask import jsonify, request, redirect, session
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

class SpotifyAuthController:
    def __init__(self):
        self.client_id = os.getenv('SPOTIPY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('REDIRECT_URI')
        self.scope = "user-read-private user-read-email playlist-read-private user-top-read user-read-recently-played"
        
        self.sp_oauth = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope,
            show_dialog=True  # Force show login dialog
        )

    def get_login_url(self):
        """Generate Spotify login URL"""
        try:
            # Add state parameter to force new login
            state = str(uuid.uuid4())
            auth_url = self.sp_oauth.get_authorize_url(state=state)
            return jsonify({
                'success': True,
                'auth_url': auth_url
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def handle_callback(self):
        """Handle Spotify callback and exchange code for access token"""
        try:
            code = request.args.get('code')
            error = request.args.get('error')
            
            if error:
                return jsonify({
                    'success': False,
                    'error': f'Spotify authorization error: {error}'
                }), 400
            
            if not code:
                return jsonify({
                    'success': False,
                    'error': 'No authorization code received'
                }), 400

            # Clear any cached token info
            self.sp_oauth.cache_handler.save_token_to_cache(None)
            
            # Exchange code for access token
            token_info = self.sp_oauth.get_access_token(code)
            
            if not token_info:
                return jsonify({
                    'success': False,
                    'error': 'Failed to get access token'
                }), 400

            # Get user profile
            sp = spotipy.Spotify(auth=token_info['access_token'])
            user_profile = sp.current_user()
            
            # User login logged
            print(f"New user logged in: {user_profile['id']} - {user_profile.get('display_name')}")
            
            return jsonify({
                'success': True,
                'access_token': token_info['access_token'],
                'refresh_token': token_info['refresh_token'],
                'expires_at': token_info['expires_at'],
                'user': {
                    'id': user_profile['id'],
                    'display_name': user_profile['display_name'],
                    'email': user_profile['email'],
                    'images': user_profile['images'],
                    'followers': user_profile['followers']['total']
                }
            })
        except Exception as e:
            print(f"Callback error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def refresh_token(self):
        """Refresh access token using refresh token"""
        try:
            data = request.get_json()
            refresh_token = data.get('refresh_token')
            
            if not refresh_token:
                return jsonify({
                    'success': False,
                    'error': 'Refresh token is required'
                }), 400

            # Refresh the token
            token_info = self.sp_oauth.refresh_access_token(refresh_token)
            
            return jsonify({
                'success': True,
                'access_token': token_info['access_token'],
                'refresh_token': token_info.get('refresh_token', refresh_token),
                'expires_at': token_info['expires_at']
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def get_user_profile(self):
        """Get current user profile"""
        try:
            # Get access token from request headers
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'success': False,
                    'error': 'Access token is required'
                }), 401

            access_token = auth_header.split(' ')[1]
            
            # Create Spotify client with access token
            sp = spotipy.Spotify(auth=access_token)
            user_profile = sp.current_user()
            
            # Profile fetch logged
            print(f"Profile requested for user: {user_profile['id']}")
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user_profile['id'],
                    'display_name': user_profile['display_name'],
                    'email': user_profile['email'],
                    'images': user_profile['images'],
                    'followers': user_profile['followers']['total']
                }
            })
        except Exception as e:
            print(f"Profile fetch error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def validate_token(self):
        """Validate if access token is still valid"""
        try:
            # Get access token from request headers
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'success': False,
                    'valid': False,
                    'error': 'Access token is required'
                }), 401

            access_token = auth_header.split(' ')[1]
            
            # Try to make a simple API call to validate token
            sp = spotipy.Spotify(auth=access_token)
            user_data = sp.current_user()
            
            # Return user info for verification
            return jsonify({
                'success': True,
                'valid': True,
                'user_id': user_data['id']
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'valid': False,
                'error': str(e)
            }), 401

    # Method for logout/revoke token
    def logout(self):
        """Logout and revoke token"""
        try:
            # Clear cache
            self.sp_oauth.cache_handler.save_token_to_cache(None)
            
            return jsonify({
                'success': True,
                'message': 'Logged out successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def get_user_top_genres(self):
        """Get user's top genres from their top artists"""
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'success': False, 'error': 'Access token required'}), 401
            
            access_token = auth_header.split(' ')[1]
            sp = spotipy.Spotify(auth=access_token)
            
            # Fetch top artists
            top_artists = sp.current_user_top_artists(limit=50, time_range='medium_term')
            
            # Aggregate genres
            genre_counts = {}
            for artist in top_artists['items']:
                for genre in artist.get('genres', []):
                    genre_counts[genre] = genre_counts.get(genre, 0) + 1
                    
            # Sort genres by count
            sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
            top_genres = [g[0] for g in sorted_genres[:10]] # Return top 10 genres
            
            return jsonify({
                'success': True,
                'genres': top_genres
            })
        except Exception as e:
            print(f"Fetch top genres error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def get_user_top_artists(self):
        """Get user's top artists"""
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'success': False, 'error': 'Access token required'}), 401
            
            access_token = auth_header.split(' ')[1]
            sp = spotipy.Spotify(auth=access_token)
            
            # Fetch top artists
            top_artists = sp.current_user_top_artists(limit=8, time_range='short_term')
            
            artists_data = []
            for artist in top_artists['items']:
                image_url = None
                if artist.get('images'):
                    image_url = artist['images'][0]['url']
                artists_data.append({
                    'id': artist['id'],
                    'name': artist['name'],
                    'image': image_url,
                    'spotify_url': artist.get('external_urls', {}).get('spotify')
                })
            
            return jsonify({
                'success': True,
                'artists': artists_data
            })
        except Exception as e:
            print(f"Fetch top artists error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500