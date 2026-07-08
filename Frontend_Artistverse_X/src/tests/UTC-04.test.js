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

describe('UTC-04: Test chordBarsDisplay Computed Property', () => {
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
   * Test ID: UTC-04-1
   * Description: Verify bars generated with uniform beats per chord
   * Input: { "displayedChords": ["C", "G", "Am", "F"], "selectedBars": 2, "beatsPerChord": 2, "isUsingCustomBeats": false }
   * Expected Result: { "bars": [{ "barNumber": 1, "chords": [{ "chord": "C", "beats": 2 }, { "chord": "G", "beats": 2 }] }, { "barNumber": 2, "chords": [{ "chord": "Am", "beats": 2 }, { "chord": "F", "beats": 2 }] }] }
   */
  test('UTC-04-1: ทดสอบการสร้าง bars ด้วย uniform beats per chord', () => {
    // Setup: ตั้งค่าข้อมูลเริ่มต้น
    wrapper.vm.displayedChords = ["C", "G", "Am", "F"]
    wrapper.vm.selectedBars = 2
    wrapper.vm.beatsPerChord = 2
    wrapper.vm.isUsingCustomBeats = false

    // Act: ดึงค่า computed property chordBarsDisplay
    const result = wrapper.vm.chordBarsDisplay

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result).toHaveLength(2)
    
    // ตรวจสอบ Bar 1
    expect(result[0]).toEqual({
      barNumber: 1,
      chords: [
        { chord: "C", beats: 2 },
        { chord: "G", beats: 2 }
      ]
    })
    
    // ตรวจสอบ Bar 2
    expect(result[1]).toEqual({
      barNumber: 2,
      chords: [
        { chord: "Am", beats: 2 },
        { chord: "F", beats: 2 }
      ]
    })
  })

  /**
   * Test ID: UTC-04-2
   * Description: Verify empty array when no chords are displayed
   * Input: { "displayedChords": [], "selectedBars": 4, "beatsPerChord": 2 }
   * Expected Result: { "bars": [] }
   */
  test('UTC-04-2: ทดสอบการส่งคืน empty array เมื่อไม่มี chords', () => {
    // Setup: ตั้งค่าข้อมูลเริ่มต้น
    wrapper.vm.displayedChords = []
    wrapper.vm.selectedBars = 4
    wrapper.vm.beatsPerChord = 2

    // Act: ดึงค่า computed property chordBarsDisplay
    const result = wrapper.vm.chordBarsDisplay

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result).toEqual([])
  })
})
