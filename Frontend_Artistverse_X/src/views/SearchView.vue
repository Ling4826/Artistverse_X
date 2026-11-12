<template>
  <div class="search-view">
    <!-- Header Section -->
    <div class="search-header">
      <h1 class="search-title">ARTISTVERSE X</h1>
      
      <!-- Search Bar -->
      <div class="search-bar-container">
        <div class="search-bar">
          <input 
            v-model="searchStore.query" 
            type="text" 
            placeholder="Search for songs, artists, or styles..."
            class="search-input"
            @input="handleSearch"
            @keyup.enter="performSearch"
            @focus="showSuggestions = true"
          />
          <button class="search-btn" @click="performSearch" :disabled="searchStore.isLoading">
            <div v-if="searchStore.isLoading" class="search-loading"></div>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.515 16.515M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Search Suggestions -->
        <div v-if="showSuggestions && searchStore.recentSearches.length > 0" class="search-suggestions">
          <div class="suggestions-header">
            <span>Recent Searches</span>
            <button @click="searchStore.clearHistory()" class="clear-history-btn">Clear</button>
          </div>
          <div 
            v-for="search in searchStore.recentSearches.slice(0, 5)" 
            :key="search.id"
            class="suggestion-item"
            @click="selectSuggestion(search)"
          >
            <span class="suggestion-icon">{{ getFilterIcon(search.field) }}</span>
            <span class="suggestion-text">{{ search.query }}</span>
            <span class="suggestion-field">{{ getFilterLabel(search.field) }}</span>
          </div>
        </div>
      </div>

      <!-- Filter Tags -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="filter-label">Search by:</span>
          <button 
            v-for="filter in searchStore.filterOptions" 
            :key="filter.key"
            :class="['filter-tag', { active: searchStore.field === filter.key }]"
            @click="selectFilter(filter.key)"
          >
            <span class="filter-icon">{{ filter.icon }}</span>
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-section">
      <div class="container">
        <!-- Loading State -->
        <div v-if="searchStore.isLoading && !searchStore.hasResults" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Searching...</p>
        </div>

        <!-- Results Header -->
        <div v-else-if="searchStore.hasResults && searchStore.query" class="results-header">
          <div class="results-info">
            <h2 class="results-title">
              Search results for "{{ searchStore.query }}"
            </h2>
            <p class="results-count">{{ searchStore.totalResults }} results found</p>
          </div>
          
          <!-- Sort Options -->
          <div class="sort-controls">
            <label class="sort-label">Sort by:</label>            <select v-model="currentSort" @change="handleSortChange" class="sort-select">
              <option value="relevance">Relevance</option>
              <option value="name">A-Z</option>
              <option value="year">Year</option>
            </select>
            <button @click="toggleSortDirection" class="sort-direction-btn">
              {{ searchStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Default State -->
        <div v-else-if="!searchStore.query && searchStore.field !== 'genres'" class="results-header">
          <h2 class="results-title">Discover Music</h2>
          <p class="results-count">Enter a search term to find songs, or browse the random songs below.</p>
        </div>

        <!-- Popular Genres Section -->
        <div v-if="!searchStore.query && searchStore.field === 'genres'" class="top-genres-container">
          <h2 class="results-title" style="margin-bottom: 20px;">Popular Genres</h2>
          <div class="top-genres-grid">
            <div 
              v-for="(genre, index) in topGenres" 
              :key="'genre-'+index"
              class="genre-card"
              :style="{ background: genre.color }"
              @click="searchByFilter(genre.name, 'genres')"
            >
              <span class="genre-name">{{ genre.name }}</span>
              <span class="genre-icon">{{ genre.icon }}</span>
            </div>
          </div>
        </div>

        <!-- Cards Grid -->
        <div v-if="(!searchStore.isLoading && searchStore.hasResults) && !(!searchStore.query && searchStore.field === 'genres')" class="cards-grid">
          <div 
            v-for="(item, index) in searchStore.sortedResults" 
            :key="item.id"
            class="music-card"
            @click="selectItem(item)"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-image">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="song-cover-image" />
              <div v-else class="placeholder-image">
                <i class="music-icon"></i>
              </div>
              <div class="card-score">{{ item.score?.toFixed(1) }}</div>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ item.name }}</h3>
              <p class="card-artist">{{ item.artists }}</p>              <div class="card-tags">
                <span :class="['tag', { 'no-genre': item.genres === 'No Genre' }]">{{ item.genres }}</span>
                <span class="tag">{{ item.year }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="searchStore.isEmptySearch" class="empty-state">
          <div class="empty-icon"></div>
          <h3>No results found</h3>
          <p>Try adjusting your search terms or search field</p>
          <div class="empty-suggestions" v-if="searchStore.recentSearches.length > 0">
            <p>Try one of your recent searches:</p>
            <div class="recent-searches">
              <button 
                v-for="search in searchStore.recentSearches.slice(0, 3)" 
                :key="search.id"
                @click="selectSuggestion(search)"
                class="recent-search-btn"
              >
                {{ search.query }}
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="searchStore.error" class="error-state">
          <div class="error-icon"></div>
          <h3>Search Error</h3>
          <p>{{ searchStore.error }}</p>
          <button @click="retrySearch" class="retry-btn">Try Again</button>
        </div>

        <!-- Load More Button -->
        <div v-if="searchStore.hasResults && searchStore.searchStats.hasMore && !(!searchStore.query && searchStore.field === 'genres')" class="load-more-section">
          <button 
            @click="searchStore.loadMore()" 
            :disabled="searchStore.isLoading"
            class="load-more-btn"
          >
            <div v-if="searchStore.isLoading" class="loading-spinner small"></div>
            <span v-else>Load More Results</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Item Details Modal -->
    <div v-if="searchStore.selectedItem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">&times;</button>
        
        <!-- Modal Header -->
        <div class="song-details-header">
          <div class="song-details-image">
            <img v-if="searchStore.selectedItem.image" :src="searchStore.selectedItem.image" :alt="searchStore.selectedItem.name" class="detail-cover-image" />
            <div v-else class="placeholder-detail-image">
              <i class="music-icon"></i>
            </div>
          </div>
          <div class="song-details-info">
            <h2 class="detail-song-name">{{ searchStore.selectedItem.name }}</h2>
            <p class="detail-artist-name">{{ searchStore.selectedItem.artists }}</p>            <div class="song-meta">
              <span :class="['meta-item', { 'no-genre': searchStore.selectedItem.genres === 'No Genre' }]">{{ searchStore.selectedItem.genres }}</span>
              <span class="meta-item">{{ searchStore.selectedItem.year }}</span>
              <span class="meta-item">Score: {{ searchStore.selectedItem.score?.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Modal Content -->
        <div class="song-details-content">
          <div class="lyrics-section">
            <h3>About This Song</h3>
            <p class="lyrics-text">
              This song was found in our music database with a relevance score of {{ searchStore.selectedItem.score?.toFixed(2) }}. 
              It belongs to the {{ searchStore.selectedItem.genres }} genre(s) and was released in {{ searchStore.selectedItem.year }}.
            </p>
          </div>
          
          <div class="song-info-grid">
            <div class="info-section">
              <h4>Song Information</h4>
              <p>Artist: {{ searchStore.selectedItem.artists }}</p>
              <p>Release Year: {{ searchStore.selectedItem.year }}</p>
              <p>Genres: {{ searchStore.selectedItem.genres }}</p>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Song Name:</span>
                <span class="value">{{ searchStore.selectedItem.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Artist:</span>
                <span class="value">{{ searchStore.selectedItem.artists }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Year:</span>
                <span class="value">{{ searchStore.selectedItem.year }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Genres:</span>
                <span class="value">{{ searchStore.selectedItem.genres }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Relevance Score:</span>
                <span class="value">{{ searchStore.selectedItem.score?.toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Database ID:</span>
                <span class="value">{{ searchStore.selectedItem.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside to close suggestions -->
    <div v-if="showSuggestions" class="suggestions-backdrop" @click="showSuggestions = false"></div>
  </div>
</template>

<script>
import { useSearchStore } from '../stores/useSearchStore';
import { ref, onMounted, onUnmounted, watch } from 'vue';

export default {
  name: 'SearchView',
  setup() {
    const searchStore = useSearchStore();
    const showSuggestions = ref(false);
    const currentSort = ref('relevance');    // Initialize store
    onMounted(async () => {
      searchStore.initialize();
      // Load initial songs when component mounts
      await searchStore.loadInitialSongs(20);
    });

    // Watch for search query changes to hide suggestions
    watch(() => searchStore.query, (newQuery) => {
      if (!newQuery) {
        showSuggestions.value = false;
      }
    });

    // Handle search with debounce
    const handleSearch = () => {
      searchStore.searchWithDebounce(searchStore.query, searchStore.field);
    };

    // Perform immediate search
    const performSearch = () => {
      showSuggestions.value = false;
      searchStore.performSearch();
    };

    // Select filter
    const selectFilter = (filterKey) => {
      searchStore.setField(filterKey);
      showSuggestions.value = false;
      if (searchStore.query.trim()) {
        searchStore.performSearch();
      }
    };

    // Select item
    const selectItem = (item) => {
      searchStore.setSelectedItem(item);
    };

    // Close modal
    const closeModal = () => {
      searchStore.clearSelectedItem();
    };

    // Retry search
    const retrySearch = () => {
      searchStore.clearError();
      searchStore.performSearch();
    };

    // Select suggestion
    const selectSuggestion = (search) => {
      searchStore.setQuery(search.query);
      searchStore.setField(search.field);
      showSuggestions.value = false;
      searchStore.performSearch();
    };

    // Handle sort change
    const handleSortChange = () => {
      searchStore.setSortBy(currentSort.value, 'desc');
    };

    // Toggle sort direction
    const toggleSortDirection = () => {
      searchStore.setSortBy(searchStore.sortBy);
    };

    // Get filter icon
    const getFilterIcon = (field) => {
      const filter = searchStore.filterOptions.find(f => f.key === field);
      return filter ? filter.icon : '';
    };

    // Get filter label
    const getFilterLabel = (field) => {
      const filter = searchStore.filterOptions.find(f => f.key === field);
      return filter ? filter.label : 'Unknown';
    };

    // Handle click outside to close suggestions
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-bar-container')) {
        showSuggestions.value = false;
      }
    };

    // Top Genres data
    const topGenres = [
      { name: 'Pop', icon: '', color: 'linear-gradient(135deg, #FF6B6B, #FF8E8B)' },
      { name: 'Rock', icon: '', color: 'linear-gradient(135deg, #4ECDC4, #55E6C1)' },
      { name: 'Hip Hop', icon: '', color: 'linear-gradient(135deg, #FFA07A, #FFB88C)' },
      { name: 'R&B', icon: '', color: 'linear-gradient(135deg, #9B59B6, #8E44AD)' },
      { name: 'Electronic', icon: '', color: 'linear-gradient(135deg, #3498DB, #2980B9)' },
      { name: 'Classical', icon: '', color: 'linear-gradient(135deg, #D4AF37, #F1C40F)' },
      { name: 'Jazz', icon: '', color: 'linear-gradient(135deg, #E67E22, #D35400)' },
      { name: 'Anime', icon: '', color: 'linear-gradient(135deg, #FF9FF3, #F368E0)' }
    ];

    // Popular Artists data
    const popularArtists = [
      { name: 'Taylor Swift', icon: '‍', color: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
      { name: 'The Weeknd', icon: '', color: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
      { name: 'Drake', icon: '', color: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)' },
      { name: 'Ed Sheeran', icon: '', color: 'linear-gradient(135deg, #fdcbf1, #fdcbf1)' },
      { name: 'Ariana Grande', icon: '', color: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
      { name: 'Justin Bieber', icon: '', color: 'linear-gradient(135deg, #d4fc79, #96e6a1)' },
      { name: 'Bruno Mars', icon: '', color: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
      { name: 'YOASOBI', icon: '', color: 'linear-gradient(135deg, #fccb90, #d57eeb)' }
    ];

    // Auto-search helpers
    const searchByFilter = (value, field) => {
      searchStore.setField(field);
      searchStore.setQuery(value);
      searchStore.performSearch();
    };

    const openSpotifyUrl = (url) => {
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Spotify URL not available for this artist.");
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      searchStore,
      showSuggestions,
      currentSort,
      handleSearch,
      performSearch,
      selectFilter,
      selectItem,
      closeModal,
      retrySearch,
      selectSuggestion,
      handleSortChange,
      toggleSortDirection,
      getFilterIcon,
      getFilterLabel,
      topGenres,
      popularArtists,
      searchByFilter,
      openSpotifyUrl
    };
  }
}
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: #1b1b1b;
  color: white;
}

/* Header Section */
.search-header {
  background: linear-gradient(180deg, #000000 0%, #1b1b1b 100%);
  padding: 80px 20px 40px;
  text-align: center;
}

.search-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 30px;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.search-bar-container {
  max-width: 600px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 102;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 5px;
  backdrop-filter: blur(10px);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  padding: 15px 20px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border: none;
  border-radius: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
  transform: scale(1.05);
}

.search-loading {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Search Suggestions */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  backdrop-filter: blur(15px);
  z-index: 100;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.clear-history-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.clear-history-btn:hover {
  color: #8b9eff;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.suggestion-icon {
  font-size: 1.2rem;
}

.suggestion-text {
  flex: 1;
  font-size: 0.9rem;
}

.suggestion-field {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.suggestions-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

/* Filter Section */
.filter-section {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 101;
}

.filter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: bold;
  margin-right: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.filter-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 8px 16px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.filter-tag.active {
  background: linear-gradient(145deg, #667eea, #764ba2);
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.filter-icon {
  font-size: 1rem;
}

/* Category Grid (Artists/Genres) */
.top-genres-container {
  width: 100%;
  padding: 20px 0;
  animation: fadeIn 0.5s ease;
}

.top-genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
}

.genre-card {
  height: 120px;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.genre-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.genre-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
  z-index: 2;
}

.genre-icon {
  font-size: 3rem;
  position: absolute;
  bottom: -5px;
  right: 5px;
  opacity: 0.8;
  transform: rotate(15deg);
  transition: transform 0.3s ease;
}

.genre-card:hover .genre-icon {
  transform: rotate(0deg) scale(1.1);
}

/* Results Section */
.results-section {
  padding: 60px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  gap: 20px;
}

.results-info {
  flex: 1;
}

.results-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ffffff;
}

.results-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

/* Sort Controls */
.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.sort-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.sort-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.sort-select option {
  background: #2a2a2a;
  color: white;
}

.sort-direction-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sort-direction-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.retry-btn {
  background: linear-gradient(145deg, #667eea, #764ba2);
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.music-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out both;
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

.music-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.music-card:hover::before {
  left: 100%;
}

.music-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.4);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.card-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 15px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

.song-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.card-score {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.music-icon {
  font-size: 2.5rem;
  z-index: 1;
}

.card-content {
  flex-grow: 1;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
}

.card-artist {
  font-size: 1rem;
  color: #cccccc;
  margin-bottom: 15px;
  line-height: 1.2;
}

.card-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* No Genre Styling */
.tag.no-genre,
.meta-item.no-genre {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: rgba(255, 107, 107, 0.9);
  font-style: italic;
}

.tag.no-genre::before,
.meta-item.no-genre::before {
  content: " ";
  font-size: 0.8em;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-suggestions {
  margin-top: 30px;
}

.recent-searches {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 15px;
}

.recent-search-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.recent-search-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Load More Section */
.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 15px 30px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-color: rgba(255, 255, 255, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 40px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  backdrop-filter: blur(15px);
  animation: slideInUp 0.6s ease-out;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 25px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ff6b6b;
}

/* Song Details Header */
.song-details-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.song-details-image {
  width: 120px;
  height: 120px;
  border-radius: 15px;
  overflow: hidden;
  flex-shrink: 0;
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

.detail-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
}

.meta-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Song Details Content */
.song-details-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
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

.song-info-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item .label {
  font-weight: bold;
  color: #ffffff;
  font-size: 0.9rem;
}

.detail-item .value {
  color: #cccccc;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-title {
    font-size: 2.5rem;
  }
  
  .filter-group {
    justify-content: center;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .sort-controls {
    justify-content: center;
  }
  
  .song-details-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .song-details-image {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }
  
  .detail-song-name {
    font-size: 1.5rem;
  }
  
  .song-details-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 25px;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .search-header {
    padding: 70px 15px 30px;
  }
  
  .search-title {
    font-size: 2rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .music-card {
    padding: 20px;
  }
  
  .filter-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 10px;
  }
  
  .song-details-header {
    gap: 15px;
  }
  
  .song-details-image {
    width: 80px;
    height: 80px;
  }
  
  .detail-song-name {
    font-size: 1.3rem;
  }
  
  .lyrics-text {
    padding: 15px;
    font-size: 0.9rem;
  }
}

/* Search suggestions responsive */
@media (max-width: 480px) {
  .search-suggestions {
    margin: 5px -20px 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
}
</style>