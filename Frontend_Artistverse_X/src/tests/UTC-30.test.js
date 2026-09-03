/**
 * Unit Test Case: UTC-30
 * Target Modules: 
 *   - SpotifyCallbackView.vue
 *   - stores/auth.js (useAuthStore Pinia store)
 * Description: Automated Functional Test Suite for Spotify OAuth 2.0 Authentication Flow
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import SpotifyCallbackView from '../views/SpotifyCallbackView.vue';
import { useAuthStore } from '../stores/auth.js';

// Mock router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
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

// Mock history.replaceState
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn()
  }
});

describe('UTC-30: Spotify Authentication & Callback Functional Tests', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    global.fetch = vi.fn();
    window.localStorage.clear();
    // Reset window.location.search
    delete window.location;
    window.location = new URL('http://localhost:3000/callback');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // SUB-SUITE 1: SpotifyCallbackView.vue Component Functional Tests
  // =========================================================================
  describe('SpotifyCallbackView Component Tests', () => {

    it('UTC-30-CB-01 (Positive): Should complete login flow when valid code is received in URL', async () => {
      window.location = new URL('http://localhost:3000/callback?code=spotify_valid_auth_code');

      const mockUserData = { id: 'user_123', display_name: 'Test Artist' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          access_token: 'acc_123',
          refresh_token: 'ref_123',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: mockUserData
        })
      });

      const wrapper = mount(SpotifyCallbackView);

      // Wait for async onMounted lifecycle hook
      await new Promise((resolve) => setTimeout(resolve, 50));

      const authStore = useAuthStore();
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUserData);
      expect(wrapper.vm.success).toBe(true);
      expect(wrapper.vm.isLoading).toBe(false);
      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('UTC-30-CB-02 (Negative): Should display error when Spotify returns authorization error in query params', async () => {
      window.location = new URL('http://localhost:3000/callback?error=access_denied');

      const wrapper = mount(SpotifyCallbackView);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.error).toBe('Spotify authorization error: access_denied');
      expect(wrapper.vm.isLoading).toBe(false);
      expect(wrapper.text()).toContain('Login Failed');
    });

    it('UTC-30-CB-03 (Negative): Should display error when code parameter is missing from callback URL', async () => {
      window.location = new URL('http://localhost:3000/callback');

      const wrapper = mount(SpotifyCallbackView);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(wrapper.vm.error).toBe('No authorization code received from Spotify');
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('UTC-30-CB-04 (Edge Case): Should navigate to homepage when goHome is triggered', () => {
      const wrapper = mount(SpotifyCallbackView);
      wrapper.vm.goHome();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // =========================================================================
  // SUB-SUITE 2: Pinia Auth Store (auth.js) Unit Tests
  // =========================================================================
  describe('useAuthStore Actions & Getters Tests', () => {

    it('UTC-30-STORE-01 (Positive): setAuth should store credentials in state and localStorage', () => {
      const authStore = useAuthStore();
      const mockAuthData = {
        user: { id: 'usr_1', display_name: 'Alice' },
        access_token: 'at_secret',
        refresh_token: 'rt_secret',
        expires_at: 1700000000
      };

      authStore.setAuth(mockAuthData);

      expect(authStore.user).toEqual(mockAuthData.user);
      expect(authStore.accessToken).toBe('at_secret');
      expect(authStore.isAuthenticated).toBe(true);
      expect(window.localStorage.getItem('spotify_access_token')).toBe('at_secret');
      expect(window.localStorage.getItem('spotify_refresh_token')).toBe('rt_secret');
    });

    it('UTC-30-STORE-02 (Positive): clearAuth should reset all state variables and clear localStorage', () => {
      const authStore = useAuthStore();
      window.localStorage.setItem('spotify_access_token', 'temp_token');

      authStore.clearAuth();

      expect(authStore.user).toBeNull();
      expect(authStore.accessToken).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
      expect(window.localStorage.getItem('spotify_access_token')).toBeNull();
    });

    it('UTC-30-STORE-03 (Edge Case): isTokenExpired should correctly compute token expiration status', () => {
      const authStore = useAuthStore();

      // Expired token (100 seconds in the past)
      authStore.expiresAt = Math.floor(Date.now() / 1000) - 100;
      expect(authStore.isTokenExpired).toBe(true);

      // Valid token (3600 seconds in the future)
      authStore.expiresAt = Math.floor(Date.now() / 1000) + 3600;
      expect(authStore.isTokenExpired).toBe(false);
    });

    it('UTC-30-STORE-04 (Negative): refreshAccessToken should clearAuth if refresh_token is missing', async () => {
      const authStore = useAuthStore();
      authStore.refreshToken = null;

      const result = await authStore.refreshAccessToken();

      expect(result).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('UTC-30-STORE-05 (Edge Case): initializeAuth should gracefully handle corrupted JSON in localStorage', () => {
      window.localStorage.setItem('spotify_user', '{corrupted_json_string');

      const authStore = useAuthStore();
      authStore.initializeAuth();

      expect(authStore.user).toBeNull();
      expect(window.localStorage.getItem('spotify_user')).toBeNull();
    });
  });

});
