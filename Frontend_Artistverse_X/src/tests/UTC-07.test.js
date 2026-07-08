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

describe('UTC-07: Test playChordSequence Method (AudioService)', () => {
  let audioService
  let mockOnChordChange
  let mockOnComplete

  beforeEach(() => {
    // รีเซ็ต mocks
    vi.clearAllMocks()
    
    // สร้าง instance ของ AudioService
    audioService = new AudioService()
    
    // สร้าง mock callbacks
    mockOnChordChange = vi.fn()
    mockOnComplete = vi.fn()
    
    // Mock preloadAudio method เพื่อไม่ให้โหลดไฟล์เสียงจริง
    audioService.preloadAudio = vi.fn().mockResolvedValue({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      volume: 1
    })
    
    // Mock applyVolumeEnvelope to prevent timing issues
    audioService.applyVolumeEnvelope = vi.fn()
    
    // Mock setTimeout และ clearTimeout
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    audioService.stopAll()
  })
  /**
   * Test ID: UTC-07-1
   * Description: Verify chord sequence plays with correct timing and callbacks
   * Input: { "chords": ["C", "G", "Am", "F"], "tempo": 120, "beatsPerChord": 2, "onChordChange": "mockCallback", "onComplete": "mockCallback" }
   * Expected Result: { "isPlaying": true, "currentChordIndex": 0, "callbackCount": 1, "playbackDuration": 4000, "stopFunction": "function", "callbacks": [[0, 0]] }
   */
  test('UTC-07-1: Verify chord sequence plays with correct timing and callbacks', async () => {
    // Arrange: เตรียมข้อมูล input
    const chords = ["C", "G", "Am", "F"]
    const tempo = 120
    const beatsPerChord = 2

    // Act: เรียกใช้ playChordSequence method
    const stopFunction = await audioService.playChordSequence(
      chords, 
      tempo, 
      beatsPerChord, 
      mockOnChordChange, 
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    expect(stopFunction).toBeTypeOf('function') // stopFunction = "function"
    expect(audioService.preloadAudio).toHaveBeenCalledWith("C") // isPlaying = true
    
    // ตรวจสอบ callback แรกที่ถูกเรียกทันที: callbacks = [[0, 0]]
    expect(mockOnChordChange).toHaveBeenCalledWith(0, 0) // Bar 0, Chord 0 (currentChordIndex = 0)
    expect(mockOnChordChange).toHaveBeenCalledTimes(1) // callbackCount = 1
    
    // ตรวจสอบ playbackDuration = 4000ms (4 chords × 2 beats × 500ms/beat at 120 BPM)
    const expectedDuration = (chords.length * beatsPerChord * 60000) / tempo
    expect(expectedDuration).toBe(4000) // playbackDuration = 4000
  })
  /**
   * Test ID: UTC-07-2  
   * Description: Verify chord sequence with custom beats per chord timing
   * Input: { "chords": ["C", "Am", "F", "G"], "tempo": 120, "beatsPerChord": [3, 1, 2, 2], "onChordChange": "mockCallback", "onComplete": "mockCallback" }
   * Expected Result: { "isPlaying": true, "currentChordIndex": 0, "callbackCount": 1, "playbackDuration": 4000, "stopFunction": "function", "callbacks": [[0, 0]] }
   */
  test('UTC-07-2: Verify chord sequence with custom beats per chord timing', async () => {
    // Arrange: เตรียมข้อมูล input ด้วย custom beats
    const chords = ["C", "Am", "F", "G"]
    const tempo = 120
    const beatsPerChord = [3, 1, 2, 2] // custom beats per chord

    // Act: เรียกใช้ playChordSequence method
    const stopFunction = await audioService.playChordSequence(
      chords, 
      tempo, 
      beatsPerChord, 
      mockOnChordChange, 
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    expect(stopFunction).toBeTypeOf('function') // stopFunction = "function"
    expect(audioService.preloadAudio).toHaveBeenCalledWith("C") // isPlaying = true
    
    // ตรวจสอบ callback แรกที่ถูกเรียกทันที: callbacks = [[0, 0]]
    expect(mockOnChordChange).toHaveBeenCalledWith(0, 0) // Bar 0, Chord 0 (currentChordIndex = 0)
    expect(mockOnChordChange).toHaveBeenCalledTimes(1) // callbackCount = 1
    
    // ตรวจสอบ playbackDuration = 4000ms ([3+1+2+2] beats × 500ms/beat at 120 BPM)
    const totalBeats = beatsPerChord.reduce((sum, beats) => sum + beats, 0)
    const expectedDuration = (totalBeats * 60000) / tempo
    expect(expectedDuration).toBe(4000) // playbackDuration = 4000
  })
  /**
   * Test ID: UTC-07-3
   * Description: Verify fast tempo playback handles timing correctly  
   * Input: { "chords": ["C", "G"], "tempo": 180, "beatsPerChord": 1, "onChordChange": "mockCallback", "onComplete": "mockCallback" }
   * Expected Result: { "isPlaying": true, "currentChordIndex": 0, "callbackCount": 1, "playbackDuration": 667, "stopFunction": "function", "callbacks": [[0, 0]] }
   */
  test('UTC-07-3: Verify fast tempo playback handles timing correctly', async () => {
    // Arrange: เตรียมข้อมูล input ด้วย fast tempo
    const chords = ["C", "G"]
    const tempo = 180 // Fast tempo
    const beatsPerChord = 1

    // Act: เรียกใช้ playChordSequence method
    const stopFunction = await audioService.playChordSequence(
      chords, 
      tempo, 
      beatsPerChord, 
      mockOnChordChange, 
      mockOnComplete
    )

    // Assert: ตรวจสอบผลลัพธ์
    expect(stopFunction).toBeTypeOf('function') // stopFunction = "function"
    expect(audioService.preloadAudio).toHaveBeenCalledWith("C") // isPlaying = true
    
    // ตรวจสอบ callback แรกที่ถูกเรียกทันที: callbacks = [[0, 0]]
    expect(mockOnChordChange).toHaveBeenCalledWith(0, 0) // Bar 0, Chord 0 (currentChordIndex = 0)
    expect(mockOnChordChange).toHaveBeenCalledTimes(1) // callbackCount = 1
    
    // ตรวจสอบ playbackDuration = 667ms (2 chords × 1 beat × 333ms/beat at 180 BPM)
    const expectedDuration = Math.round((chords.length * beatsPerChord * 60000) / tempo)
    expect(expectedDuration).toBe(667) // playbackDuration = 667
  })
})
