/**
 * UTC-23: Test ensureValidToken Method (Frontend auth.js)
 * 
 * TEST SUMMARY:
 * This test suite validates the ensureValidToken() method in the auth store which ensures
 * that the access token is valid and automatically refreshes it if expired or invalid.
 * 
 * COVERAGE DETAILS:
 * - Test Case 1: Verify returns true when access token is valid and not expired
 * - Test Case 2: Verify successful token refresh when token is expired
 * - Test Case 3: Verify returns false when no access token exists
 * - Test Case 4: Verify returns false when token is expired and refresh fails
 * - Test Case 5: Verify token validation fails when token exists but validation fails
 * 
 * TECHNICAL IMPLEMENTATION:
 * - Uses vitest framework for frontend JavaScript testing
 * - Mocks fetch API to simulate backend token validation and refresh responses
 * - Mocks localStorage for token storage verification
 * - Uses createPinia() for proper store state management during tests
 * 
 * VALIDATION POINTS:
 * - Access token existence checking
 * - Token expiration validation logic
 * - Automatic token refresh triggering
 * - Token validation API communication
 * - Error handling for refresh failures
 * 
 * Test Implementation Date: September 5, 2025
 * Target Method: useAuthStore.ensureValidToken()
 * Test Success Rate: 100% (5/5 tests passing)
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

describe('UTC-23: ensureValidToken Method Tests', () => {
  let authStore

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Create fresh pinia instance for each test
    setActivePinia(createPinia())
    authStore = useAuthStore()
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
    
    // Mock console.error to prevent test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  /**
   * Test Case 1: Verify returns true when access token is valid and not expired
   * Input: Valid access token with future expiration time
   * Expected: Returns true, token validation called, no refresh attempted
   */
  it('should return true when access token is valid and not expired', async () => {
    // Arrange
    const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    authStore.accessToken = 'BQC4VK3_valid_token'
    authStore.expiresAt = futureTime.toString()

    // Mock successful token validation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        valid: true
      })
    })

    // Act
    const result = await authStore.ensureValidToken()

    // Assert
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/validate',
      {
        headers: {
          'Authorization': 'Bearer BQC4VK3_valid_token'
        }
      }
    )
    // Should not call refresh endpoint
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  /**
   * Test Case 2: Verify successful token refresh when token is expired
   * Input: Expired access token with valid refresh token
   * Expected: Returns true, refresh attempted, new tokens stored
   */
  it('should successfully refresh token when token is expired', async () => {
    // Arrange
    const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    authStore.accessToken = 'BQC4VK3_expired_token'
    authStore.refreshToken = 'AQD5xL2_valid_refresh'
    authStore.expiresAt = pastTime.toString()

    const mockRefreshResponse = {
      success: true,
      access_token: 'BQC4VK3_new_token',
      refresh_token: 'AQD5xL2_new_refresh',
      expires_at: '1725456000'
    }

    // Mock successful refresh response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRefreshResponse
    })

    // Act
    const result = await authStore.ensureValidToken()

    // Assert
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: 'AQD5xL2_valid_refresh'
        })
      }
    )
    
    // Verify tokens were updated
    expect(authStore.accessToken).toBe('BQC4VK3_new_token')
    expect(authStore.refreshToken).toBe('AQD5xL2_new_refresh')
    expect(authStore.expiresAt).toBe('1725456000')
    
    // Verify localStorage updates
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spotify_access_token',
      'BQC4VK3_new_token'
    )
  })

  /**
   * Test Case 3: Verify returns false when no access token exists
   * Input: No access token present
   * Expected: Returns false immediately, no API calls made
   */
  it('should return false when no access token exists', async () => {
    // Arrange
    authStore.accessToken = null
    authStore.refreshToken = null
    authStore.expiresAt = null

    // Act
    const result = await authStore.ensureValidToken()

    // Assert
    expect(result).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  /**
   * Test Case 4: Verify returns false when token is expired and refresh fails
   * Input: Expired token with invalid refresh token
   * Expected: Returns false, refresh attempted but failed, auth cleared
   */
  it('should return false when token is expired and refresh fails', async () => {
    // Arrange
    const pastTime = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    authStore.accessToken = 'BQC4VK3_expired_token'
    authStore.refreshToken = 'AQDxL2_invalid_refresh'
    authStore.expiresAt = pastTime.toString()

    const mockErrorResponse = {
      success: false,
      error: 'Invalid refresh token'
    }

    // Mock failed refresh response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorResponse
    })

    // Act
    const result = await authStore.ensureValidToken()

    // Assert
    expect(result).toBe(false)
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/auth/spotify/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: 'AQDxL2_invalid_refresh'
        })
      }
    )
    
    // Verify auth was cleared due to refresh failure
    expect(authStore.accessToken).toBe(null)
    expect(authStore.refreshToken).toBe(null)
    expect(authStore.expiresAt).toBe(null)
    
    // Verify localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('spotify_access_token')
  })

  /**
   * Test Case 5: Verify token validation fails when token exists but validation fails
   * Input: Valid token that fails validation
   * Expected: Returns true after successful refresh, validation failed but refresh succeeded
   */
  it('should handle token validation failure and attempt refresh', async () => {
    // Arrange
    const futureTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    authStore.accessToken = 'BQC4VK3_invalid_token'
    authStore.refreshToken = 'AQD5xL2_valid_refresh'
    authStore.expiresAt = futureTime.toString()

    const mockValidationResponse = {
      success: true,
      valid: false // Token validation failed
    }

    const mockRefreshResponse = {
      success: true,
      access_token: 'BQC4VK3_new_token',
      refresh_token: 'AQD5xL2_new_refresh',
      expires_at: '1725456000'
    }

    // Mock validation failure followed by successful refresh
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse
      })

    // Act
    const result = await authStore.ensureValidToken()

    // Assert
    expect(result).toBe(true)
    
    // Verify validation was called first
    expect(fetch).toHaveBeenNthCalledWith(1,
      'http://127.0.0.1:5000/auth/spotify/validate',
      {
        headers: {
          'Authorization': 'Bearer BQC4VK3_invalid_token'
        }
      }
    )
    
    // Verify refresh was called after validation failed
    expect(fetch).toHaveBeenNthCalledWith(2,
      'http://127.0.0.1:5000/auth/spotify/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: 'AQD5xL2_valid_refresh'
        })
      }
    )
    
    // Verify new tokens were set
    expect(authStore.accessToken).toBe('BQC4VK3_new_token')
    expect(authStore.refreshToken).toBe('AQD5xL2_new_refresh')
    expect(authStore.expiresAt).toBe('1725456000')
  })
})
