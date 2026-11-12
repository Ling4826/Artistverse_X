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
        limit: limit,
        guest: true
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
   * Generate song content analysis using Groq
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
}

// Create and export a singleton instance
const spotifyRecommendService = new SpotifyRecommendService();

export default spotifyRecommendService;