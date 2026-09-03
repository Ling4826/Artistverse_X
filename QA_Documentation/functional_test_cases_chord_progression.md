# QA Functional Test Specification: Chord Progression & MIDI Service

## 1. Module Overview
This module manages Musical Key selection, Chord Progression calculation, Custom Beat layout mapping, Audio Playback timing control, and Binary MIDI File export (`ProgressionView.vue`, `MidiService.js`).

---

## 2. Functional Test Cases Specification Table

### Component: `ProgressionView.vue` & `MidiService.js`

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-CHORD-01** | Positive | Select standard progression & key transposition | Page loaded | 1. Execute `selectProgression("1-5-6-4", "C")` | 1. `selectedKey` & `originalKey` set to `"C"`<br>2. `displayedChords` set to `["C", "G", "Am", "F"]`<br>3. `isProgressionSelected` set to `true` |
| **FTC-CHORD-02** | Positive | Apply custom chord progression & custom beats layout | Page loaded | 1. Execute `applyCustomSettings({chords: ["C", "Am", "F", "G"], beatsByPosition: [3, 1, 2, 2], barCount: 4})` | 1. `isUsingCustomBeats` set to `true`<br>2. `customBeatsByPosition` set to `[3, 1, 2, 2]`<br>3. `selectedKey` & `selectedProgression` set to `"Custom"` |
| **FTC-CHORD-03** | Positive | Generate binary MIDI file from custom progression | Progression selected | 1. Call `midiService.generateMidiFileWithCustomBeats(["C", "Am"], 120, [2, 2])` | 1. Returns `Uint8Array` binary array<br>2. First 4 bytes match MIDI header `"MThd"` (`0x4D, 0x54, 0x68, 0x64`) |
| **FTC-CHORD-04** | Negative | Watcher validation for out-of-bounds `selectedBars` | Page loaded | 1. Set `selectedBars` = 0<br>2. Set `selectedBars` = 99 | 1. Watcher clamps value $< 1$ to `1`<br>2. Watcher clamps value $> 32$ to `32` |
| **FTC-CHORD-05** | Negative | Fallback for unknown chord in `chordToMidiNotes()` | `MidiService` initialized | 1. Call `midiService.chordToMidiNotes("UnknownX")` | 1. System logs warning / returns default C Major `[60, 64, 67]` |
| **FTC-CHORD-06** | Negative | Fallback for invalid pitch or octave in `noteToMidiNumber()` | `MidiService` initialized | 1. Call `noteToMidiNumber("Z", 4)`<br>2. Call `noteToMidiNumber("C", 99)` | 1. Unknown pitch falls back to Middle C `60`<br>2. Out-of-range octave falls back to Middle C `60` |
| **FTC-CHORD-07** | Edge Case | Tempo modification during active audio playback | Audio currently playing (`isPlaying` = `true`) | 1. Change `tempo` value | 1. Watcher detects tempo change<br>2. `stopPlaying()` invoked to prevent audio timing overlap |
