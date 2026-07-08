import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressionView from '../views/ProgressionView.vue'

// Mock the services
vi.mock('@/services/audioService', () => ({
  default: vi.fn().mockImplementation(() => ({
    preloadAllChords: vi.fn(),
    stopAll: vi.fn()
  }))
}))

vi.mock('../services/MidiService.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    generateMidiFileWithCustomBeats: vi.fn(),
    downloadMidiFile: vi.fn()
  }))
}))

describe('UTC-05: Test applyCustomSettings Method', () => {
  let wrapper

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
    })
  })

  /**
   * Test ID: UTC-05-1
   * Description: Verify custom settings with beats per position are applied correctly
   * Input: { "chords": ["C", "Am", "F", "G"], "beatsByPosition": [2, 1, 3, 2], "barCount": 3 }
   * Expected Result: { 
   *   "displayedChords": ["C", "Am", "F", "G"], 
   *   "customBeatsByPosition": [2, 1, 3, 2], 
   *   "selectedBars": 3, 
   *   "isUsingCustomBeats": true, 
   *   "isCustomProgression": true, 
   *   "selectedProgression": "Custom", 
   *   "selectedKey": "Custom", 
   *   "isProgressionSelected": true, 
   *   "highlightedChords": [] 
   * }
   */
  test('UTC-05-1: ทดสอบการ apply custom settings ด้วย beats per position', () => {
    // Setup: เตรียมข้อมูล customSettings
    const customSettings = {
      chords: ["C", "Am", "F", "G"],
      beatsByPosition: [2, 1, 3, 2],
      barCount: 3
    }

    // Act: เรียกใช้ method applyCustomSettings
    wrapper.vm.applyCustomSettings(customSettings)

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(wrapper.vm.displayedChords).toEqual(["C", "Am", "F", "G"])
    expect(wrapper.vm.customBeatsByPosition).toEqual([2, 1, 3, 2])
    expect(wrapper.vm.selectedBars).toBe(3)
    expect(wrapper.vm.isUsingCustomBeats).toBe(true)
    expect(wrapper.vm.isCustomProgression).toBe(true)
    expect(wrapper.vm.selectedProgression).toBe("Custom")
    expect(wrapper.vm.selectedKey).toBe("Custom")
    expect(wrapper.vm.isProgressionSelected).toBe(true)
    expect(wrapper.vm.highlightedChords).toEqual([])
  })
})
