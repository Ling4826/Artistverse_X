/**
 * Unit Test Case: UTC-29
 * Target Components: 
 *   - LyricsGeneratorGenreView.vue
 *   - LyricsGeneratorMood.vue
 *   - LyricsGeneratorArtistView.vue
 * Description: Automated Functional Test Suite for Lyrics Generator Module
 *              (Positive Cases, Negative Cases & Edge Cases)
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Swal from 'sweetalert2';
import LyricsGeneratorGenreView from '../views/LyricsGeneratorGenreView.vue';
import LyricsGeneratorMoodView from '../views/LyricsGeneratorMood.vue';
import LyricsGeneratorArtistView from '../views/LyricsGeneratorArtistView.vue';

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

// Mock EditAndSaveLyricsButton component
vi.mock('@/components/EditAndSaveLyricsButton.vue', () => ({
  default: {
    name: 'EditAndSaveLyricsButton',
    template: '<div class="mock-edit-save-button"></div>',
    props: ['lyrics', 'filename']
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

describe('UTC-29: Lyrics Generator Module Functional Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SUB-SUITE 1: Lyrics Generator by Genre (LyricsGeneratorGenreView.vue)
  // =========================================================================
  describe('LyricsGeneratorGenreView Tests', () => {

    it('UTC-29-GEN-01 (Positive): Should generate lyrics successfully with valid inputs', async () => {
      const mockLyricsResponse = 'Verse 1:\nSummer breeze, dynamic pop sound...';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lyrics: mockLyricsResponse })
      });

      const wrapper = mount(LyricsGeneratorGenreView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      // Set valid form data
      wrapper.vm.prompt = 'Summer Beach';
      wrapper.vm.genre = 'Pop';
      wrapper.vm.language = 'English';

      // Trigger generation
      await wrapper.vm.generateLyrics();

      // Assertions
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/generate-lyrics-genre', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Summer Beach', genre: 'Pop', language: 'English' })
      }));
      expect(wrapper.vm.lyrics).toBe(mockLyricsResponse);
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.text).toBe(false);
    });

    it('UTC-29-GEN-02 (Negative): Should block submission and show validation error if inputs are missing', async () => {
      const wrapper = mount(LyricsGeneratorGenreView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      // Leave fields empty
      wrapper.vm.prompt = '';
      wrapper.vm.genre = '';
      wrapper.vm.language = '';

      // Trigger generation
      await wrapper.vm.generateLyrics();

      // Assertions
      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.errors.prompt).toBe('Please input a lyric topic.');
      expect(wrapper.vm.errors.genre).toBe('Please select a genre.');
      expect(wrapper.vm.errors.language).toBe('Please select a language.');
    });

    it('UTC-29-GEN-03 (Edge Case): Should display SweetAlert modal on network failure (Failed to fetch)', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      const wrapper = mount(LyricsGeneratorGenreView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.prompt = 'Rainy Day';
      wrapper.vm.genre = 'Indie';
      wrapper.vm.language = 'Thai';

      await wrapper.vm.generateLyrics();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'error',
        title: 'Internet no connection',
        text: 'Unable to compose lyrics'
      }));
      expect(wrapper.vm.loading).toBe(false);
    });

    it('UTC-29-GEN-04 (Edge Case): Should restore pre-edited lyrics from localStorage on mount', () => {
      const preSavedLyrics = 'Pre-edited lyrics from previous session';
      window.localStorage.setItem('lyrics_after_edit', preSavedLyrics);

      const wrapper = mount(LyricsGeneratorGenreView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      expect(wrapper.vm.lyrics).toBe(preSavedLyrics);
      expect(window.localStorage.getItem('lyrics_after_edit')).toBeNull();
    });
  });

  // =========================================================================
  // SUB-SUITE 2: Lyrics Generator by Mood (LyricsGeneratorMood.vue)
  // =========================================================================
  describe('LyricsGeneratorMood Tests', () => {

    it('UTC-29-MOOD-01 (Positive): Should generate lyrics successfully with valid mood inputs', async () => {
      const mockLyricsResponse = 'Chill mood lyrics under the moonlight...';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lyrics: mockLyricsResponse })
      });

      const wrapper = mount(LyricsGeneratorMoodView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.prompt = 'Midnight Walk';
      wrapper.vm.mood = 'chill';
      wrapper.vm.language = 'English';

      await wrapper.vm.generateLyrics();

      expect(global.fetch).toHaveBeenCalledWith('/api/generate-lyrics-mood', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ prompt: 'Midnight Walk', mood: 'chill', language: 'English' })
      }));
      expect(wrapper.vm.lyrics).toBe(mockLyricsResponse);
    });

    it('UTC-29-MOOD-02 (Negative): Should fail validation if mood is unselected', async () => {
      const wrapper = mount(LyricsGeneratorMoodView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.prompt = 'Happy Days';
      wrapper.vm.mood = '';
      wrapper.vm.language = 'Thai';

      await wrapper.vm.generateLyrics();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.errors.mood).toBe('Please select a mood.');
    });
  });

  // =========================================================================
  // SUB-SUITE 3: Lyrics Generator by Artist (LyricsGeneratorArtistView.vue)
  // =========================================================================
  describe('LyricsGeneratorArtistView Tests', () => {

    it('UTC-29-ART-01 (Positive): Should generate lyrics in artist style with valid inputs', async () => {
      const mockLyricsResponse = 'Strumming guitar in Ed Sheeran style...';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lyrics: mockLyricsResponse })
      });

      const wrapper = mount(LyricsGeneratorArtistView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.prompt = 'Love Story';
      wrapper.vm.artist = 'Ed Sheeran';
      wrapper.vm.language = 'English';

      await wrapper.vm.generateLyrics();

      expect(global.fetch).toHaveBeenCalledWith('/api/generate-lyrics-artist', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ prompt: 'Love Story', artist: 'Ed Sheeran', language: 'English' })
      }));
      expect(wrapper.vm.lyrics).toBe(mockLyricsResponse);
    });

    it('UTC-29-ART-02 (Negative): Should fail validation if artist is unselected', async () => {
      const wrapper = mount(LyricsGeneratorArtistView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.prompt = 'Acoustic Vibe';
      wrapper.vm.artist = '';
      wrapper.vm.language = 'English';

      await wrapper.vm.generateLyrics();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.errors.artist).toBe('Please select an artist.');
    });
  });

});
