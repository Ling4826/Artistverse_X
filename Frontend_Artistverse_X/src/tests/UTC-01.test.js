/**
 * Unit Test Case: UTC-01
 * Test Function: selectProgression Method
 * Description: Test selectProgression method functionality to verify chord progression selection and state updates
 */

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProgressionView from '../views/ProgressionView.vue';

// Mock the services
vi.mock('@/services/audioService', () => ({
  default: vi.fn().mockImplementation(() => ({
    preloadAllChords: vi.fn(),
    stopAll: vi.fn()
  }))
}));

vi.mock('../services/MidiService.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    generateMidiFileWithCustomBeats: vi.fn(),
    downloadMidiFile: vi.fn()
  }))
}));

describe('UTC-01: Test selectProgression Method', () => {
  let wrapper;

  beforeEach(() => {
    // สร้าง wrapper สำหรับ component ก่อนการทดสอบแต่ละครั้ง
    wrapper = mount(ProgressionView, {
      global: {
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    });
  });

  /**
   * Test Case: UTC-01-1
   * Description: Verify that selecting a valid progression updates all relevant state variables
   * Input: progression: "1-5-6-4", key: "C"
   * Expected Result: 
   * - selectedKey: "C"
   * - originalKey: "C" 
   * - selectedProgression: "1-5-6-4"
   * - displayedChords: ["C", "G", "Am", "F"]
   * - isProgressionSelected: true
   * - isCustomProgression: false
   * - isUsingCustomBeats: false
   * - beatsPerChord: 2
   */
  it('UTC-01-1: Should update all relevant state when selecting valid progression', () => {
    // Act: เรียกใช้ selectProgression method
    wrapper.vm.selectProgression("1-5-6-4", "C");

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(wrapper.vm.selectedKey).toBe("C");
    expect(wrapper.vm.originalKey).toBe("C");
    expect(wrapper.vm.selectedProgression).toBe("1-5-6-4");
    expect(wrapper.vm.displayedChords).toEqual(["C", "G", "Am", "F"]);
    expect(wrapper.vm.isProgressionSelected).toBe(true);
    expect(wrapper.vm.isCustomProgression).toBe(false);
    expect(wrapper.vm.isUsingCustomBeats).toBe(false);
    expect(wrapper.vm.beatsPerChord).toBe(2);
  });
});
