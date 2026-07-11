import axios from 'axios';

// Use environment variable if available, otherwise fallback to proxy endpoint
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || '/api';

class SpotifyRecommendService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        if (error.response) {
          // Server responded with error status
          throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.request) {
          // Network error
          throw new Error('Network error - please check your connection');
        } else {
          // Other error
          throw new Error('An unexpected error occurred');
        }
      }
    );
  }
  /**
   * Set authorization token for requests
   * @param {string} token - Access token
   */
  setAuthToken(token) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get song recommendations based on genres
   * @param {Array} genres - Array of genre strings
   * @param {number} limit - Number of recommendations to return (default: 20)
   * @returns {Promise<Object>} Response containing recommendations and status
   */
  async getRecommendations(genres, limit = 20) {
    try {
      if (!genres || !Array.isArray(genres) || genres.length === 0) {
        throw new Error('Genres array is required and cannot be empty');
      }

      const response = await this.axiosInstance.post('/spotify/recommend', {
        genres: genres,
        limit: limit
      });

      return {
        success: true,
        data: response.data,
        message: 'Recommendations retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get recommendations'
      };
    }
  }

  /**
   * Get detailed information about a specific track
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} Response containing track details
   */
  async getTrackDetails(trackId) {
    try {
      if (!trackId) {
        throw new Error('Track ID is required');
      }

      const response = await this.axiosInstance.get(`/spotify/track/${trackId}`);

      return {
        success: true,
        data: response.data,
        message: 'Track details retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting track details:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get track details'
      };
    }
  }

  /**
   * Get audio features for a specific track
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} Response containing audio features
   */
  async getAudioFeatures(trackId) {
    try {
      if (!trackId) {
        throw new Error('Track ID is required');
      }

      const response = await this.axiosInstance.get(`/spotify/audio-features/${trackId}`);

      return {
        success: true,
        data: response.data,
        message: 'Audio features retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting audio features:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get audio features'
      };
    }
  }

  /**
   * Search for tracks by query
   * @param {string} query - Search query string
   * @param {number} limit - Number of results to return (default: 20)
   * @returns {Promise<Object>} Response containing search results
   */
  async searchTracks(query, limit = 20) {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required and must be a string');
      }

      const response = await this.axiosInstance.get('/spotify/search', {
        params: {
          q: query,
          limit: limit,
          type: 'track'
        }
      });

      return {
        success: true,
        data: response.data,
        message: 'Search completed successfully'
      };
    } catch (error) {
      console.error('Error searching tracks:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to search tracks'
      };
    }
  }

  /**
   * Get available genres from Spotify
   * @returns {Promise<Object>} Response containing available genres
   */
  async getAvailableGenres() {
    try {
      const response = await this.axiosInstance.get('/spotify/genres');

      return {
        success: true,
        data: response.data,
        message: 'Genres retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting genres:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get genres'
      };
    }
  }

  /**
   * Get recommendations with advanced options
   * @param {Object} options - Advanced recommendation options
   * @param {Array} options.genres - Array of genres
   * @param {number} options.limit - Number of recommendations
   * @param {Object} options.features - Audio features constraints (energy, valence, etc.)
   * @returns {Promise<Object>} Response containing recommendations
   */
  async getAdvancedRecommendations(options) {
    try {
      if (!options || !options.genres || !Array.isArray(options.genres)) {
        throw new Error('Options with genres array is required');
      }

      const requestData = {
        genres: options.genres,
        limit: options.limit || 20,
        ...options.features
      };

      const response = await this.axiosInstance.post('/spotify/recommend/advanced', requestData);

      return {
        success: true,
        data: response.data,
        message: 'Advanced recommendations retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting advanced recommendations:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to get advanced recommendations'
      };
    }  }

  /**
   * Generate song content analysis using ChatGPT
   * @param {Object} songData - Song information for content generation
   * @param {string} songData.songTitle - Title of the song
   * @param {string} songData.artistName - Name of the artist
   * @param {string} songData.genre - Genre of the song
   * @param {string} songData.mood - Mood of the song
   * @param {Array} songData.keywords - Keywords associated with the song
   * @returns {Promise<Object>} Response containing generated content
   */
  async generateSongContent(songData) {
    try {
      if (!songData || !songData.songTitle || !songData.artistName) {
        throw new Error('Song title and artist name are required');
      }

      const response = await this.axiosInstance.post('/spotify/generate-content', {
        song_title: songData.songTitle,
        artist_name: songData.artistName,
        genre: songData.genre,
        mood: songData.mood,
        keywords: songData.keywords
      });

      return {
        success: true,
        data: response.data,
        message: 'Song content generated successfully'
      };
    } catch (error) {
      console.error('Error generating song content:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to generate song content'
      };
    }
  }

  /**
   * Validate if the API is accessible
   * @returns {Promise<boolean>} True if API is accessible
   */
  async validateApiConnection() {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('API connection validation failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const spotifyRecommendService = new SpotifyRecommendService();

export default spotifyRecommendService;