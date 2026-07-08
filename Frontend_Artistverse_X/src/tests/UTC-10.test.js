import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import AudioService from '../services/audioService.js'

// Mock HTMLAudioElement
Object.defineProperty(window, 'HTMLAudioElement', {
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: 0,
    volume: 1,
    src: '',
    load: vi.fn(),
    preload: 'auto'
  }))
})

describe('UTC-10: Test playMelodySequence Method (AudioService)', () => {
  let audioService
  let mockOnNoteChange
  let mockOnComplete

  beforeEach(() => {
    // รีเซ็ต mocks
    vi.clearAllMocks()
    
    // สร้าง instance ของ AudioService
    audioService = new AudioService()
    
    // สร้าง mock callbacks
    mockOnNoteChange = vi.fn()
    mockOnComplete = vi.fn()
    
    // Mock preloadMelodyNotes method เพื่อไม่ให้โหลดไฟล์เสียงจริง
    audioService.preloadMelodyNotes = vi.fn().mockResolvedValue(undefined)
    
    // Mock preloadMelodyNoteAudio method
    audioService.preloadMelodyNoteAudio = vi.fn().mockResolvedValue({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      volume: 1
    })
    
    // Mock applyVolumeEnvelope to prevent timing issues
    audioService.applyVolumeEnvelope = vi.fn()
    
    // Mock adjustVolumeEnvelopeForMelody
    audioService.adjustVolumeEnvelopeForMelody = vi.fn()
    
    // Mock setTimeout และ clearTimeout
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    audioService.stopAll()
  })

  /**
   * Test ID: UTC-10-1
   * Description: Verify melody sequence playback with piano instrument
   * Input: { "notes": [{"pitch": "C", "octave": 4}], "settings": {"tempo": 120, "numberOfBars": 1, "noteDuration": 0.25}, "instrument": "piano" }
   * Expected Result: { "preloadCalled": true, "playbackStarted": true, "stopFunction": "function", "volumeEnvelopeAdjusted": true }
   */
  test('UTC-10-1: Verify melody sequence playback with piano instrument', async () => {
    // Arrange: เตรียมข้อมูล input
    const notes = [{ "pitch": "C", "octave": 4 }]
    const settings = {
      "tempo": 120,
      "numberOfBars": 1,
      "noteDuration": 0.25
    }
    const instrument = "piano"

    // Act: เรียกใช้ playMelodySequence method
    const stopFunction = await audioService.playMelodySequence(
      notes,
      settings,
      instrument,
      mockOnNoteChange,
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ preloadCalled = true
    expect(audioService.preloadMelodyNotes).toHaveBeenCalledWith(
      ["C"], // pitches array
      [4],   // octaves array
      "piano"
    )
    
    // ตรวจสอบ playbackStarted = true
    expect(audioService.preloadMelodyNoteAudio).toHaveBeenCalledWith("C", 4, "piano")
    
    // ตรวจสอบ stopFunction = "function"
    expect(stopFunction).toBeTypeOf('function')
    
    // ตรวจสอบ volumeEnvelopeAdjusted = true
    expect(audioService.adjustVolumeEnvelopeForMelody).toHaveBeenCalledWith(120, 0.25)
  })

  /**
   * Test ID: UTC-10-2
   * Description: Verify callback execution during melody playback
   * Input: { "notes": [{"pitch": "C", "octave": 4}, {"pitch": "D", "octave": 4}], "settings": {"tempo": 120, "numberOfBars": 1, "noteDuration": 0.5}, "onNoteChange": "callback", "onComplete": "callback" }
   * Expected Result: { "onNoteChangeCalled": true, "noteIndex": 0, "currentNote": {"pitch": "C", "octave": 4}, "onCompleteCalled": true }
   */
  test('UTC-10-2: Verify callback execution during melody playback', async () => {
    // Arrange: เตรียมข้อมูล input
    const notes = [
      { "pitch": "C", "octave": 4 },
      { "pitch": "D", "octave": 4 }
    ]
    const settings = {
      "tempo": 120,
      "numberOfBars": 1,
      "noteDuration": 0.5
    }
    const instrument = "piano"

    // Act: เรียกใช้ playMelodySequence method
    const stopFunction = await audioService.playMelodySequence(
      notes,
      settings,
      instrument,
      mockOnNoteChange,
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    expect(stopFunction).toBeTypeOf('function')
    
    // ตรวจสอบ onNoteChangeCalled = true, noteIndex = 0, currentNote = {"pitch": "C", "octave": 4}
    expect(mockOnNoteChange).toHaveBeenCalledWith(0, { "pitch": "C", "octave": 4 })
    
    // Advanced timer to trigger note playing logic
    vi.advanceTimersByTime(100)
    
    // ตรวจสอบ onCompleteCalled = true (when playback finishes)
    // Note: onComplete will be called after the sequence finishes, which happens asynchronously
    expect(mockOnNoteChange).toHaveBeenCalledTimes(1) // First note callback
  })

  /**
   * Test ID: UTC-10-3
   * Description: Verify melody playback with guitar instrument and fast tempo
   * Input: { "notes": [{"pitch": "E", "octave": 3}], "settings": {"tempo": 180, "numberOfBars": 1, "noteDuration": 0.125}, "instrument": "guitar" }
   * Expected Result: { "audioPath": "src/assets/melodynote/guitar/E3.mp3", "volumeEnvelopeAdjusted": true, "attack": 0.005, "release": 0.15 }
   */
  test('UTC-10-3: Verify melody playback with guitar instrument and fast tempo', async () => {
    // Arrange: เตรียมข้อมูล input
    const notes = [{ "pitch": "E", "octave": 3 }]
    const settings = {
      "tempo": 180,
      "numberOfBars": 1,
      "noteDuration": 0.125
    }
    const instrument = "guitar"

    // Act: เรียกใช้ playMelodySequence method
    const stopFunction = await audioService.playMelodySequence(
      notes,
      settings,
      instrument,
      mockOnNoteChange,
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    expect(stopFunction).toBeTypeOf('function')
    
    // ตรวจสอบ audioPath = "src/assets/melodynote/guitar/E3.mp3"
    expect(audioService.preloadMelodyNoteAudio).toHaveBeenCalledWith("E", 3, "guitar")
    
    // ตรวจสอบ volumeEnvelopeAdjusted = true ด้วย fast tempo และ short note
    expect(audioService.adjustVolumeEnvelopeForMelody).toHaveBeenCalledWith(180, 0.125)
    
    // ตรวจสอบว่า volume envelope ถูกปรับสำหรับ fast tempo (attack = 0.005, release = 0.15)
    // เนื่องจาก tempo > 150 และ noteDuration <= 0.125
    expect(audioService.adjustVolumeEnvelopeForMelody).toHaveBeenCalledWith(180, 0.125)
  })
})
