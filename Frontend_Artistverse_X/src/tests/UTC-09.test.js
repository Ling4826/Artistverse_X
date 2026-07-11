import { describe, test, expect, beforeEach } from 'vitest'
import MidiService from '../services/MidiService.js'

describe('UTC-09: Test feature 2 generateMelodyMidiFile Method (MidiService)', () => {
  let midiService

  beforeEach(() => {
    // สร้าง instance ของ MidiService
    midiService = new MidiService()
  })

  /**
   * Test ID: UTC-09-1
   * Description: Verify melody MIDI file generation with single note
   * Input: { "notes": [{ "pitch": "C", "octave": 4}], "settings": { "tempo": 120, "numberOfBars": 1, "noteDuration": 0.25 } }
   * Expected Result: { "midiFileSize": ">0", "midiHeader": [77, 84, 104, 100], "trackCount": 1, "timeDivision": 480, "tempoEvent": "present" }
   */
  test('UTC-09-1: Verify melody MIDI file generation with single note', () => {
    // Arrange: เตรียมข้อมูล input
    const notes = [{ "pitch": "C", "octave": 4 }]
    const settings = {
      "tempo": 120,
      "numberOfBars": 1,
      "noteDuration": 0.25
    }

    // Act: เรียกใช้ generateMelodyMidiFile method
    const midiFile = midiService.generateMelodyMidiFile(notes, settings)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ MIDI file size > 0
    expect(midiFile.length).toBeGreaterThan(0)
    
    // ตรวจสอบ MIDI header [77, 84, 104, 100] = "MThd" in ASCII
    expect(Array.from(midiFile.slice(0, 4))).toEqual([77, 84, 104, 100])
    
    // ตรวจสอบ track count = 1 (bytes 10-11 in header)
    const trackCount = (midiFile[10] << 8) | midiFile[11]
    expect(trackCount).toBe(1)
    
    // ตรวจสอบ time division = 480 (bytes 12-13 in header)
    const timeDivision = (midiFile[12] << 8) | midiFile[13]
    expect(timeDivision).toBe(480)
    
    // ตรวจสอบว่ามี tempo event โดยการค้นหา tempo meta event (FF 51 03)
    const midiBytes = Array.from(midiFile)
    const hasTempoEvent = midiBytes.some((byte, index) => 
      byte === 0xFF && midiBytes[index + 1] === 0x51 && midiBytes[index + 2] === 0x03
    )
    expect(hasTempoEvent).toBe(true)
  })  /**
   * Test ID: UTC-09-2  
   * Description: Verify melody MIDI file generation with multiple notes and bar filling
   * Input: { "notes": [{"pitch": "C", "octave": 4}, {"pitch": "D", "octave": 4}], "settings": {"tempo": 120, "numberOfBars": 2, "noteDuration": 0.25} }
   * Expected Result: { "midiFileSize": ">0", "totalNotesToGenerate": 2, "useExactNotes": true, "notePattern": "exact" }
   */
  test('UTC-09-2: Verify melody MIDI file generation with multiple notes and bar filling', () => {
    // Arrange: เตรียมข้อมูล input - ใช้ 2 notes
    const notes = [
      { "pitch": "C", "octave": 4 },
      { "pitch": "D", "octave": 4 }
    ]
    const settings = {
      "tempo": 120,
      "numberOfBars": 2,
      "noteDuration": 0.25
    }

    // Act: เรียกใช้ generateMelodyMidiFile method
    const midiFile = midiService.generateMelodyMidiFile(notes, settings)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ MIDI file size > 0
    expect(midiFile.length).toBeGreaterThan(0)

    // ตรวจสอบว่าใช้ useExactNotes = true (เนื่องจาก notes.length < 4)
    // และ totalNotesToGenerate = 2 (ใช้เพียง notes ที่ให้มา)
    const midiBytes = Array.from(midiFile)
    const noteOnEvents = midiBytes.filter(byte => byte === 0x90).length
    expect(noteOnEvents).toBe(2) // totalNotesToGenerate = 2 

    // ตรวจสอบ notePattern = "exact" (ใช้ notes ตามที่ให้มาเท่านั้น)
    expect(noteOnEvents).toBe(notes.length) // แสดงว่าใช้ exact notes ไม่มี cycle
  })

  /**
   * Test ID: UTC-09-3
   * Description: Verify melody MIDI file generation with exact notes mode
   * Input: { "notes": [{ "pitch": "C", "octave": 4}, { "pitch": "G", "octave": 4}], "settings": { "tempo": 100, "numberOfBars": 4, "noteDuration": 0.5 } }
   * Expected Result: { "midiFileSize": ">0", "totalNotesToGenerate": 2, "useExactNotes": true, "midiNoteNumbers": [60, 67] }
   */
  test('UTC-09-3: Verify melody MIDI file generation with exact notes mode', () => {
    // Arrange: เตรียมข้อมูล input
    const notes = [
      { "pitch": "C", "octave": 4 },
      { "pitch": "G", "octave": 4 }
    ]
    const settings = {
      "tempo": 100,
      "numberOfBars": 4,
      "noteDuration": 0.5
    }

    // Act: เรียกใช้ generateMelodyMidiFile method
    const midiFile = midiService.generateMelodyMidiFile(notes, settings)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ MIDI file size > 0
    expect(midiFile.length).toBeGreaterThan(0)

    // ตรวจสอบว่าใช้ useExactNotes = true (เนื่องจาก notes.length < 4)
    const midiBytes = Array.from(midiFile)
    const noteOnEvents = midiBytes.filter(byte => byte === 0x90).length
    expect(noteOnEvents).toBe(2) // totalNotesToGenerate = 2 (ใช้ exact notes)

    // ตรวจสอบ MIDI note numbers ที่ถูกต้อง
    // C4 = 60, G4 = 67
    const expectedMidiNotes = [60, 67]
    
    // หา note events ใน MIDI bytes
    const noteEvents = []
    for (let i = 0; i < midiBytes.length - 2; i++) {
      if (midiBytes[i] === 0x90) { // Note on event
        noteEvents.push(midiBytes[i + 1]) // Note number
      }
    }
    
    expect(noteEvents).toEqual(expectedMidiNotes)
  })
})
