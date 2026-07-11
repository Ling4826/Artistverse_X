// UTC-12: Test MelodyControlPanel component Methods
// Test Cases: 3
// Component: MelodyControlPanel.vue

import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MelodyControlPanel from '../components/melody/MelodyControlPanel.vue';

describe('UTC-12: Test MelodyControlPanel component Methods', () => {
  let wrapper;
  let alertSpy;
  const defaultProps = {
    notes: [
      { note: 'C', octave: 4, duration: 1 },
      { note: 'D', octave: 4, duration: 0.5 },
      { note: 'E', octave: 4, duration: 0.25 }
    ],
    settings: {
      tempo: 60,
      noteDuration: 1,
      numberOfBars: 4
    }
  };

  beforeEach(() => {
    // Mock global alert
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock setInterval and clearInterval
    vi.spyOn(window, 'setInterval').mockImplementation((callback, delay) => {
      return setTimeout(callback, delay);
    });
    vi.spyOn(window, 'clearInterval').mockImplementation((id) => {
      clearTimeout(id);
    });

    wrapper = mount(MelodyControlPanel, {
      props: defaultProps
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });  
  
  // UTC-12-1: Verify MIDI generation with valid melody notes
  it('UTC-12-1: Verify MIDI generation with valid melody notes', () => {
    // Arrange
    expect(wrapper.vm.hasMidiFile).toBe(false);

    // Act - Call generateMidi when canGenerate = true
    wrapper.vm.generateMidi();

    // Assert
    const emittedEvents = wrapper.emitted('generate-midi');
    expect(emittedEvents).toBeDefined();
    expect(emittedEvents[0]).toEqual([{
      notes: defaultProps.notes,
      settings: defaultProps.settings,
      instrument: 'piano'
    }]);
    expect(wrapper.vm.hasMidiFile).toBe(true);
    expect(wrapper.vm.totalTime).not.toBe('0:00'); // totalTimeCalculated should be true
    expect(alertSpy).not.toHaveBeenCalled(); // alertNotCalled should be true
  });  
  
  // UTC-12-2: Verify playback toggle functionality
  it('UTC-12-2: Verify playback toggle functionality', () => {
    // Arrange - First generate MIDI file
    wrapper.vm.generateMidi();
    expect(wrapper.vm.isPlaying).toBe(false);

    // Act - Call togglePlayback when hasMidiFile = true, isPlaying = false
    wrapper.vm.togglePlayback();

    // Assert
    expect(wrapper.vm.isPlaying).toBe(true);
    const emittedEvents = wrapper.emitted('start-playback');
    expect(emittedEvents).toBeDefined();
    expect(emittedEvents[0]).toEqual([{
      notes: defaultProps.notes,
      settings: defaultProps.settings,
      instrument: 'piano'
    }]);
  });  
  
// UTC-12-3: Verify download MIDI with generated file
  it('UTC-12-3: Verify download MIDI with generated file', () => {
    // Arrange - First generate MIDI file
    wrapper.vm.generateMidi();

    // Act - Call downloadMidi when hasMidiFile = true
    wrapper.vm.downloadMidi();

    // Assert
    const emittedEvents = wrapper.emitted('download-midi');
    expect(emittedEvents).toBeDefined();
    expect(emittedEvents[0]).toEqual([{
      notes: defaultProps.notes,
      settings: defaultProps.settings,
      instrument: 'piano'
    }]);
    expect(wrapper.vm.hasMidiFile).toBe(true); // payloadIncludesInstrument should be true
    expect(alertSpy).not.toHaveBeenCalled(); // alertNotCalled should be true
  });
});
