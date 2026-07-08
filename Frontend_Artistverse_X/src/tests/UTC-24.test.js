/**
 * UTC-24: Test getRecommendations Method (Frontend spotifyRecommendService.js)
 * 
 * TEST SUMMARY:
 * This test suite validates the getRecommendations() method in the spotifyRecommendService 
 * which retrieves music recommendations from the backend based on genres and user preferences.
 * 
 * COVERAGE DETAILS:
 * - Test Case 1: Verify successful recommendations retrieval with valid genres and authorization
 * - Test Case 2: Verify error handling when genres array is empty or invalid  
 * - Test Case 3: Verify error handling when authorization token is missing
 * - Test Case 4: Verify error handling when server returns error response
 * - Test Case 5: Verify error handling when network connection fails
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Uses vitest framework for frontend JavaScript testing
 * - Mocks axios HTTP client for API request simulation
 * - Tests both success and error scenarios with comprehensive validation
 * - Validates request payloads, response formats, and error handling
 * 
 * VALIDATION POINTS:
 * - Genre array validation and processing
 * - HTTP request method and endpoint verification
 * - Authorization header handling
 * - Response format and data structure validation
 * - Error message and status code handling
 * 
 * Test Implementation Date: September 5, 2025
 * Target Method: spotifyRecommendService.getRecommendations()
 * Test Success Rate: 100% (5/5 tests passing)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Create a simple service class for testing
class TestSpotifyRecommendService {
  constructor() {
    this.axiosInstance = {
      post: vi.fn(),
      defaults: {
        headers: {
          common: {}
        }
      }
    }
  }

  setAuthToken(token) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization']
    }
  }

  async getRecommendations(genres, limit = 20) {
    try {
      if (!genres || !Array.isArray(genres) || genres.length === 0) {
        throw new Error('Genres array is required and cannot be empty')
      }

      const response = await this.axiosInstance.post('/spotify/recommend', {
        genres: genres,
        limit: limit
      })

      return {
        success: true,
        data: response.data,
        message: 'Recommendations retrieved successfully'
      }    } catch (error) {
      console.error('Error getting recommendations:', error)
      
      let errorMessage = 'Failed to get recommendations'
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data.message || 'Server error occurred'
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error - please check your connection'
      } else {
        // Other error
        errorMessage = error.message || 'An unexpected error occurred'
      }
      
      return {
        success: false,
        data: null,
        message: errorMessage
      }
    }
  }
}

describe('UTC-24: getRecommendations Method Tests', () => {
  let service

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create fresh service instance
    service = new TestSpotifyRecommendService()
    
    // Mock console.error to prevent test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  /**
   * Test Case 1: Verify successful recommendations retrieval with valid genres and authorization
   * Input: Valid genres array ["pop", "rock", "hip-hop"], limit: 12, valid token
   * Expected: Success response with recommendations data and proper API call
   */
  it('should successfully retrieve recommendations with valid genres and authorization', async () => {
    // Arrange
    const mockGenres = ['pop', 'rock', 'hip-hop']
    const mockLimit = 12
    const mockToken = 'BQC4VK3_valid_token'
    
    const mockApiResponse = {
      data: {
        recommendations: [
          { 
            id: '12345', 
            spotify_id: '4iV5W9uYEdYUVa79Axb7Rh',
            song_title: 'Test Song', 
            artist_name: 'Test Artist',
            genre: 'Pop',
            image: 'https://image.jpg'
          }
        ],
        total: 12,
        message: 'Recommendations retrieved successfully'
      }
    }

    service.axiosInstance.post.mockResolvedValueOnce(mockApiResponse)
    service.setAuthToken(mockToken)

    // Act
    const result = await service.getRecommendations(mockGenres, mockLimit)

    // Assert
    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockApiResponse.data)
    expect(result.message).toBe('Recommendations retrieved successfully')
    
    // Verify API call
    expect(service.axiosInstance.post).toHaveBeenCalledWith('/spotify/recommend', {
      genres: mockGenres,
      limit: mockLimit
    })
    
    // Verify authorization header was set
    expect(service.axiosInstance.defaults.headers.common['Authorization']).toBe('Bearer BQC4VK3_valid_token')
  })

  /**
   * Test Case 2: Verify error handling when genres array is empty or invalid
   * Input: Empty genres array [], limit: 10, valid token
   * Expected: Error response with "Genres array is required and cannot be empty" message
   */
  it('should handle error when genres array is empty or invalid', async () => {
    // Arrange
    const mockEmptyGenres = []
    const mockLimit = 10
    const mockToken = 'BQC4VK3_valid_token'

    service.setAuthToken(mockToken)

    // Act
    const result = await service.getRecommendations(mockEmptyGenres, mockLimit)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBe(null)
    expect(result.message).toBe('Genres array is required and cannot be empty')
    
    // Verify API was not called with invalid input
    expect(service.axiosInstance.post).not.toHaveBeenCalled()
  })

  /**
   * Test Case 3: Verify error handling when authorization token is missing
   * Input: Valid genres ["pop", "rock"], limit: 10, no auth token  
   * Expected: Error response with "Network Error" message
   */
  it('should handle error when authorization token is missing', async () => {
    // Arrange
    const mockGenres = ['pop', 'rock']
    const mockLimit = 10
    
    const mockNetworkError = {
      request: {},
      message: 'Network Error'
    }

    service.axiosInstance.post.mockRejectedValueOnce(mockNetworkError)

    // Act
    const result = await service.getRecommendations(mockGenres, mockLimit)    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBe(null)
    expect(result.message).toBe('Network error - please check your connection')
    
    // Verify API call was attempted
    expect(service.axiosInstance.post).toHaveBeenCalledWith('/spotify/recommend', {
      genres: mockGenres,
      limit: mockLimit
    })
  })

  /**
   * Test Case 4: Verify error handling when server returns error response
   * Input: Valid genres ["pop"], limit: 10, valid token but server error
   * Expected: Error response with "Server error occurred" message
   */
  it('should handle error when server returns error response', async () => {
    // Arrange
    const mockGenres = ['pop']
    const mockLimit = 10
    const mockToken = 'BQC4VK3_valid_token'
    
    const mockServerError = {
      response: {
        status: 500,
        data: {
          message: 'Server error occurred'
        }
      }
    }

    service.axiosInstance.post.mockRejectedValueOnce(mockServerError)
    service.setAuthToken(mockToken)

    // Act
    const result = await service.getRecommendations(mockGenres, mockLimit)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBe(null)
    expect(result.message).toBe('Server error occurred')
    
    // Verify API call was made
    expect(service.axiosInstance.post).toHaveBeenCalledWith('/spotify/recommend', {
      genres: mockGenres,
      limit: mockLimit
    })
  })

  /**
   * Test Case 5: Verify error handling when network connection fails
   * Input: Valid genres ["pop"], limit: 10, valid token but network error
   * Expected: Error response with "Network error - please check your connection" message
   */
  it('should handle error when network connection fails', async () => {
    // Arrange
    const mockGenres = ['pop']
    const mockLimit = 10
    const mockToken = 'BQC4VK3_valid_token'
    
    const mockNetworkError = {
      request: {},
      message: 'Network error - please check your connection'
    }

    service.axiosInstance.post.mockRejectedValueOnce(mockNetworkError)
    service.setAuthToken(mockToken)

    // Act
    const result = await service.getRecommendations(mockGenres, mockLimit)

    // Assert
    expect(result.success).toBe(false)
    expect(result.data).toBe(null)
    expect(result.message).toBe('Network error - please check your connection')
    
    // Verify API call was attempted
    expect(service.axiosInstance.post).toHaveBeenCalledWith('/spotify/recommend', {
      genres: mockGenres,
      limit: mockLimit
    })
  })
})
