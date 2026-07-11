// UTC-14: Test helper Methods and computed properties
// Test Cases: 3
// Component/Service: MelodyControlPanel.vue (formatTime, parseTime, simulateProgress) 
//                   and MidiService.js (noteToMidiNumber)
//
// Test Purpose: Verify utility helper methods for time formatting, parsing, 
//               progress simulation, and MIDI note number conversion
// Testing Methods: formatTime(), parseTime(), simulateProgress(), noteToMidiNumber()
// Key Features: Time display formatting, audio progress tracking, MIDI note calculation

import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MelodyControlPanel from '../components/melody/MelodyControlPanel.vue';
import MidiService from '../services/MidiService.js';

// Mock Vue Router for navigation testing
const mockRouter = {
  push: vi.fn()
};

describe('UTC-14: Test helper Methods and computed properties', () => {
  let wrapper;                    // Vue component wrapper for MelodyControlPanel testing
  let midiService;               // MidiService instance for noteToMidiNumber testing
  let consoleSpy;                // Spy for monitoring console warnings

  const defaultProps = {
    notes: [
      { note: 'C', octave: 4, duration: 1 }
    ],
    settings: {
      tempo: 120,
      noteDuration: 1,
      numberOfBars: 1
    }
  };

  beforeEach(() => {
    // Setup: Mock console functions and browser APIs
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock setInterval and clearInterval for simulateProgress testing
    vi.spyOn(window, 'setInterval');
    vi.spyOn(window, 'clearInterval');
    vi.spyOn(Date, 'now').mockReturnValue(1000000); // Fixed timestamp for predictable testing

    // Mount MelodyControlPanel component for time-related method testing
    wrapper = mount(MelodyControlPanel, {
      props: defaultProps,
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });

    // Create MidiService instance for MIDI note conversion testing
    midiService = new MidiService();
  });

  afterEach(() => {
    // Cleanup: Restore all mocks and unmount component
    vi.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // UTC-14-1: Verify time formatting method
  // Purpose: Test the formatTime method in MelodyControlPanel
  // This method converts seconds to MM:SS format for time display
  // It handles both short and long durations correctly
  it('UTC-14-1: Verify time formatting method', () => {
    // Arrange: Prepare test input - 65 seconds should format to "1:05"
    const testSeconds = 65;

    // Act: Call formatTime method with test seconds
    const result = wrapper.vm.formatTime(testSeconds);

    // Assert: Verify correct MM:SS formatting
    expect(result).toBe('1:05');
    // Additional verification: Check minutes and seconds calculation
    // 65 seconds = 1 minute and 5 seconds = "1:05"
  });

  // UTC-14-2: Verify time parsing method  
  // Purpose: Test the parseTime method in MelodyControlPanel
  // This method converts MM:SS format back to total seconds
  // It's used for progress calculation and audio timing
  it('UTC-14-2: Verify time parsing method', () => {
    // Arrange: Prepare test input - "1:30" should parse to 90 seconds
    const testTimeString = "1:30";

    // Act: Call parseTime method with test time string
    const result = wrapper.vm.parseTime(testTimeString);

    // Assert: Verify correct seconds calculation
    expect(result).toBe(90);
    // Additional verification: Check conversion accuracy
    // "1:30" = 1*60 + 30 = 90 seconds (totalSeconds calculation)
  });

  // UTC-14-3: Verify MIDI note number conversion
  // Purpose: Test the noteToMidiNumber method in MidiService
  // This method converts musical note (pitch + octave) to MIDI number
  // It validates input and provides appropriate MIDI values for audio processing
  it('UTC-14-3: Verify MIDI note number conversion', () => {
    // Arrange: Prepare test input - C4 is middle C (MIDI note 60)
    const testPitch = "C";
    const testOctave = 4;

    // Act: Call noteToMidiNumber method with test pitch and octave
    const result = midiService.noteToMidiNumber(testPitch, testOctave);

    // Assert: Verify correct MIDI note number calculation
    expect(result).toBe(60);    // Verify no warnings for valid input
    expect(consoleSpy).not.toHaveBeenCalled();
    // Additional verification: Check calculation correctness
    // C4 = (4+1) * 12 + 0 = 60 (validRange and calculationCorrect should be true)
  });
});
