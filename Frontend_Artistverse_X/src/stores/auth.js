import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('spotify_access_token') || null)
  const refreshToken = ref(localStorage.getItem('spotify_refresh_token') || null)
  const expiresAt = ref(localStorage.getItem('spotify_expires_at') || null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    return !!(user.value && accessToken.value)
  })

  const isTokenExpired = computed(() => {
    if (!expiresAt.value) return true
    return Date.now() >= parseInt(expiresAt.value) * 1000
  })

  // Actions
  function setAuth(authData) {
    user.value = authData.user
    accessToken.value = authData.access_token
    refreshToken.value = authData.refresh_token
    expiresAt.value = authData.expires_at

    // Store in localStorage
    localStorage.setItem('spotify_access_token', authData.access_token)
    localStorage.setItem('spotify_refresh_token', authData.refresh_token)
    localStorage.setItem('spotify_expires_at', authData.expires_at)
    localStorage.setItem('spotify_user', JSON.stringify(authData.user))
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null

    // Clear localStorage
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_expires_at')
    localStorage.removeItem('spotify_user')
  }

  async function login() {
    try {
      isLoading.value = true
      const response = await fetch('/api/auth/spotify/login')
      const data = await response.json()

      if (data.success) {
        // Redirect to Spotify authorization
        window.location.href = data.auth_url
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function handleCallback(code) {
    try {
      isLoading.value = true
      const response = await fetch(`/api/auth/spotify/callback?code=${code}`)
      const data = await response.json()

      if (data.success) {
        setAuth(data)
        return true
      } else {
        throw new Error(data.error || 'Callback handling failed')
      }
    } catch (error) {
      console.error('Callback error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      clearAuth()
      return false
    }

    try {
      const response = await fetch('/api/auth/spotify/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken.value
        })
      })

      const data = await response.json()

      if (data.success) {
        accessToken.value = data.access_token
        refreshToken.value = data.refresh_token || refreshToken.value
        expiresAt.value = data.expires_at

        // Update localStorage
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_refresh_token', data.refresh_token || refreshToken.value)
        localStorage.setItem('spotify_expires_at', data.expires_at)

        return true
      } else {
        clearAuth()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuth()
      return false
    }
  }

  async function validateToken() {
    if (!accessToken.value) return false

    try {
      const response = await fetch('/api/auth/spotify/validate', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      const data = await response.json()
      return data.success && data.valid
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  async function fetchUserProfile() {
    if (!accessToken.value) return null

    try {
      const response = await fetch('/api/auth/spotify/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      const data = await response.json()

      if (data.success) {
        user.value = data.user
        localStorage.setItem('spotify_user', JSON.stringify(data.user))
        return data.user
      }
      return null
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  }

  const topGenres = ref([])
  const topArtists = ref([])

  function logout() {
    clearAuth()
  }

  async function fetchUserTopGenres() {
    if (!accessToken.value) return []

    try {
      const response = await fetch('/api/auth/spotify/top-genres', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      const data = await response.json()

      if (data.success) {
        topGenres.value = data.genres
        return data.genres
      }
      return []
    } catch (error) {
      console.error('Top genres fetch error:', error)
      return []
    }
  }

  async function fetchUserTopArtists() {
    if (!accessToken.value) return []

    try {
      const response = await fetch('/api/auth/spotify/top-artists', {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      const data = await response.json()

      if (data.success) {
        topArtists.value = data.artists
        return data.artists
      }
      return []
    } catch (error) {
      console.error('Top artists fetch error:', error)
      return []
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    expiresAt.value = null
    topGenres.value = []
    topArtists.value = []

    // Clear localStorage
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_expires_at')
    localStorage.removeItem('spotify_user')
  }

  // Initialize from localStorage
  function initializeAuth() {
    const storedUser = localStorage.getItem('spotify_user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        clearAuth()
      }
    }
  }

  // Auto-refresh token if expired
  async function ensureValidToken() {
    if (!accessToken.value) return false

    if (isTokenExpired.value) {
      return await refreshAccessToken()
    }

    // Validate token
    const isValid = await validateToken()
    if (!isValid) {
      return await refreshAccessToken()
    }

    return true
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    expiresAt,
    isLoading,
    topGenres,
    topArtists,
    
    // Getters
    isAuthenticated,
    isTokenExpired,
    
    // Actions
    login,
    logout,
    handleCallback,
    refreshAccessToken,
    validateToken,
    fetchUserProfile,
    fetchUserTopGenres,
    fetchUserTopArtists,
    initializeAuth,
    ensureValidToken,
    setAuth,
    clearAuth
  }
})
