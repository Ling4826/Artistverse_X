/**
 * Unit Test Case: UTC-31
 * Target Modules: 
 *   - ProgressionView.vue
 *   - services/MidiService.js
 * Description: Automated Functional Test Suite for Chord Progression & MIDI Engine
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ProgressionView from '../views/ProgressionView.vue';
import MidiService from '../services/MidiService.js';

// Mock Services
vi.mock('@/services/audioService', () => ({
  default: vi.fn().mockImplementation(() => ({
    preloadAllChords: vi.fn(),
    playSingleChord: vi.fn().mockResolvedValue(),
    playChordSequence: vi.fn().mockResolvedValue(() => {}),
    stopAll: vi.fn()
  }))
}));

vi.mock('../services/MidiService.js', () => {
  const OriginalMidiService = vi.importActual('../services/MidiService.js');
  return OriginalMidiService;
});

describe('UTC-31: Chord Progression & MIDI Engine Functional Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // SUB-SUITE 1: ProgressionView.vue Component Functional Tests
  // =========================================================================
  describe('ProgressionView Component Tests', () => {

    it('UTC-31-VIEW-01 (Positive): selectProgression should update key, progression, and displayed chords', () => {
      const wrapper = mount(ProgressionView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      wrapper.vm.selectProgression('1-5-6-4', 'C');

      expect(wrapper.vm.selectedKey).toBe('C');
      expect(wrapper.vm.originalKey).toBe('C');
      expect(wrapper.vm.selectedProgression).toBe('1-5-6-4');
      expect(wrapper.vm.displayedChords).toEqual(['C', 'G', 'Am', 'F']);
      expect(wrapper.vm.isProgressionSelected).toBe(true);
      expect(wrapper.vm.isCustomProgression).toBe(false);
    });

    it('UTC-31-VIEW-02 (Positive): applyCustomSettings should update custom beats per position', () => {
      const wrapper = mount(ProgressionView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      const customPayload = {
        chords: ['C', 'Am', 'F', 'G'],
        beatsByPosition: [3, 1, 2, 2],
        barCount: 4
      };

      wrapper.vm.applyCustomSettings(customPayload);

      expect(wrapper.vm.isUsingCustomBeats).toBe(true);
      expect(wrapper.vm.customBeatsByPosition).toEqual([3, 1, 2, 2]);
      expect(wrapper.vm.selectedKey).toBe('Custom');
      expect(wrapper.vm.selectedProgression).toBe('Custom');
      expect(wrapper.vm.displayedChords).toEqual(['C', 'Am', 'F', 'G']);
    });

    it('UTC-31-VIEW-03 (Negative): selectedBars watcher should clamp values below 1 or above 32', async () => {
      const wrapper = mount(ProgressionView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      // Set value below lower bound
      wrapper.vm.selectedBars = 0;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.selectedBars).toBe(1);

      // Set value above upper bound
      wrapper.vm.selectedBars = 50;
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.selectedBars).toBe(32);
    });

    it('UTC-31-VIEW-04 (Edge Case): Changing tempo during active playback should invoke stopPlaying', async () => {
      const wrapper = mount(ProgressionView, {
        global: {
          stubs: { 'router-link': true }
        }
      });

      const stopSpy = vi.spyOn(wrapper.vm, 'stopPlaying');
      wrapper.vm.isPlaying = true;

      // Trigger watcher by changing tempo
      wrapper.vm.tempo = 140;
      await wrapper.vm.$nextTick();

      expect(stopSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // SUB-SUITE 2: MidiService.js Unit Tests
  // =========================================================================
  describe('MidiService Engine Tests', () => {
    let midiService;

    beforeEach(() => {
      midiService = new MidiService();
    });

    it('UTC-31-MIDI-01 (Positive): chordToMidiNotes should convert standard chord names correctly', () => {
      expect(midiService.chordToMidiNotes('C')).toEqual([60, 64, 67]);
      expect(midiService.chordToMidiNotes('Am')).toEqual([69, 72, 76]);
      expect(midiService.chordToMidiNotes('G')).toEqual([67, 71, 74]);
    });

    it('UTC-31-MIDI-02 (Negative): chordToMidiNotes should fallback to C Major for unrecognized chord names', () => {
      const result = midiService.chordToMidiNotes('NonExistentChord');
      expect(result).toEqual([60, 64, 67]);
    });

    it('UTC-31-MIDI-03 (Positive): noteToMidiNumber should convert pitch and octave to standard MIDI note number', () => {
      // Middle C (C4) -> 60
      expect(midiService.noteToMidiNumber('C', 4)).toBe(60);
      // A4 -> 69
      expect(midiService.noteToMidiNumber('A', 4)).toBe(69);
    });

    it('UTC-31-MIDI-04 (Negative): noteToMidiNumber should fallback to 60 (Middle C) for invalid pitch or octave', () => {
      expect(midiService.noteToMidiNumber('InvalidPitch', 4)).toBe(60);
      expect(midiService.noteToMidiNumber('C', 999)).toBe(60);
    });

    it('UTC-31-MIDI-05 (Edge Case): generateMidiFileWithCustomBeats should return valid Uint8Array with MThd header', () => {
      const chords = ['C', 'G', 'Am', 'F'];
      const tempo = 120;
      const beats = [2, 2, 2, 2];

      const midiBytes = midiService.generateMidiFileWithCustomBeats(chords, tempo, beats);

      expect(midiBytes).toBeInstanceOf(Uint8Array);
      expect(midiBytes.length).toBeGreaterThan(20);
      // Header check: "MThd" -> 0x4D, 0x54, 0x68, 0x64
      expect(midiBytes[0]).toBe(0x4D);
      expect(midiBytes[1]).toBe(0x54);
      expect(midiBytes[2]).toBe(0x68);
      expect(midiBytes[3]).toBe(0x64);
    });
  });

});
