/**
 * Unit Test Case: UTC-33
 * Target Modules: 
 *   - stores/useSearchStore.js
 *   - views/SearchView.vue
 *   - views/AssisatanceView.vue
 * Description: Automated Functional Test Suite for Search Engine & AI Songwriting Assistance
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import Swal from 'sweetalert2';
import { useSearchStore } from '../stores/useSearchStore.js';
import searchService from '../services/SearchService.js';
import AssisatanceView from '../views/AssisatanceView.vue';

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

// Mock SearchService
vi.mock('../services/SearchService.js', () => ({
  default: {
    search: vi.fn(),
    getAllSongs: vi.fn().mockResolvedValue({ results: [], totalResults: 0 }),
    validateSearchParams: vi.fn().mockReturnValue({ isValid: true, errors: [] })
  }
}));

// Mock localStorage helper
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('UTC-33: Search Engine & AI Assistance Functional Tests', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.localStorage.clear();

    // Default online status
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SUB-SUITE 1: useSearchStore Pinia Store Tests
  // =========================================================================
  describe('useSearchStore Actions & Getters Tests', () => {

    it('UTC-33-SEARCH-01 (Positive): performSearch should call searchService and update results & searchHistory', async () => {
      const mockSearchResults = [
        { id: '1', name: 'Shape of You', artists: 'Ed Sheeran', year: 2017, score: 9.5 }
      ];
      searchService.search.mockResolvedValueOnce({
        results: mockSearchResults,
        totalResults: 1
      });

      const store = useSearchStore();
      await store.performSearch('Shape of You', 'name');

      expect(searchService.search).toHaveBeenCalledWith('Shape of You', 'name', 20);
      expect(store.results).toEqual(mockSearchResults);
      expect(store.totalResults).toBe(1);
      expect(store.recentSearches.length).toBe(1);
      expect(store.recentSearches[0].query).toBe('Shape of You');
    });

    it('UTC-33-SEARCH-02 (Positive): sortedResults getter should sort items by name and year correctly', () => {
      const store = useSearchStore();
      store.results = [
        { id: '1', name: 'Zebra Song', year: 2010, score: 5 },
        { id: '2', name: 'Alpha Song', year: 2020, score: 8 }
      ];

      // Sort by name ascending
      store.setSortBy('name', 'asc');
      expect(store.sortedResults[0].name).toBe('Alpha Song');

      // Sort by year descending
      store.setSortBy('year', 'desc');
      expect(store.sortedResults[0].year).toBe(2020);
    });

    it('UTC-33-SEARCH-03 (Positive): clearHistory should empty searchHistory array and remove from localStorage', () => {
      const store = useSearchStore();
      store.addToHistory('Test Query', 'name');

      expect(store.searchHistory.length).toBe(1);

      store.clearHistory();

      expect(store.searchHistory).toEqual([]);
      expect(window.localStorage.getItem('searchHistory')).toBeNull();
    });

    it('UTC-33-SEARCH-04 (Edge Case): setSelectedItem and clearSelectedItem should update modal selection state', () => {
      const store = useSearchStore();
      const mockItem = { id: '10', name: 'Test Track' };

      store.setSelectedItem(mockItem);
      expect(store.selectedItem).toEqual(mockItem);

      store.clearSelectedItem();
      expect(store.selectedItem).toBeNull();
    });
  });

  // =========================================================================
  // SUB-SUITE 2: AssisatanceView.vue Component Functional Tests
  // =========================================================================
  describe('AssisatanceView Component Tests', () => {

    it('UTC-33-AI-01 (Positive): sendMessage should post lyrics and append AI producer notes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analysis: 'Producer Recommendation: Key of C Major, 120 BPM' })
      });

      const wrapper = mount(AssisatanceView);
      wrapper.vm.userInput = 'Under the starry night...';

      wrapper.vm.sendMessage();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(wrapper.vm.userMessages.length).toBe(1);
      expect(wrapper.vm.userMessages[0].content).toBe('Under the starry night...');
      expect(global.fetch).toHaveBeenCalledWith('/api/ai-assistance', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ lyrics: 'Under the starry night...' })
      }));
      expect(wrapper.vm.aiMessages.length).toBe(1);
      expect(wrapper.vm.aiMessages[0].content).toContain('Producer Recommendation');
    });

    it('UTC-33-AI-02 (Negative): sendMessage should show error message if input is empty whitespace', () => {
      const wrapper = mount(AssisatanceView);
      wrapper.vm.userInput = '    ';

      wrapper.vm.sendMessage();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.errorMessage).toBe('The lyrics field cannot be empty. Enter your lyrics to proceed.');
    });

    it('UTC-33-AI-03 (Edge Case): sendMessage should trigger SweetAlert modal when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });

      const wrapper = mount(AssisatanceView);
      wrapper.vm.userInput = 'Valid lyrics string';

      wrapper.vm.sendMessage();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'error',
        title: 'Internet no connection',
        text: 'Unable to analyze lyrics'
      }));
    });

    it('UTC-33-AI-04 (Edge Case): saveAnalyzedLyrics should trigger alert if no analyzed notes exist', () => {
      const wrapper = mount(AssisatanceView);
      wrapper.vm.messages = []; // No AI messages

      wrapper.vm.saveAnalyzedLyrics();

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'error',
        title: 'No Analyzed Lyrics',
        text: 'No analyzed lyrics to save.'
      }));
    });
  });

});
