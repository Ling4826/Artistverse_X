/**
 * Unit Test Case: UTC-02
 * Test Function: chordToMidiNotes Method
 * Description: Test chordToMidiNotes method functionality to verify chord to MIDI notes conversion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import MidiService from '../services/MidiService.js';

describe('UTC-02: Test chordToMidiNotes Method', () => {
  let midiService;

  beforeEach(() => {
    // สร้าง instance ของ MidiService ก่อนการทดสอบแต่ละครั้ง
    midiService = new MidiService();
  });

  /**
   * Test Case: UTC-02-1
   * Description: Verify that major chord C returns correct MIDI notes
   * Input: { chordName: "C" }
   * Expected Result: { midiNotes: [60, 64, 67] }
   */
  it('UTC-02-1: Should return correct MIDI notes for major chord C', () => {
    // Act: เรียกใช้ chordToMidiNotes method กับ chord C
    const result = midiService.chordToMidiNotes("C");

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result).toEqual([60, 64, 67]);
  });

  /**
   * Test Case: UTC-02-2
   * Description: Verify that minor chord Am returns correct MIDI notes
   * Input: { chordName: "Am" }
   * Expected Result: { midiNotes: [69, 72, 76] }
   */
  it('UTC-02-2: Should return correct MIDI notes for minor chord Am', () => {
    // Act: เรียกใช้ chordToMidiNotes method กับ chord Am
    const result = midiService.chordToMidiNotes("Am");

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result).toEqual([69, 72, 76]);
  });

  /**
   * Test Case: UTC-02-3
   * Description: Verify that diminished chord Bdim returns correct MIDI notes
   * Input: { chordName: "Bdim" }
   * Expected Result: { midiNotes: [71, 74, 77] }
   */
  it('UTC-02-3: Should return correct MIDI notes for diminished chord Bdim', () => {
    // Act: เรียกใช้ chordToMidiNotes method กับ chord Bdim
    const result = midiService.chordToMidiNotes("Bdim");

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง
    expect(result).toEqual([71, 74, 77]);
  });

  /**
   * Test Case: UTC-02-4
   * Description: Verify that unknown chord defaults to C major
   * Input: { chordName: "Unknown" }
   * Expected Result: { midiNotes: [60, 64, 67] }
   */
  it('UTC-02-4: Should return default C major MIDI notes for unknown chord', () => {
    // Act: เรียกใช้ chordToMidiNotes method กับ chord ที่ไม่รู้จัก
    const result = midiService.chordToMidiNotes("Unknown");

    // Assert: ตรวจสอบผลลัพธ์ตามที่คาดหวัง (default เป็น C major)
    expect(result).toEqual([60, 64, 67]);
  });
});
