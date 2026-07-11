import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MelodyInputForm from '../components/melody/MelodyInputForm.vue'

describe('UTC-11: Test MelodyInputForm component Methods', () => {
  let wrapper

  beforeEach(() => {
    // สร้าง component wrapper สำหรับการทดสอบ
    wrapper = mount(MelodyInputForm)
  })

  /**
   * Test ID: UTC-11-1
   * Description: Verify adding melody note functionality
   * Input: addNote() when notes = ["C", "D"], octaves = [4, 4]
   * Expected Result: { "notes": ["C", "D", "D"], "octaves": [4, 4, 4], "emitted": "notes-changed", "scrollTriggered": true }
   */
  test('UTC-11-1: Verify adding melody note functionality', async () => {
    // Arrange: เตรียมข้อมูล input
    wrapper.vm.notes = ["C", "D"]
    wrapper.vm.octaves = [4, 4]

    // Mock scrollToLatestNote method
    wrapper.vm.scrollToLatestNote = vi.fn()

    // Act: เรียกใช้ addNote method
    wrapper.vm.addNote()

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ notes = ["C", "D", "D"] (เพิ่ม note ตัวสุดท้าย)
    expect(wrapper.vm.notes).toEqual(["C", "D", "D"])
    
    // ตรวจสอบ octaves = [4, 4, 4] (เพิ่ม octave ตัวสุดท้าย)
    expect(wrapper.vm.octaves).toEqual([4, 4, 4])
    
    // ตรวจสอบ emitted = "notes-changed"
    expect(wrapper.emitted('notes-changed')).toBeTruthy()
    expect(wrapper.emitted('notes-changed')).toHaveLength(2) // 1 from mounted, 1 from addNote
    
    // ตรวจสอบ notes-changed event payload
    const lastEmittedEvent = wrapper.emitted('notes-changed')[1][0]
    expect(lastEmittedEvent).toEqual([
      { pitch: "C", octave: 4 },
      { pitch: "D", octave: 4 },
      { pitch: "D", octave: 4 }
    ])

    // ตรวจสอบ scrollTriggered = true (ใน nextTick)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.scrollToLatestNote).toHaveBeenCalled()
  })

  /**
   * Test ID: UTC-11-2
   * Description: Verify removing melody note from sequence
   * Input: removeNote(1) when notes = ["C", "D", "E"], octaves = [4, 4, 4]
   * Expected Result: { "notes": ["C", "E"], "octaves": [4, 4], "length": 2, "notes-changed": true }
   */
  test('UTC-11-2: Verify removing melody note from sequence', () => {
    // Arrange: เตรียมข้อมูล input
    wrapper.vm.notes = ["C", "D", "E"]
    wrapper.vm.octaves = [4, 4, 4]

    // Act: เรียกใช้ removeNote method ที่ index 1 (remove "D")
    wrapper.vm.removeNote(1)

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ notes = ["C", "E"] (ลบ "D" ที่ index 1)
    expect(wrapper.vm.notes).toEqual(["C", "E"])
    
    // ตรวจสอบ octaves = [4, 4] (ลบ octave ที่ index 1)
    expect(wrapper.vm.octaves).toEqual([4, 4])
    
    // ตรวจสอบ length = 2
    expect(wrapper.vm.notes.length).toBe(2)
    
    // ตรวจสอบ notes-changed = true
    expect(wrapper.emitted('notes-changed')).toBeTruthy()
    expect(wrapper.emitted('notes-changed')).toHaveLength(2) // 1 from mounted, 1 from removeNote
    
    // ตรวจสอบ notes-changed event payload
    const lastEmittedEvent = wrapper.emitted('notes-changed')[1][0]
    expect(lastEmittedEvent).toEqual([
      { pitch: "C", octave: 4 },
      { pitch: "E", octave: 4 }
    ])
  })

  /**
   * Test ID: UTC-11-3
   * Description: Verify quick fill notes to target bars
   * Input: quickFillNotes() when notes = ["C"], octaves = [4], totalNotesNeeded = 4
   * Expected Result: { "notes": ["C", "C", "C", "C"], "octaves": [4, 4, 4, 4], "emitted": "notes-changed", "length": 4 }
   */
  test('UTC-11-3: Verify quick fill notes to target bars', () => {
    // Arrange: เตรียมข้อมูล input
    wrapper.vm.notes = ["C"]
    wrapper.vm.octaves = [4]
    
    // ตั้งค่า settings เพื่อให้ totalNotesNeeded = 4
    wrapper.vm.settings.numberOfBars = 1
    wrapper.vm.settings.noteDuration = 0.25 // 4/0.25 = 16 notes per bar, 1 bar = 16 notes
    
    wrapper.vm.settings.noteDuration = 1 // 4/1 = 4 notes per bar, 1 bar = 4 notes

    // Act: เรียกใช้ quickFillNotes method
    wrapper.vm.quickFillNotes()

    // Assert: ตรวจสอบผลลัพธ์
    // ตรวจสอบ notes = ["C", "C", "C", "C"] (เติม "C" จนครบ 4 notes)
    expect(wrapper.vm.notes).toEqual(["C", "C", "C", "C"])
    
    // ตรวจสอบ octaves = [4, 4, 4, 4] (เติม octave 4 จนครบ 4 notes)
    expect(wrapper.vm.octaves).toEqual([4, 4, 4, 4])
    
    // ตรวจสอบ length = 4
    expect(wrapper.vm.notes.length).toBe(4)
    
    // ตรวจสอบ emitted = "notes-changed"    expect(wrapper.emitted('notes-changed')).toBeTruthy()
    expect(wrapper.emitted('notes-changed')).toHaveLength(2) // 1 from mounted, 1 from quickFillNotes
    
    // ตรวจสอบ notes-changed event payload
    const lastEmittedEvent = wrapper.emitted('notes-changed')[1][0]
    expect(lastEmittedEvent).toEqual([
      { pitch: "C", octave: 4 },
      { pitch: "C", octave: 4 },
      { pitch: "C", octave: 4 },
      { pitch: "C", octave: 4 }
    ])
  })
})
