/**
 * Unit Test Case: UTC-32
 * Target Component: RecommendSongView.vue
 * Description: Automated Functional Test Suite for Emotion Detector & Song Recommender Engine
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import RecommendSongView from '../views/RecommendSongView.vue';

describe('UTC-32: Emotion Song Recommender Functional Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // Mock HTMLCanvasElement prototype methods for JSDOM
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn()
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,mockImageData');

    const mockTrack = { stop: vi.fn() };
    const mockStream = { getTracks: () => [mockTrack] };

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream)
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('UTC-32-REC-01 (Positive): Should set hasCameraPermission to true when user allows camera access', async () => {
    const wrapper = mount(RecommendSongView);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(wrapper.vm.hasCameraPermission).toBe(true);
  });

  it('UTC-32-REC-02 (Negative): Should set hasCameraPermission to false and display error if camera access denied', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

    const wrapper = mount(RecommendSongView);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.vm.hasCameraPermission).toBe(false);
    expect(wrapper.text()).toContain('Camera access is required to detect your mood');
  });

  it('UTC-32-REC-03 (Positive): captureEmotion should parse songs array and update emotion state', async () => {
    const mockSongs = [
      { Name: 'Sunny Day', Artist: 'Artist A', Album: 'Summer', Image: 'a.jpg', Spotify_link: 'http://spotify.com/1' }
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        emotion: 'Happy',
        songs: JSON.stringify(mockSongs)
      })
    });

    const wrapper = mount(RecommendSongView);
    wrapper.vm.captureEmotion();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(global.fetch).toHaveBeenCalledWith('/api/detect-emotion', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: 'data:image/jpeg;base64,mockImageData' })
    }));
    expect(wrapper.vm.emotion).toBe('Happy');
    expect(wrapper.vm.data).toEqual(mockSongs);
    expect(wrapper.vm.errorMessage).toBeNull();
  });

  it('UTC-32-REC-04 (Negative): captureEmotion should display error message if emotion detection fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: 'No face detected in video frame'
      })
    });

    const wrapper = mount(RecommendSongView);
    wrapper.vm.captureEmotion();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.vm.errorMessage).toBe('No face detected in video frame');
  });

  it('UTC-32-REC-05 (Edge Case): captureEmotion should set Camera not ready if videoElement ref is missing', async () => {
    const wrapper = mount(RecommendSongView);
    
    // Override videoElement ref property to null
    Object.defineProperty(wrapper.vm.$refs, 'videoElement', {
      value: null,
      writable: true,
      configurable: true
    });

    wrapper.vm.captureEmotion();

    expect(wrapper.vm.errorMessage).toBe('Camera not ready');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('UTC-32-REC-06 (Edge Case): captureEmotion should handle network fetch error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(RecommendSongView);
    wrapper.vm.captureEmotion();

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(wrapper.vm.errorMessage).toBe('Mood could not be detected, Try again');
  });

  it('UTC-32-REC-07 (Positive): reset should restore state variables to initial empty values', () => {
    const wrapper = mount(RecommendSongView);
    wrapper.vm.data = [{ Name: 'Test' }];
    wrapper.vm.emotion = 'Happy';
    wrapper.vm.countDown = 3;
    wrapper.vm.showResetButton = true;

    wrapper.vm.reset();

    expect(wrapper.vm.data).toEqual([]);
    expect(wrapper.vm.emotion).toBeNull();
    expect(wrapper.vm.countDown).toBe(0);
    expect(wrapper.vm.showResetButton).toBe(false);
    expect(wrapper.vm.errorMessage).toBeNull();
  });

});
