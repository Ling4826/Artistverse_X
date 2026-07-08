// UTC-13: Test MelodyView integration Methods
// Test Cases: 3
// Component: MelodyView.vue
//
// Test Purpose: Verify the integration between MelodyView and its child components
// Testing Methods: onNotesChanged(), onGenerateMidi(), onStartPlayback()
// Key Integrations: MelodyInputForm -> MelodyView -> MelodyControlPanel
// Services Tested: MidiService (MIDI generation), AudioService (audio playback)

import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MelodyView from '../views/MelodyView.vue';

// Mock Vue Router for navigation testing
const mockRouter = {
  push: vi.fn()
};

describe('UTC-13: Test MelodyView integration Methods', () => {  let wrapper;           // Vue component wrapper for testing
  let mockMidiService;   // Mock instance of MidiService for MIDI operations
  let mockAudioService;  // Mock instance of AudioService for audio playback
  let alertSpy;          // Spy for monitoring window.alert calls
  let consoleSpy;        // Spy for monitoring console.log calls

  beforeEach(() => {
    // Setup: Mock browser APIs and console functions
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Create mock MidiService with required methods for MIDI file operations
    mockMidiService = {
      generateMelodyMidiFile: vi.fn().mockReturnValue('mock-midi-data'),
      downloadMelodyMidiFile: vi.fn()
    };

    // Create mock AudioService with required methods for audio playback
    mockAudioService = {
      playMelodySequence: vi.fn().mockResolvedValue(() => {}),
      stopAll: vi.fn(),
      setGlobalVolume: vi.fn()
    };

    // Mount the MelodyView component with mocked router
    wrapper = mount(MelodyView, {
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });

    // Replace the real service instances with our mocks after component is mounted
    wrapper.vm.midiService = mockMidiService;    wrapper.vm.audioService = mockAudioService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // UTC-13-1: Verify notes change handling
  // Purpose: Test the onNotesChanged method in MelodyView integration
  // This method is called when MelodyInputForm emits 'notes-changed' event
  // It should update the currentNotes property and log the changes
  it('UTC-13-1: Verify notes change handling', () => {
    // Arrange: Prepare test data and reset component state
    const testNotes = [{ pitch: 'C', octave: 4 }];
    // Reset currentNotes to empty array to ensure clean test state
    wrapper.vm.currentNotes = [];
    expect(wrapper.vm.currentNotes).toEqual([]);

    // Act: Trigger the onNotesChanged method with test notes
    wrapper.vm.onNotesChanged(testNotes);

    // Assert: Verify state update and console logging
    expect(wrapper.vm.currentNotes).toEqual(testNotes);    expect(consoleSpy).toHaveBeenCalledWith('Notes updated:', testNotes);
  });

  // UTC-13-2: Verify MIDI generation process
  // Purpose: Test the onGenerateMidi method in MelodyView integration
  // This method is called when MelodyControlPanel emits 'generate-midi' event
  // It should call MidiService, update state, and handle the MIDI file generation
  it('UTC-13-2: Verify MIDI generation process', () => {
    // Arrange: Prepare test data with notes and settings
    const testData = {
      notes: [{ pitch: 'C', octave: 4 }],
      settings: { tempo: 120, numberOfBars: 1, noteDuration: 0.25 }
    };
    // Verify initial state before MIDI generation
    expect(wrapper.vm.isGeneratingMidi).toBe(false);
    expect(wrapper.vm.currentMidiFile).toBe(null);

    // Act: Trigger MIDI generation with test data
    wrapper.vm.onGenerateMidi(testData);

    // Assert: Verify MIDI file creation and service interaction
    expect(wrapper.vm.currentMidiFile).toBe('mock-midi-data');
    expect(mockMidiService.generateMelodyMidiFile).toHaveBeenCalledWith(
      testData.notes,
      testData.settings
    );
    expect(wrapper.vm.isGeneratingMidi).toBe(false); // Should be false after completion    expect(alertSpy).not.toHaveBeenCalled(); // errorHandled should be true (no error)
  });

  // UTC-13-3: Verify melody playback start
  // Purpose: Test the onStartPlayback method in MelodyView integration
  // This method is called when MelodyControlPanel emits 'start-playback' event
  // It should start audio playback using AudioService and manage playback state
  it('UTC-13-3: Verify melody playback start', async () => {
    // Arrange: Prepare test data with notes, settings, and instrument
    const testData = {
      notes: [{ pitch: 'C', octave: 4 }],
      settings: { tempo: 120 },
      instrument: 'piano'
    };
    // Verify initial playback state
    expect(wrapper.vm.isPreviewing).toBe(false);

    // Act: Start melody playback with test data
    await wrapper.vm.onStartPlayback(testData);

    // Assert: Verify playback state and AudioService interaction
    expect(wrapper.vm.isPreviewing).toBe(true);
    expect(mockAudioService.playMelodySequence).toHaveBeenCalledWith(
      testData.notes,
      testData.settings,
      testData.instrument,
      wrapper.vm.onNoteChange,
      wrapper.vm.onPlaybackComplete
    );
    expect(wrapper.vm.stopPlaybackFn).toBeDefined(); // callbacksProvided should be true
  });
});
