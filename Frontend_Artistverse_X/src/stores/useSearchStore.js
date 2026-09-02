// store/useSearchStore.js
import { defineStore } from 'pinia';
import searchService from '../services/SearchService';

export const useSearchStore = defineStore('search', {
  state: () => ({
    // Search state
    query: '',
    field: 'name',
    isLoading: false,
    hasSearched: false,
    error: null,
    
    // Results
    results: [],
    totalResults: 0,
    currentPage: 1,
    resultsPerPage: 20,
    
    // Selected item
    selectedItem: null,
    
    // Search history
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    
    // Filter options
    filterOptions: [
      { key: 'name', label: 'Song Name', icon: '' },
      { key: 'artists', label: 'Artist', icon: '' },
      { key: 'genres', label: 'Genre', icon: '' }
    ],
      // UI state
    showMobileFilters: false,
    sortBy: 'relevance', // 'relevance', 'name', 'year'
    sortDirection: 'desc' // 'asc', 'desc'
  }),

  getters: {
    // Get filtered and sorted results
    sortedResults: (state) => {
      let sorted = [...state.results];
      
      switch (state.sortBy) {
        case 'name':
          sorted.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return state.sortDirection === 'asc' ? comparison : -comparison;
          });
          break;
        case 'year':
          sorted.sort((a, b) => {
            const comparison = (a.year || 0) - (b.year || 0);
            return state.sortDirection === 'asc' ? comparison : -comparison;
          });          break;
        case 'relevance':
        default:
          sorted.sort((a, b) => {
            const comparison = (b.score || 0) - (a.score || 0);
            return state.sortDirection === 'asc' ? -comparison : comparison;
          });
          break;
      }
      
      return sorted;
    },

    // Get current filter option
    currentFilter: (state) => {
      return state.filterOptions.find(option => option.key === state.field) || state.filterOptions[0];
    },

    // Check if has results
    hasResults: (state) => {
      return state.results.length > 0;
    },

    // Check if search is empty
    isEmptySearch: (state) => {
      return state.hasSearched && !state.isLoading && state.results.length === 0;
    },

    // Get recent searches (last 10)
    recentSearches: (state) => {
      return state.searchHistory.slice(0, 10);
    },

    // Get search statistics
    searchStats: (state) => ({
      totalResults: state.totalResults,
      currentPage: state.currentPage,
      totalPages: Math.ceil(state.totalResults / state.resultsPerPage),
      hasMore: state.totalResults > state.results.length
    })
  },

  actions: {
    // Set search query
    setQuery(query) {
      this.query = query;
    },

    // Set search field
    setField(field) {
      this.field = field;
    },

    // Set selected item
    setSelectedItem(item) {
      this.selectedItem = item;
    },

    // Clear selected item
    clearSelectedItem() {
      this.selectedItem = null;
    },

    // Set error
    setError(error) {
      this.error = error;
    },

    // Clear error
    clearError() {
      this.error = null;
    },

    // Set loading state
    setLoading(loading) {
      this.isLoading = loading;
    },

    // Clear results
    clearResults() {
      this.results = [];
      this.totalResults = 0;
      this.error = null;
      // Note: intentionally keeping hasSearched = true so Top Genres doesn't randomly pop up if we are not in genre mode
    },

    // Add to search history
    addToHistory(query, field) {
      if (!query || query.trim() === '') return;
      
      const searchEntry = {
        id: Date.now(),
        query: query.trim(),
        field,
        timestamp: new Date().toISOString()
      };

      // Remove duplicate if exists
      this.searchHistory = this.searchHistory.filter(
        item => !(item.query === searchEntry.query && item.field === searchEntry.field)
      );

      // Add to beginning
      this.searchHistory.unshift(searchEntry);

      // Keep only last 50 searches
      if (this.searchHistory.length > 50) {
        this.searchHistory = this.searchHistory.slice(0, 50);
      }

      // Save to localStorage
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },

    // Remove from search history
    removeFromHistory(id) {
      this.searchHistory = this.searchHistory.filter(item => item.id !== id);
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },

    // Clear search history
    clearHistory() {
      this.searchHistory = [];
      localStorage.removeItem('searchHistory');
    },

    // Set sort options
    setSortBy(sortBy, direction = null) {
      this.sortBy = sortBy;
      if (direction) {
        this.sortDirection = direction;
      } else {
        // Toggle direction if same sort field
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      }
    },

    // Toggle mobile filters
    toggleMobileFilters() {
      this.showMobileFilters = !this.showMobileFilters;
    },

    // Perform search
    async performSearch(query = null, field = null, size = null) {
      // Use provided parameters or current state
      const searchQuery = query || this.query;
      const searchField = field || this.field;
      const searchSize = size || this.resultsPerPage;

      // Validate input
      if (!searchQuery || searchQuery.trim() === '') {
        this.clearResults();
        if (!this.isLoading) {
          this.loadInitialSongs(20);
        }
        return;
      }

      // Validate parameters
      const validation = searchService.validateSearchParams(searchQuery, searchField, searchSize);
      if (!validation.isValid) {
        this.setError(validation.errors.join(', '));
        return;
      }

      // Set loading state
      this.setLoading(true);
      this.clearError();
      this.hasSearched = true;

      try {
        // Perform search
        const response = await searchService.search(searchQuery, searchField, searchSize);
        
        // Update state
        this.results = response.results;
        this.totalResults = response.totalResults;
        this.query = searchQuery;
        this.field = searchField;
        
        // Add to history
        this.addToHistory(searchQuery, searchField);

      } catch (error) {
        console.error('Search error:', error);
        this.setError(error.message || 'Search failed. Please try again.');
        this.results = [];
        this.totalResults = 0;
      } finally {
        this.setLoading(false);
      }
    },

    // Load more results (pagination)
    async loadMore() {
      if (this.isLoading || !this.hasResults) return;

      const nextPage = this.currentPage + 1;
      const startIndex = (nextPage - 1) * this.resultsPerPage;

      // For now, we'll implement simple pagination
      // In a real app, you might want to call the API with offset/limit
      try {
        this.setLoading(true);
        
        let response;
        if (!this.query || this.query.trim() === '') {
          response = await searchService.getAllSongs(this.resultsPerPage * nextPage);
        } else {
          response = await searchService.search(
            this.query, 
            this.field, 
            this.resultsPerPage * nextPage
          );
        }
        
        // Get only new results
        const newResults = response.results.slice(startIndex);
        this.results = [...this.results, ...newResults];
        this.currentPage = nextPage;
        
      } catch (error) {
        console.error('Load more error:', error);
        this.setError('Failed to load more results');
      } finally {
        this.setLoading(false);
      }
    },

    // Search with debounce
    searchWithDebounce: (() => {
      let timeoutId = null;
      return function(query, field, delay = 500) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          this.performSearch(query, field);
        }, delay);
      };
    })(),    // Reset search state
    resetSearch() {
      this.query = '';
      this.field = 'name';
      this.clearResults();
      this.clearError();
      this.clearSelectedItem();
      this.currentPage = 1;
    },

    // Load initial songs when page loads
    async loadInitialSongs(size = 20) {
      this.setLoading(true);
      this.clearError();

      try {
        const response = await searchService.getAllSongs(size);
        
        this.results = response.results;
        this.totalResults = response.totalResults;
        this.hasSearched = true;
        this.query = '';
        // Do not reset this.field so user's filter choice is preserved

      } catch (error) {
        console.error('Load initial songs error:', error);
        this.setError(error.message || 'Failed to load songs');
        this.results = [];
        this.totalResults = 0;
      } finally {
        this.setLoading(false);
      }
    },

    // Initialize store
    initialize() {
      // Load search history from localStorage
      try {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
          this.searchHistory = JSON.parse(savedHistory);
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
        this.searchHistory = [];
      }
    }
  }
});