import { describe, test, expect, beforeEach } from 'vitest'
import AudioService from '../services/audioService.js'

describe('UTC-06: Test calculatePositionIndices Method', () => {
  let audioService

  beforeEach(() => {
    // สร้าง instance ของ AudioService ก่อนการทดสอบแต่ละครั้ง
    audioService = new AudioService()
  })

  /**
   * Test ID: UTC-06-1
   * Description: Verify position calculation with uniform beats
   * Input: { "sequenceIndex": 3, "beatsPerChord": 2 }
   * Expected Result: { "barIndex": 1, "chordIndex": 1 }
   */
  test('UTC-06-1: ทดสอบการคำนวณตำแหน่งด้วย uniform beats', () => {
    // Act: เรียกใช้ calculatePositionIndices method
    const result = audioService.calculatePositionIndices(3, 2)

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result.barIndex).toBe(1)
    expect(result.chordIndex).toBe(1)
  })

  /**
   * Test ID: UTC-06-2
   * Description: Verify position calculation with custom beats array
   * Input: { "sequenceIndex": 2, "beatsPerChord": [2, 1, 3, 2] }
   * Expected Result: { "barIndex": 0, "chordIndex": 2 }
   */
  test('UTC-06-2: ทดสอบการคำนวณตำแหน่งด้วย custom beats array', () => {
    // Act: เรียกใช้ calculatePositionIndices method
    const result = audioService.calculatePositionIndices(2, [2, 1, 3, 2])

    // Assert: ตรวจสอบผลลัพธ์ตามการทำงานจริง
    expect(result.barIndex).toBe(0)
    expect(result.chordIndex).toBe(2)
  })

  /**
   * Test ID: UTC-06-3
   * Description: Verify position calculation at sequence start
   * Input: { "sequenceIndex": 0, "beatsPerChord": 2 }
   * Expected Result: { "barIndex": 0, "chordIndex": 0 }
   */
  test('UTC-06-3: ทดสอบการคำนวณตำแหน่งที่จุดเริ่มต้น sequence', () => {
    // Act: เรียกใช้ calculatePositionIndices method
    const result = audioService.calculatePositionIndices(0, 2)

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result.barIndex).toBe(0)
    expect(result.chordIndex).toBe(0)
  })
})
