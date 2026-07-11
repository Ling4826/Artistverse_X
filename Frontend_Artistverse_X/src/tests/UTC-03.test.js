import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ControlPanel from '../components/progression/ControlPanel.vue'

describe('UTC-03: Test updateSelectedBars Method', () => {
  /**
   * Test ID: UTC-03-1
   * Description: Test updateSelectedBars method with normal value (5 bars)
   * Input: Value = 5
   * Expected Result: Component should emit 'update:selectedBars' event with value 5
   */
  test('UTC-03-1: ทดสอบ updateSelectedBars method ด้วยค่าปกติ (5 bars)', () => {
    // สร้าง wrapper สำหรับ component
    const wrapper = mount(ControlPanel, {
      props: {
        selectedBars: 4,
        tempo: 120,
        beatsPerChord: 2
      }
    })

    // เรียกใช้ method updateSelectedBars ด้วยค่า "5"
    wrapper.vm.updateSelectedBars("5")

    // ตรวจสอบว่า component emit event 'update:selectedBars' ด้วยค่า 5
    expect(wrapper.emitted('update:selectedBars')).toBeTruthy()
    expect(wrapper.emitted('update:selectedBars')[0]).toEqual([5])
  })

  /**
   * Test ID: UTC-03-2  
   * Description: Test updateSelectedBars method with value below minimum (0 bars)
   * Input: Value = 0
   * Expected Result: Component should emit 'update:selectedBars' event with value 1 (minimum limit)
   */
  test('UTC-03-2: ทดสอบ updateSelectedBars method ด้วยค่าต่ำกว่าขั้นต่ำ (0 bars)', () => {
    // สร้าง wrapper สำหรับ component
    const wrapper = mount(ControlPanel, {
      props: {
        selectedBars: 4,
        tempo: 120,
        beatsPerChord: 2
      }
    })

    // เรียกใช้ method updateSelectedBars ด้วยค่า "0"
    wrapper.vm.updateSelectedBars("0")

    // ตรวจสอบว่า component emit event 'update:selectedBars' ด้วยค่า 1 (ค่าต่ำสุดที่อนุญาต)
    expect(wrapper.emitted('update:selectedBars')).toBeTruthy()
    expect(wrapper.emitted('update:selectedBars')[0]).toEqual([1])
  })

  /**
   * Test ID: UTC-03-3
   * Description: Test updateSelectedBars method with value above maximum (50 bars)  
   * Input: Value = 50
   * Expected Result: Component should emit 'update:selectedBars' event with value 32 (maximum limit)
   */
  test('UTC-03-3: ทดสอบ updateSelectedBars method ด้วยค่าสูงกว่าขั้นสูง (50 bars)', () => {
    // สร้าง wrapper สำหรับ component
    const wrapper = mount(ControlPanel, {
      props: {
        selectedBars: 4,
        tempo: 120,
        beatsPerChord: 2
      }
    })

    // เรียกใช้ method updateSelectedBars ด้วยค่า "50"
    wrapper.vm.updateSelectedBars("50")

    // ตรวจสอบว่า component emit event 'update:selectedBars' ด้วยค่า 32 (ค่าสูงสุดที่อนุญาต)
    expect(wrapper.emitted('update:selectedBars')).toBeTruthy()
    expect(wrapper.emitted('update:selectedBars')[0]).toEqual([32])
  })
})