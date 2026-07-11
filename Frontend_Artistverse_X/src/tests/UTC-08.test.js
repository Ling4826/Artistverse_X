import { describe, test, expect, beforeEach, vi } from 'vitest'
import MidiService from '../services/MidiService.js'

describe('UTC-08: Test generateMidiFile Method (MidiService)', () => {
  let midiService

  beforeEach(() => {
    // สร้าง instance ของ MidiService
    midiService = new MidiService()
  })

  /**
   * Test ID: UTC-08-1
   * Description: Verify MIDI file generation with standard chord progression
   * Input: { "chords": ["C", "G", "Am", "F"], "tempo": 120, "beatsPerChord": 2 }
   * Expected Result: { "midiFileSize": ">0", "midiHeader": [77, 84, 104, 100], "trackCount": 1, "timeDivision": 480, "tempoEvent": "present", "noteEvents": 12 }
   */
  test('UTC-08-1: Verify MIDI file generation with standard chord progression', () => {
    // Arrange: เตรียมข้อมูล input
    const chords = ["C", "G", "Am", "F"]
    const tempo = 120
    const beatsPerChord = 2

    // Act: เรียกใช้ generateMidiFile method
    const midiFile = midiService.generateMidiFile(chords, tempo, beatsPerChord)

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
    
    // ตรวจสอบ note events = 12 (4 chords × 3 notes per chord)
    // นับ note on events (0x90)
    const noteOnEvents = midiBytes.filter(byte => byte === 0x90).length
    expect(noteOnEvents).toBe(12)
  })

  /**
   * Test ID: UTC-08-2  
   * Description: Verify MIDI file generation with custom beats per chord
   * Input: { "chords": ["C", "Am", "F", "G"], "tempo": 120, "beatsPerChord": [3, 1, 2, 2] }
   * Expected Result: { "midiFileSize": ">0", "midiHeader": [77, 84, 104, 100], "trackCount": 1, "timeDivision": 480, "tempoEvent": "present", "noteEvents": 12 }
   */
  test('UTC-08-2: Verify MIDI file generation with custom beats per chord', () => {
    // Arrange: เตรียมข้อมูล input ด้วย custom beats
    const chords = ["C", "Am", "F", "G"]
    const tempo = 120
    const beatsPerChord = [3, 1, 2, 2]

    // Act: เรียกใช้ generateMidiFileWithCustomBeats method
    const midiFile = midiService.generateMidiFileWithCustomBeats(chords, tempo, beatsPerChord)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ MIDI file size > 0
    expect(midiFile.length).toBeGreaterThan(0)
    
    // ตรวจสอบ MIDI header [77, 84, 104, 100] = "MThd" in ASCII
    expect(Array.from(midiFile.slice(0, 4))).toEqual([77, 84, 104, 100])
    
    // ตรวจสอบ track count = 1
    const trackCount = (midiFile[10] << 8) | midiFile[11]
    expect(trackCount).toBe(1)
    
    // ตรวจสอบ time division = 480
    const timeDivision = (midiFile[12] << 8) | midiFile[13]
    expect(timeDivision).toBe(480)
    
    // ตรวจสอบว่ามี tempo event
    const midiBytes = Array.from(midiFile)
    const hasTempoEvent = midiBytes.some((byte, index) => 
      byte === 0xFF && midiBytes[index + 1] === 0x51 && midiBytes[index + 2] === 0x03
    )
    expect(hasTempoEvent).toBe(true)
    
    // ตรวจสอบ note events = 12 (4 chords × 3 notes per chord)
    const noteOnEvents = midiBytes.filter(byte => byte === 0x90).length
    expect(noteOnEvents).toBe(12)
  })

  /**
   * Test ID: UTC-08-3
   * Description: Verify MIDI download functionality with proper filename format  
   * Input: { "chords": ["C", "G", "Am", "F"], "tempo": 120, "beatsPerChord": 2, "key": "C", "progression": "1-5-6-4" }
   * Expected Result: { "downloadTriggered": true, "filename": "chord-progression-C-1-5-6-4-120bpm.mid", "mimeType": "audio/midi", "blobSize": ">0" }
   */
  test('UTC-08-3: Verify MIDI download functionality with proper filename format', () => {
    // Arrange: เตรียมข้อมูล input และ mock DOM APIs
    const chords = ["C", "G", "Am", "F"]
    const tempo = 120
    const beatsPerChord = 2
    const key = "C"
    const progression = "1-5-6-4"

    // Generate MIDI file first (actual implementation needs the binary MIDI file)
    const midiFile = midiService.generateMidiFile(chords, tempo, beatsPerChord)

    // Mock DOM APIs
    const mockCreateElement = vi.fn()
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockLink)
    
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    const mockBlob = vi.fn().mockImplementation((content, options) => ({
      size: content[0].length,
      type: options.type
    }))
    
    // Mock window objects
    vi.stubGlobal('document', {
      createElement: mockCreateElement,
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    })
    
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    })

    vi.stubGlobal('Blob', mockBlob)

    // Act: เรียกใช้ downloadMidiFile method with correct signature
    midiService.downloadMidiFile(midiFile, key, progression, tempo)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบว่ามีการสร้าง link element
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    
    // ตรวจสอบ filename format
    const expectedFilename = "chord-progression-C-1-5-6-4-120bpm.mid"
    expect(mockLink.download).toBe(expectedFilename)
    
    // ตรวจสอบว่ามีการเรียก createObjectURL
    expect(mockCreateObjectURL).toHaveBeenCalled()
    
    // ตรวจสอบว่ามี Blob ถูกสร้างด้วย mime type ที่ถูกต้อง
    expect(mockBlob).toHaveBeenCalledWith(
      expect.any(Array),
      { type: 'audio/midi' }
    )
    
    // ตรวจสอบว่ามีการคลิก download link
    expect(mockLink.click).toHaveBeenCalled()
    
    // ตรวจสอบว่ามีการ revoke URL หลังการดาวน์โหลด
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })
})
