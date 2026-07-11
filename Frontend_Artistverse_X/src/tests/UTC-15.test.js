// UTC-15: Test EditAndSaveLyricsButton component Methods
// Test Cases: 4
// Component: EditAndSaveLyricsButton.vue
//
// Test Purpose: Verify the functionality of lyrics management actions
// Testing Methods: saveLyrics(), goToEditLyrics(), regenerateLyrics()
// Key Features: File download, navigation, localStorage, offline handling, event emission

import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import EditAndSaveLyricsButton from '../components/EditAndSaveLyricsButton.vue';

// Mock Vue Router for navigation testing
const mockRouter = {
  push: vi.fn()
};

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

describe('UTC-15: Test EditAndSaveLyricsButton component Methods', () => {
  let wrapper;                    // Vue component wrapper for testing
  let mockBlob;                   // Mock Blob constructor for file operations
  let mockURL;                    // Mock URL object for file download
  let mockAnchor;                 // Mock anchor element for download triggering
  let localStorageSpy;           // Spy for localStorage operations
  let navigatorSpy;              // Spy for navigator.onLine status

  const defaultProps = {
    lyrics: "Test lyrics content",
    filename: "lyrics.txt"
  };

  beforeEach(() => {
    // Setup: Mock browser APIs for file operations
      // Mock Blob constructor
    mockBlob = vi.fn().mockImplementation((content, options) => ({
      type: options.type,
      content: content
    }));
    Object.defineProperty(window, 'Blob', {
      value: mockBlob,
      writable: true
    });

    // Mock URL object for blob operations
    mockURL = {
      createObjectURL: vi.fn().mockReturnValue('mock-blob-url'),
      revokeObjectURL: vi.fn()
    };
    Object.defineProperty(window, 'URL', {
      value: mockURL,
      writable: true
    });    // Mock document.createElement for anchor element
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      insertBefore: vi.fn(),
      style: {},
      parentNode: {
        insertBefore: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      return {
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        insertBefore: vi.fn(),
        style: {},
        parentNode: {
          insertBefore: vi.fn(),
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      };
    });

    // Mock localStorage
    localStorageSpy = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    // Mock navigator.onLine (default to online)
    navigatorSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    // Mount component with mocked router
    wrapper = mount(EditAndSaveLyricsButton, {
      props: defaultProps,
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });
  });

  afterEach(() => {
    // Cleanup: Restore all mocks and unmount component
    vi.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // UTC-15-1: Verify lyrics save functionality
  // Purpose: Test the saveLyrics method for successful file download
  // This method creates a text file from lyrics and triggers download
  // It handles blob creation, URL generation, and anchor click simulation
  it('UTC-15-1: Verify lyrics save functionality', () => {
    // Arrange: Verify initial conditions and setup
    expect(navigator.onLine).toBe(true);

    // Act: Call saveLyrics method to trigger download
    wrapper.vm.saveLyrics();

    // Assert: Verify blob creation and download process
    expect(mockBlob).toHaveBeenCalledWith(['Test lyrics content'], { type: 'text/plain' });
    expect(mockURL.createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.href).toBe('mock-blob-url');
    expect(mockAnchor.download).toBe('lyrics.txt');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
    // blobCreated: true, downloadTriggered: true, filename: "lyrics.txt"
  });

  // UTC-15-2: Verify save fails when offline
  // Purpose: Test the saveLyrics method behavior when no internet connection
  // This method should show error dialog and prevent download when offline
  // It demonstrates proper offline state handling
  it('UTC-15-2: Verify save fails when offline', async () => {
    // Arrange: Mock offline state
    navigatorSpy.mockReturnValue(false);
    
    // Import SweetAlert2 mock
    const Swal = (await import('sweetalert2')).default;

    // Act: Call saveLyrics method when offline
    wrapper.vm.saveLyrics();

    // Assert: Verify error handling for offline state
    expect(Swal.fire).toHaveBeenCalledWith({
      icon: "error",
      title: "No internet connection.",
      text: "Unable to save lyrics",
      customClass: {
        popup: 'swal2-top-center',
      },
      position: 'top',
    });
    // swalCalled: true, errorTitle: "No internet connection.", downloadNotTriggered: true
    expect(mockBlob).not.toHaveBeenCalled();
    expect(mockAnchor.click).not.toHaveBeenCalled();
  });

  // UTC-15-3: Verify navigation to edit page
  // Purpose: Test the goToEditLyrics method for proper navigation
  // This method should save lyrics to localStorage and navigate to edit page
  // It handles state persistence and routing correctly
  it('UTC-15-3: Verify navigation to edit page', () => {
    // Arrange: Verify lyrics exist
    expect(wrapper.vm.lyrics).toBe('Test lyrics content');

    // Act: Call goToEditLyrics method to navigate
    wrapper.vm.goToEditLyrics();

    // Assert: Verify localStorage storage and navigation
    expect(localStorageSpy.setItem).toHaveBeenCalledWith('lyrics_before_edit', 'Test lyrics content');
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'EditLyrics',
    });
    // localStorageSet: true, routerPushCalled: true, routeName: "EditLyrics"
  });  // UTC-15-4: Verify regenerate button emits event
  // Purpose: Test the regenerateLyrics method for proper event emission
  // This method should emit 'regenerate' event to parent component
  // It enables parent components to handle lyrics regeneration logic
  it('UTC-15-4: Verify regenerate button emits event', () => {
    // Arrange: Setup component state (no special setup needed)
    
    // Act: Call regenerateLyrics method to emit event
    wrapper.vm.regenerateLyrics();

    // Assert: Verify event emission
    const emittedEvents = wrapper.emitted('regenerate');
    expect(emittedEvents).toBeDefined();
    expect(emittedEvents).toHaveLength(1);
    // emittedEvent: "regenerate"
  });
});
