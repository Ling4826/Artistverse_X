// service/SearchService.js
class SearchService {
  constructor() {
    this.baseURL = '/api';
    this.defaultTimeout = 10000; // 10 seconds
  }

  /**
   * Search for songs/artists/genres
   * @param {string} query - Search query
   * @param {string} field - Field to search in ('name', 'artists', 'genres')
   * @param {number} size - Number of results to return
   * @returns {Promise} API response
   */
  async search(query, field = 'name', size = 20) {
    if (!query || !query.trim()) {
      throw new Error('Search query is required');
    }

    const params = new URLSearchParams({
      q: query.trim(),
      field: field,
      size: size.toString()
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(`${this.baseURL}/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Search endpoint not found');
        } else if (response.status >= 500) {
          throw new Error('Server error occurred');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.hits || !Array.isArray(data.hits)) {
        throw new Error('Invalid response format from server');
      }

      return this.transformSearchResponse(data);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Search request timed out');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;    }
  }

  /**
   * Get all songs (for initial display)
   * @param {number} size - Number of results to return
   * @returns {Promise} API response
   */
  async getAllSongs(size = 20) {
    const params = new URLSearchParams({
      size: size.toString()
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(`${this.baseURL}/songs?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.hits || !Array.isArray(data.hits)) {
        throw new Error('Invalid response format from server');
      }

      return this.transformSearchResponse(data);

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  /**
   * Transform API response to frontend format
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Transformed response
   */
  transformSearchResponse(apiResponse) {
    return {
      query: apiResponse.query,
      field: apiResponse.field,
      totalResults: apiResponse.total !== undefined ? apiResponse.total : apiResponse.hits.length,
      results: apiResponse.hits.map(hit => ({
        id: hit.id,
        name: hit.source.name,
        artists: hit.source.artists,
        genres: this.formatGenres(hit.source.genres),
        year: hit.source.year,
        score: hit.score,
        image: hit.source.image,
        // Add more fields as needed
        rawData: hit.source // Keep original data for detailed view
      }))
    };
  }
  /**
   * Format genres from API response
   * @param {string|Array} genres - Genres data
   * @returns {string} Formatted genres string
   */
  formatGenres(genres) {
    if (!genres) return 'No Genre';
    
    // Handle genres that come as string representation of array
    if (typeof genres === 'string') {
      // Handle empty array case: "[]"
      if (genres.trim() === '[]' || genres.trim() === '') {
        return 'No Genre';
      }
      
      // Remove brackets and quotes, then split
      const cleaned = genres.replace(/[[\]']/g, '');
      const genreArray = cleaned.split(',').map(g => g.trim()).filter(g => g);
      
      // If after filtering, no genres left
      if (genreArray.length === 0) {
        return 'No Genre';
      }
      
      return genreArray.slice(0, 3).join(', '); // Show max 3 genres
    }
    
    // Handle if it's already an array
    if (Array.isArray(genres)) {
      if (genres.length === 0) {
        return 'No Genre';
      }
      return genres.slice(0, 3).join(', ');
    }
    
    return genres || 'No Genre';
  }

  /**
   * Get search suggestions (could be implemented later)
   * @param {string} query - Partial query
   * @returns {Promise} Suggestions array
   */
  async getSuggestions(query) {
    // Placeholder for autocomplete functionality
    // Could call a different endpoint or use cached data
    return [];
  }

  /**
   * Get trending searches (could be implemented later)
   * @returns {Promise} Trending searches array
   */
  async getTrendingSearches() {
    // Placeholder for trending functionality
    return [];
  }

  /**
   * Validate search parameters
   * @param {string} query - Search query
   * @param {string} field - Search field
   * @param {number} size - Result size
   * @returns {Object} Validation result
   */
  validateSearchParams(query, field, size) {
    const errors = [];
    
    if (!query || query.trim().length < 2) {
      errors.push('Search query must be at least 2 characters long');
    }
    
    const validFields = ['name', 'artists', 'genres'];
    if (!validFields.includes(field)) {
      errors.push(`Invalid search field. Must be one of: ${validFields.join(', ')}`);
    }
    
    if (size < 1 || size > 100) {
      errors.push('Result size must be between 1 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const searchService = new SearchService();

export default searchService;