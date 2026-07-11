/**
 * UTC-22: Test handleCallback Method (Frontend auth.js)
 * 
 * TEST SUMMARY:
 * This test suite validates the handleCallback() method in the auth store which processes 
 * the authorization code from Spotify's OAuth callback and exchanges it for access tokens.
 * 
 * COVERAGE DETAILS:
 * - Tests successful callback handling with valid authorization code
 * - Tests error handling when authorization code is missing
 * - Tests error handling when backend callback API fails  
 * - Tests localStorage synchronization after successful callback
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Uses vitest framework for frontend JavaScript testing
 * - Mocks fetch API to simulate backend responses
 * - Mocks localStorage to verify token storage
 * - Uses createPinia() for proper store state management during tests
 * 
 * VALIDATION POINTS:
 * - Authorization code parameter processing
 * - Backend API communication for token exchange
 * - User authentication state updates
 * - Error handling and loading state management
 * - Token persistence in localStorage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('UTC-22: handleCallback Method Tests', () => {
  let authStore

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create fresh pinia instance for each test
    setActivePinia(createPinia())
    authStore = useAuthStore()
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
  })

  /**
   * Test Case 1: Verify successful callback handling with valid authorization code
   * Input: Valid authorization code "valid_auth_code_12345"
   * Expected: Success response with user data and tokens, localStorage updated
   */
  it('should handle successful callback with valid authorization code', async () => {    // Arrange
    const mockAuthCode = 'valid_auth_code_12345'
    const mockSuccessResponse = {
      success: true,
      user: {
        id: 'spotify_user_123',
        display_name: 'John Doe',
        email: 'john@example.com'
      },
      access_token: 'BQC4WK3...',
      refresh_token: 'AQD5xL2...',
      expires_at: '1725456000'
    }

    // Mock successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse
    })

    // Act
    const result = await authStore.handleCallback(mockAuthCode)    // Assert
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/callback?code=valid_auth_code_12345'
    )
    expect(result).toBe(true)
    expect(authStore.isLoading).toBe(false)
    
    // Verify localStorage was called (tokens should be stored)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  /**
   * Test Case 2: Verify error handling when authorization code is missing
   * Input: null authorization code
   * Expected: Error response with callback handling failed message
   */
  it('should handle error when authorization code is missing', async () => {
    // Arrange
    const mockAuthCode = null
    const mockErrorResponse = {
      success: false,
      error: 'Callback handling failed',
      authDataSet: false,
      isLoading: false
    }

    // Mock error fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse
    })    // Act & Assert
    await expect(authStore.handleCallback(mockAuthCode)).rejects.toThrow('Callback handling failed')

    // Assert additional behavior
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/callback?code=null'
    )
    expect(authStore.isLoading).toBe(false)
  })

  /**
   * Test Case 3: Verify error handling when backend callback API fails
   * Input: Valid code but invalid response from backend
   * Expected: Error response with callback handling failed message
   */
  it('should handle error when backend callback API fails', async () => {
    // Arrange
    const mockAuthCode = 'invalid_code_123'
    const mockErrorResponse = {
      success: false,
      error: 'Callback handling failed',
      authDataSet: false,
      isLoading: false
    }

    // Mock failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorResponse
    })    // Act & Assert
    await expect(authStore.handleCallback(mockAuthCode)).rejects.toThrow('Callback handling failed')

    // Assert additional behavior
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/callback?code=invalid_code_123'
    )
    expect(authStore.isLoading).toBe(false)
  })

  /**
   * Test Case 4: Verify localStorage synchronization after successful callback
   * Input: Valid authorization code
   * Expected: User data and tokens stored in localStorage correctly
   */
  it('should synchronize localStorage after successful callback', async () => {    // Arrange
    const mockAuthCode = 'valid_auth_code_12345'
    const mockSuccessResponse = {
      success: true,
      user: {
        id: 'spotify_user_123',
        display_name: 'John Doe',
        email: 'john@example.com'
      },
      access_token: 'BQC4WK3...',
      refresh_token: 'AQD5xL2...',
      expires_at: '1725456000'
    }

    // Mock successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse
    })    // Act
    const result = await authStore.handleCallback(mockAuthCode)

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/callback?code=valid_auth_code_12345'
    )
    expect(result).toBe(true)
    expect(authStore.isLoading).toBe(false)
      // Verify localStorage synchronization
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spotify_access_token', 
      'BQC4WK3...'
    )
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spotify_refresh_token', 
      'AQD5xL2...'
    )
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spotify_expires_at', 
      '1725456000'
    )
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spotify_user', 
      JSON.stringify({
        id: 'spotify_user_123',
        display_name: 'John Doe',
        email: 'john@example.com'
      })
    )
  })
})
