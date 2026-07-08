<template>
  <div class="song-recommend-section">
    <div class="container">
      <h2 class="section-title">Song Recommend for you</h2>
      
      <!-- Authentication Required Message -->
      <div v-if="!isAuthenticated" class="auth-required-message">
        <div class="auth-container">
          <div class="auth-icon">🎵</div>
          <h3>Login Required</h3>
          <p>Please login with Spotify to get personalized song recommendations</p>
          <button @click="loginWithSpotify" class="spotify-login-btn" :disabled="isLoggingIn">
            <svg class="spotify-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            {{ isLoggingIn ? 'Connecting...' : 'Login with Spotify' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <h3>Loading Recommendations...</h3>
          <p>Getting your personalized music recommendations from Spotify</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Unable to Load Recommendations</h3>
        <p>{{ error }}</p>
        <button @click="loadRecommendations" class="retry-btn">Try Again</button>
      </div>

      <!-- Recommendations Content -->
      <div v-else class="slider-wrapper">
        <!-- Navigation Buttons -->
        <button class="nav-btn prev-btn" @click="scrollLeft" :disabled="isAtStart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button class="nav-btn next-btn" @click="scrollRight" :disabled="isAtEnd">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Songs Container -->
        <div class="songs-container" ref="songsContainer" @scroll="checkScrollPosition">
          <div 
            v-for="(song, index) in recommendedSongs" 
            :key="song.id || index"
            class="song-card"
            :class="{ 'selected': selectedSong && selectedSong.id === song.id }"
            @click="selectSong(song)"
          >
            <div class="song-image">
              <img v-if="song.image" :src="song.image" :alt="song.name" @error="handleImageError" />
              <div v-else class="placeholder-image">
                <i class="music-icon">🎵</i>
              </div>
            </div>            <div class="song-info">              <h3 class="song-name">{{ song.song_title || song.name || 'Unknown Song' }}</h3>
              <p class="artist-name">{{ song.artist_name || song.artist || 'Unknown Artist' }}</p>
            </div>
          </div>
        </div>
      </div>
        <!-- Song Details Section -->
      <div v-if="selectedSong && isAuthenticated" class="song-details-section" ref="songDetailsSection">
        <div class="song-details-container">
          <div class="song-details-header">
            <div class="song-details-image">
              <img v-if="selectedSong.image" :src="selectedSong.image" :alt="selectedSong.song_title" @error="handleImageError" />
              <div v-else class="placeholder-detail-image">
                <i class="music-icon">🎵</i>
              </div>
            </div>
            <div class="song-details-info">
              <h2 class="detail-song-name">{{ selectedSong.song_title }}</h2>
              <p class="detail-artist-name">{{ selectedSong.artist_name }}</p>
              <div class="song-meta">
                <span v-if="selectedSong.genre" class="meta-item">{{ selectedSong.genre }}</span>
                <span v-if="selectedSong.release_year" class="meta-item">{{ selectedSong.release_year }}</span>
                <span v-if="selectedSong.duration" class="meta-item">{{ selectedSong.duration }}</span>
              </div>
              <div v-if="selectedSong.spotify_url" class="spotify-link">
                <a :href="selectedSong.spotify_url" target="_blank" rel="noopener noreferrer" class="spotify-btn">
                  <svg class="spotify-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Listen on Spotify
                </a>
              </div>
            </div>
          </div>            <div class="song-details-content">
            <!-- Top Row: Song Content (Left) and Music Style (Right) -->
            <div class="content-row">
              <!-- Left Column: Song Content Section -->
              <div class="content-left">
                <div class="content-section">
                  <h3>Song Content</h3>              
                  <div class="content-info">
                    <div v-if="selectedSong.generatedContent" class="detail-item generated-content">
                      <div class="content-text">{{ selectedSong.generatedContent }}</div>
                    </div>
                    <div v-else class="detail-item no-content">
                      <button 
                        @click="generateSongContent" 
                        :disabled="isGeneratingContent"
                        class="generate-content-btn"
                      >
                        <div v-if="isGeneratingContent" class="loading-dots">
                          <span></span><span></span><span></span>
                        </div>
                        <span v-else>Generate Song Analysis</span>
                      </button>
                    </div>
                      <!-- Mood and Keywords Row -->
                    <div class="mood-keywords-row">
                      <div v-if="selectedSong.mood" class="detail-item mood-item">
                        <span class="label">Mood:</span>
                        <span class="value">{{ selectedSong.mood }}</span>
                      </div>
                      <div v-if="selectedSong.keywords && selectedSong.keywords.length" class="detail-item keywords-item">
                        <span class="label">Keywords:</span>
                        <div class="keywords-list">
                          <span v-for="keyword in selectedSong.keywords" :key="keyword" class="keyword-tag">{{ keyword }}</span>
                        </div>                
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right Column: Music Style Section -->
              <div class="content-right">
                <div v-if="selectedSong.music_style" class="music-style-section">
                  <h3>Music Style</h3>
                  <div class="style-description">
                    {{ selectedSong.music_style }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Bottom Row: Musical Details Section (Full Width) -->
            <div class="musical-details-section">
              <h3>Musical Details</h3>
              <div class="details-grid">
                <div v-if="selectedSong.genre" class="detail-item">
                  <span class="label">Genre:</span>
                  <span class="value">{{ selectedSong.genre }}</span>
                </div>                <div v-if="selectedSong.beat" class="detail-item">
                  <span class="label">Beat:</span>
                  <span class="value">{{ selectedSong.beat }}</span>
                </div>
                <div v-if="selectedSong.key" class="detail-item">
                  <span class="label">Key:</span>
                  <span class="value">{{ selectedSong.key }}</span>
                </div>
                <div v-if="selectedSong.release_year" class="detail-item">
                  <span class="label">Release Year:</span>
                  <span class="value">{{ selectedSong.release_year }}</span>
                </div>
                <div v-if="selectedSong.duration" class="detail-item">
                  <span class="label">Duration:</span>
                  <span class="value">{{ selectedSong.duration }}</span>
                </div>                <div v-if="selectedSong.instruments" class="detail-item instruments-item">
                  <span class="label">Instruments:</span>
                  <span class="value">{{ selectedSong.instruments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import spotifyRecommendService from '@/services/spotifyRecommendService'

export default {
  name: 'SongRecommendSection',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },  data() {
    return {
      isAtStart: true,
      isAtEnd: false,
      selectedSong: null,
      recommendedSongs: [],
      isLoading: false,
      isLoggingIn: false,
      error: null,
      // Cache for audio features
      audioFeaturesCache: new Map(),
      loadingFeatures: false,
      // ChatGPT content generation
      isGeneratingContent: false,
      contentCache: new Map() // Cache for generated song content
    }
  },
  computed: {
    isAuthenticated() {
      return this.authStore.isAuthenticated
    }
  },  async mounted() {
    // Load recommendations if user is authenticated
    if (this.isAuthenticated) {
      await this.loadRecommendations()
    }
    
    // Setup scroll position checking after next tick
    this.$nextTick(() => {
      this.checkScrollPosition()
    })
  },  watch: {
    // Watch for authentication changes
    isAuthenticated(newVal) {
      if (newVal) {
        this.loadRecommendations()
      } else {
        this.recommendedSongs = []
        this.selectedSong = null
        this.error = null
      }
    },
    // Watch for songs changes to update scroll position
    recommendedSongs() {
      this.$nextTick(() => {
        this.checkScrollPosition()
      })
    }
  },
  methods: {
    async loginWithSpotify() {
      try {
        this.isLoggingIn = true
        await this.authStore.login()
      } catch (error) {
        console.error('Login failed:', error)
        this.error = 'Failed to login with Spotify. Please try again.'
      } finally {
        this.isLoggingIn = false
      }
    },

    async loadRecommendations() {
      if (!this.isAuthenticated) {
        return
      }

      try {
        this.isLoading = true
        this.error = null        // Ensure valid token
        await this.authStore.ensureValidToken()
        
        // Set authorization token in service
        spotifyRecommendService.setAuthToken(this.authStore.accessToken)        // Get recommendations with default genres
        const defaultGenres = ['pop', 'rock', 'hip-hop', 'indie']
        const response = await spotifyRecommendService.getRecommendations(defaultGenres, 12)
          if (response.success) {
          this.recommendedSongs = response.data?.recommendations || []
          
          // Don't load track features automatically anymore
          // Let user click on songs to load features individually
        } else {
          throw new Error(response.message || 'Failed to load recommendations')
        }
      } catch (error) {
        console.error('Error loading recommendations:', error)
        this.error = error.message || 'Unable to load recommendations. Please try again.'
        this.recommendedSongs = []
      } finally {
        this.isLoading = false
      }
    },    async loadTrackFeatures() {
      try {
        // Get Spotify IDs for tracks that have them
        const trackIds = this.recommendedSongs
          .filter(song => song.spotify_id)
          .map(song => song.spotify_id)
          .slice(0, 10) // Limit to first 10 to avoid rate limits

        if (trackIds.length === 0) return

        const featuresResponse = await spotifyRecommendService.getTrackFeatures(
          this.authStore.accessToken,
          trackIds
        )

        if (featuresResponse.success && featuresResponse.features) {
          // Update songs with detailed features
          this.recommendedSongs = this.recommendedSongs.map(song => {
            if (song.spotify_id && featuresResponse.features[song.spotify_id]) {
              return spotifyRecommendService.formatTrackData(song, featuresResponse.features)
            }
            return song
          })
        }
      } catch (error) {
        console.error('Error loading track features:', error)
        // Don't show error to user as this is non-critical
      }
    },

    selectSong(song) {
      this.selectedSong = song
      
      // Load audio features for this specific song if not cached
      this.loadSingleTrackFeatures(song)
      
      // Auto scroll to details section
      this.$nextTick(() => {
        if (this.$refs.songDetailsSection) {
          this.$refs.songDetailsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      })
    },

    async loadSingleTrackFeatures(song) {
      if (!song.spotify_id) return

      // Check if features are already cached
      if (this.audioFeaturesCache.has(song.spotify_id)) {
        const cachedFeatures = this.audioFeaturesCache.get(song.spotify_id)
        this.selectedSong = { ...song, ...cachedFeatures }
        return
      }

      // Load features for this specific track
      try {
        this.loadingFeatures = true

        const featuresResponse = await spotifyRecommendService.getTrackFeatures(
          this.authStore.accessToken,
          [song.spotify_id]
        )

        if (featuresResponse.success && featuresResponse.features && featuresResponse.features[song.spotify_id]) {
          const features = featuresResponse.features[song.spotify_id]
          
          // Cache the features
          this.audioFeaturesCache.set(song.spotify_id, features)
          
          // Update selected song with features
          this.selectedSong = { ...song, ...features }
          
          // Also update the song in recommendedSongs array if it exists there
          const songIndex = this.recommendedSongs.findIndex(s => s.spotify_id === song.spotify_id)
          if (songIndex !== -1) {
            this.recommendedSongs[songIndex] = { ...this.recommendedSongs[songIndex], ...features }
          }
        }
      } catch (error) {
        console.error('Error loading single track features:', error)
        // Don't show error to user, just keep original song data
      } finally {
        this.loadingFeatures = false
      }
    },scrollLeft() {
      const container = this.$refs.songsContainer
      if (container) {
        container.scrollBy({
          left: -300,
          behavior: 'smooth'
        })
        // Check position after scroll animation
        setTimeout(() => {
          this.checkScrollPosition()
        }, 500)
      }
    },

    scrollRight() {
      const container = this.$refs.songsContainer
      if (container) {
        container.scrollBy({
          left: 300,
          behavior: 'smooth'
        })
        // Check position after scroll animation
        setTimeout(() => {
          this.checkScrollPosition()
        }, 500)
      }
    },checkScrollPosition() {
      const container = this.$refs.songsContainer
      if (!container) {
        this.isAtStart = true
        this.isAtEnd = true
        return
      }
      
      // Check if there's enough content to scroll
      const hasScrollableContent = container.scrollWidth > container.clientWidth
      
      if (!hasScrollableContent) {
        this.isAtStart = true
        this.isAtEnd = true
        return
      }
      
      this.isAtStart = container.scrollLeft <= 5
      this.isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 5)
    },

    handleImageError(event) {
      // Hide broken image and show placeholder
      event.target.style.display = 'none'
      const placeholder = event.target.nextElementSibling
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    },    formatDuration(durationMs) {
      if (!durationMs) return '0:00'
      
      const minutes = Math.floor(durationMs / 60000)
      const seconds = Math.floor((durationMs % 60000) / 1000)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },

    async generateSongContent() {
      if (!this.selectedSong || this.isGeneratingContent) {
        return
      }

      const songKey = `${this.selectedSong.song_title || this.selectedSong.name}_${this.selectedSong.artist_name || this.selectedSong.artist}`

      // Check if content is already cached
      if (this.contentCache.has(songKey)) {
        this.selectedSong.generatedContent = this.contentCache.get(songKey)
        this.$forceUpdate()
        return
      }

      try {
        this.isGeneratingContent = true

        // Call backend to generate content using ChatGPT
        const response = await spotifyRecommendService.generateSongContent({
          songTitle: this.selectedSong.song_title || this.selectedSong.name,
          artistName: this.selectedSong.artist_name || this.selectedSong.artist,
          genre: this.selectedSong.genre,
          mood: this.selectedSong.mood,
          keywords: this.selectedSong.keywords
        })

        if (response.success && response.data.content) {
          const generatedContent = response.data.content
          
          // Cache the generated content
          this.contentCache.set(songKey, generatedContent)
          
          // Update the selected song
          this.selectedSong.generatedContent = generatedContent
          this.$forceUpdate()
        } else {
          throw new Error(response.message || 'Failed to generate content')
        }
      } catch (error) {
        console.error('Error generating song content:', error)
        // Show fallback content
        this.selectedSong.generatedContent = 'Unable to generate content at this time. Please try again later.'
        this.$forceUpdate()
      } finally {
        this.isGeneratingContent = false
      }
    }
  }
}
</script>

<style scoped>
.song-recommend-section {
  background: linear-gradient(180deg, #1b1b1b 0%, #2d2d2d 100%);
  padding: 80px 20px;
  min-height: 500px;
  position: relative;
}

.song-recommend-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  pointer-events: none;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.section-title {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 50px;
  text-align: left;
  font-family: 'Anton', sans-serif;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
}

/* Authentication Required State */
.auth-required-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.auth-container {
  text-align: center;
  max-width: 500px;
  padding: 60px 40px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  backdrop-filter: blur(15px);
}

.auth-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.auth-container h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.auth-container p {
  font-size: 1.1rem;
  color: #cccccc;
  margin-bottom: 30px;
  line-height: 1.6;
}

.spotify-login-btn {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

.spotify-login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
  background: linear-gradient(135deg, #1ed760 0%, #1db954 100%);
}

.spotify-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spotify-icon {
  width: 20px;
  height: 20px;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
  padding: 60px 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner h3 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 10px;
}

.loading-spinner p {
  color: #cccccc;
  font-size: 1rem;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
  padding: 60px 40px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-container h3 {
  font-size: 1.8rem;
  color: #ffffff;
  margin-bottom: 15px;
}

.error-container p {
  color: #ff6b6b;
  font-size: 1rem;
  margin-bottom: 25px;
  max-width: 400px;
}

.retry-btn {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.slider-wrapper {
  position: relative;
  overflow: hidden;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.nav-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.nav-btn svg {
  width: 20px;
  height: 20px;
}

.prev-btn {
  left: 10px;
}

.next-btn {
  right: 10px;
}

.songs-container {
  display: flex;
  gap: 25px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.songs-container::-webkit-scrollbar {
  display: none;
}

.song-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  min-width: 220px;
  max-width: 220px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.song-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.song-card:hover::before {
  left: 100%;
}

.song-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.song-image {
  width: 160px;
  height: 160px;
  margin: 0 auto 25px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.song-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.placeholder-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.music-icon {
  font-size: 2.5rem;
  z-index: 1;
}

.song-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.song-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.artist-name {
  font-size: 1rem;
  color: #cccccc;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.song-card.selected {
  border-color: rgba(255, 255, 255, 0.6);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Song Details Section */
.song-details-section {
  margin-top: 60px;
  padding: 40px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.song-details-container {
  max-width: 100%;
}

.song-details-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.song-details-image {
  width: 220px;
  height: 220px;
  border-radius: 15px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-details-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-detail-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
}

.song-details-info {
  flex: 1;
}

.detail-song-name {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.detail-artist-name {
  font-size: 1.2rem;
  color: #cccccc;
  margin-bottom: 15px;
}

.song-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.meta-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spotify-link {
  margin-top: 15px;
}

.spotify-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(29, 185, 84, 0.3);
}

.spotify-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.4);
  text-decoration: none;
  color: white;
}

.spotify-btn .spotify-icon {
  width: 16px;
  height: 16px;
}

.song-details-content {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

/* New Horizontal Layout */
.content-row {
  display: grid !important;
  grid-template-columns: 60% 40% !important;
  gap: 25px;
  margin-bottom: 0px;
  align-items: stretch !important;
  min-height: 300px;
}

.content-left {
  display: flex !important;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 15px;
  padding: 16px;
}

.content-right {
  display: flex !important;
  flex-direction: column;
  height: 100%;
  background: rgba(29, 185, 84, 0.05);
  border-radius: 15px;
  padding: 20px;
}

/* Adjust content section for left column */
.content-left .content-section {
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-left .content-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Adjust music style section for right column */
.content-right .music-style-section {
  margin-bottom: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-right .style-description {
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
}

.lyrics-section h3,
.info-section h4 {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 15px;
  font-weight: bold;
}

.lyrics-text {
  color: #cccccc;
  line-height: 1.6;
  font-size: 1rem;
  white-space: pre-line;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid rgba(255, 255, 255, 0.3);
}

.info-section p {
  color: #cccccc;
  line-height: 1.6;
  font-size: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.detail-item .label {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.detail-item .value {
  color: #1db954;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

/* Enhanced Song Details Styles */
.content-section {
  margin-bottom: 30px;
}

.content-section h3 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.musical-details-section h3 {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 20px;
  font-weight: bold;
}

.content-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.content-info .detail-item {
  margin-bottom: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.content-info .mood-keywords-row {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 5px;
  align-items: stretch;
}

.content-info .detail-item.generated-content,
.content-info .detail-item.no-content {
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-info .detail-item:not(.generated-content):not(.no-content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.content-info .detail-item.keywords-item {
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 15px !important;
  min-height: 60px !important;
}

.content-info .detail-item.mood-item {
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 15px !important;
  min-height: 60px !important;
}

.content-info .detail-item.keywords-item .label {
  min-width: 80px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.content-info .detail-item.mood-item .label {
  min-width: 80px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.content-info .detail-item.mood-item .value {
  color: #1db954;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  flex: 1;
}

.content-info .detail-item.keywords-item .keywords-list {
  flex: 1;
  justify-content: flex-start;
}

.content-info .detail-item .label {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
}

.content-info .detail-item .value {
  color: #1db954;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: right;
  flex: 1;
}



.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.keyword-tag {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(29, 185, 84, 0.08));
  color: #1db954;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(29, 185, 84, 0.25);
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(29, 185, 84, 0.1);
}

.keyword-tag:hover {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.25), rgba(29, 185, 84, 0.15));
  border-color: rgba(29, 185, 84, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.2);
}

/* ChatGPT Content Generation Styles */
.generated-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 15px;
}

.content-text {
  color: #ffffff;
  line-height: 1.6;
  font-size: 0.95rem;
  text-align: justify;
}

.no-content {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.generate-content-btn {
  background: linear-gradient(135deg, #1db954, #1ed760);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  min-width: 160px;
  justify-content: center;
}

.generate-content-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1ed760, #1db954);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(29, 185, 84, 0.3);
}

.generate-content-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: loading-dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Music Style Section */
.music-style-section {
  margin-bottom: 20px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(29, 185, 84, 0.08));
  border-radius: 20px;
  border: 1px solid rgba(29, 185, 84, 0.3);
  position: relative;
  overflow: hidden;
}

.music-style-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.music-style-section h3 {
  font-size: 1.4rem;
  color: #1db954;
  margin-bottom: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.music-style-section h3::before {
  content: "🎵";
  font-size: 1.3rem;
  filter: drop-shadow(0 0 8px rgba(29, 185, 84, 0.5));
}

.style-description {
  color: #ffffff;
  font-size: 1.05rem;
  line-height: 1.7;
  text-align: left;
  font-weight: 500;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 15px;
  border-left: 4px solid #1db954;
}

.musical-details-section {
  margin-top: 0px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.musical-details-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%);
  pointer-events: none;
}

.musical-details-section h3 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.musical-details-section h3::before {
  content: "🎼";
  font-size: 1.3rem;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

/* Special styling for instruments item - make it wider */
.musical-details-section .detail-item.instruments-item {
  grid-column: span 2;
  min-width: 100%;
}

/* Fallback for single column layout */
@media (max-width: 768px) {
  .musical-details-section .detail-item.instruments-item {
    grid-column: span 1;
  }
}

.musical-details-section .detail-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.musical-details-section .detail-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: left 0.5s ease;
}

.musical-details-section .detail-item:hover::before {
  left: 100%;
}

.musical-details-section .detail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.musical-details-section .detail-item .label {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.musical-details-section .detail-item .value {
  color: #1db954;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  flex: 1;
}

/* Special styling for instruments item - make it wider */
.musical-details-section .detail-item.instruments-item {
  grid-column: span 2;
  min-width: 100%;
  justify-content: space-between;
  text-align: left;
}

.musical-details-section .detail-item.instruments-item .value {
  text-align: left;
  margin-left: 10px;
  line-height: 1.4;
  white-space: normal;
}

.musical-details-section .detail-item.instruments-item .label {
  min-width: 120px;
  flex-shrink: 0;
}

/* Fallback for single column layout */
@media (max-width: 768px) {
  .musical-details-section .detail-item.instruments-item {
    grid-column: span 1;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.music-analysis {
  margin-top: 25px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.music-analysis h4 {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 15px;
  font-weight: bold;
}

.analysis-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.analysis-label {
  min-width: 100px;
  font-size: 0.9rem;
  color: #cccccc;
  font-weight: 500;
}

.analysis-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, #1db954, #1ed760);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.analysis-value {
  min-width: 40px;
    font-size: 0.85rem;
  color: #1db954;
  font-weight: bold;
  text-align: right;
}

/* Responsive adjustments for enhanced details */
@media (max-width: 768px) {
  .keywords-list {
    gap: 6px;
  }
  
  .keyword-tag {
    font-size: 0.8rem;
    padding: 3px 10px;
  }
  
  .analysis-item {
    gap: 10px;
  }
  
  .analysis-label {
    min-width: 80px;
    font-size: 0.85rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .musical-details-section {
    padding: 20px;
  }

  .musical-details-section .detail-item {
    padding: 15px 16px;
  }

  .musical-details-section .detail-item .label {
    min-width: 100px;
    font-size: 0.85rem;
  }

  .musical-details-section .detail-item .value {
    font-size: 0.9rem;
  }

  .music-style-section {
    padding: 20px;
  }

  .style-description {
    font-size: 1rem;
    padding: 16px;
  }
}

/* Responsive for song details */
@media (max-width: 768px) {
  .song-details-section {
    margin-top: 40px;
    padding: 25px;
  }
  
  .song-details-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .song-details-image {
    width: 180px;
    height: 180px;
    margin: 0 auto;
  }
  
  .detail-song-name {
    font-size: 1.5rem;
  }  .song-details-content {
    flex-direction: column;
    gap: 25px;
  }
  
  /* Mobile layout for content row */
  .content-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .content-info .mood-keywords-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }

  .auth-container {
    padding: 40px 20px;
  }

  .auth-container h3 {
    font-size: 1.5rem;
  }

  .spotify-login-btn {
    padding: 12px 25px;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .song-recommend-section {
    padding: 60px 15px;
  }
  
  .section-title {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .prev-btn {
    left: 5px;
  }
  
  .next-btn {
    right: 5px;
  }
  
  .songs-container {
    gap: 15px;
  }
    .song-card {
    min-width: 240px;
    max-width: 240px;
    min-height: 320px;
    padding: 20px;
  }
  
  .song-image {
    width: 140px;
    height: 140px;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 2rem;
  }
    .song-card {
    min-width: 200px;
    max-width: 200px;
    min-height: 280px;
    padding: 18px;
  }
  
  .song-image {
    width: 120px;
    height: 120px;
  }
  
  .nav-btn {
    width: 35px;
    height: 35px;
  }
    .nav-btn svg {
    width: 16px;
    height: 16px;
  }
}

/* Loading Features Animation */
.loading-features {
  color: #1db954;
  font-style: italic;
  animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Features Notice */
.features-notice {
  margin-top: 15px;
  padding: 10px 15px;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 8px;
  text-align: center;
}

.features-notice p {
  margin: 0;
  color: #1db954;
  font-size: 14px;
  font-style: italic;
}

/* New Horizontal Layout */
.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  margin-bottom: 25px;
  align-items: flex-start;
}

.content-left {
  display: flex;
  flex-direction: column;
}

.content-right {
  display: flex;
  flex-direction: column;
}

/* Adjust content section for left column */
.content-left .content-section {
  margin-bottom: 0;
}

/* Adjust music style section for right column */
.content-right .music-style-section {
  margin-bottom: 0;
  height: fit-content;
}

/* Responsive layout for tablets */
@media (max-width: 1024px) {
  .content-row {
    grid-template-columns: 50% 50% !important;
    gap: 15px;
    min-height: 250px;
  }
  
  .content-left {
    padding: 12px;
  }
  
  .content-right {
    padding: 12px;
  }
  
  .content-info .mood-keywords-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* Responsive layout for mobile */
@media (max-width: 768px) {
  .content-row {
    grid-template-columns: 1fr !important;
    gap: 15px;
    min-height: auto;
  }
  
  .content-left {
    padding: 15px;
    margin-bottom: 0;
  }
  
  .content-right {
    padding: 15px;
  }
  
  .content-info .mood-keywords-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .content-section h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .music-style-section h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .keyword-tag {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}

/* Responsive layout for small mobile devices */
@media (max-width: 480px) {
  .content-row {
    gap: 10px;
  }
  
  .content-left,
  .content-right {
    padding: 12px;
  }
  
  .content-section h3,
  .music-style-section h3 {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  
  .content-info .detail-item {
    padding: 10px 12px;
    font-size: 0.85rem;
  }
  
  .content-info .mood-keywords-row {
    gap: 8px;
  }
  
  .keyword-tag {
    font-size: 0.75rem;
    padding: 4px 10px;
  }
  
  .generate-content-btn {
    font-size: 0.85rem;
    padding: 10px 20px;
    min-width: 140px;
  }
  
  .style-description {
    font-size: 0.9rem;
    padding: 12px;
  }
}
</style>
