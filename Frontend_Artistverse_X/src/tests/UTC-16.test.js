// UTC-16: Test EditLyricsView component Methods
// Test Cases: 2
// Component: EditLyricsView.vue
//
// Test Purpose: Verify the functionality of lyrics editing actions
// Testing Methods: resetToOriginal(), saveToState()
// Key Features: State reset, localStorage operations, navigation

import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import EditLyricsView from '../views/EditLyricsView.vue';

// Mock Vue Router for navigation testing
const mockRouter = {
  push: vi.fn()
};

describe('UTC-16: Test EditLyricsView component Methods', () => {
  let wrapper;                    // Vue component wrapper for testing
  let localStorageSpy;           // Spy for localStorage operations

  beforeEach(() => {
    // Setup: Mock localStorage
    localStorageSpy = {
      setItem: vi.fn(),
      getItem: vi.fn().mockReturnValue('Original text'),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    // Mount component with mocked router
    wrapper = mount(EditLyricsView, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });

    // Set initial state for testing
    wrapper.vm.originalLyrics = 'Original text';
    wrapper.vm.editableLyrics = 'Modified text';
  });

  afterEach(() => {
    // Cleanup: Restore all mocks and unmount component
    vi.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // UTC-16-1: Verify reset functionality
  // Purpose: Test the resetToOriginal method for restoring original content
  // This method should reset editableLyrics back to originalLyrics content
  // It enables users to discard their changes and return to original state
  it('UTC-16-1: Verify reset functionality', () => {
    // Arrange: Set up test state with modified lyrics
    wrapper.vm.originalLyrics = 'Original text';
    wrapper.vm.editableLyrics = 'Modified text';
    expect(wrapper.vm.editableLyrics).toBe('Modified text');

    // Act: Call resetToOriginal method to restore original content
    wrapper.vm.resetToOriginal();

    // Assert: Verify editableLyrics is reset to original content
    expect(wrapper.vm.editableLyrics).toBe('Original text');
    // editableLyrics: "Original text" (restored from originalLyrics)
  });

  // UTC-16-2: Verify save to state functionality
  // Purpose: Test the saveToState method for saving and navigation
  // This method should save edited content to localStorage and navigate back
  // It handles persistence of user edits and proper routing
  it('UTC-16-2: Verify save to state functionality', () => {
    // Arrange: Set up test state with edited lyrics content
    wrapper.vm.editableLyrics = 'Edited lyrics content';
    expect(wrapper.vm.editableLyrics).toBe('Edited lyrics content');

    // Act: Call saveToState method to save and navigate
    wrapper.vm.saveToState();

    // Assert: Verify localStorage storage and navigation
    expect(localStorageSpy.setItem).toHaveBeenCalledWith('lyrics_after_edit', 'Edited lyrics content');
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'generate-lyrics-genre'
    });
    // localStorageSet: true, key: "lyrics_after_edit", routerPushCalled: true
  });
});
