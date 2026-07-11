<script>
import ChordTable from '../components/progression/ChordTable.vue';
import ControlPanel from '../components/progression/ControlPanel.vue';
import ChordProgressionDisplay from '../components/progression/ChordProgressionDisplay.vue';
import CustomChordModal from '../components/progression/CustomChordModal.vue';
import AudioService from '@/services/audioService';
import MidiService from '../services/MidiService.js';

export default {
  components: {
    ChordTable,
    ControlPanel,
    ChordProgressionDisplay,
    CustomChordModal
  },
  data() {
    return {
      notes: ["C", "D", "E", "F", "G", "A", "B"],
      progressions: [
        "2-5-1-6",
        "1-6-2-5", 
        "1-5-6-4",
        "1-6-4-5",
        "1-4-5-1",
        "1-4-6-5",
        "1-6-2-6",
        "6-4-3-2",
      ],
      selectedKey: "C",
      selectedProgression: "2-5-1-6",
      keyChords: {
        C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
        D: ["D", "Em", "Gbm", "G", "A", "Bm", "C#dim"],
        E: ["E", "Gbm", "Abm", "A", "B", "Dbm", "D#dim"],
        F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
        G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
        A: ["A", "Bm", "Dbm", "D", "E", "Gbm", "G#dim"],
        B: ["B", "Dbm", "Ebm", "E", "Gb", "Abm", "A#dim"],
      },
      highlightedChords: [],
      displayedChords: [],
      playingChordIndex: -1,
      selectedBars: 4,
      tempo: 120,
      isPlaying: false,
      beatsPerChord: 2,
      playingBarIndex: -1,
      playingChordInBarIndex: -1,
      playingSingleChord: false,
      isGeneratingMidi: false,
      audioService: null,
      midiService: null,
      stopPlayingFunction: null,
      isProgressionSelected: false,
      isCustomModalOpen: false,
      isCustomProgression: false,
      isUsingCustomBeats: false,
      customBeatsByPosition: null,
      originalKey: "C", // Add this line to store the original key
    };
  },
  computed: {
    chordBarsDisplay() {
      if (this.displayedChords.length === 0) return [];
      
      const beatsPerBar = 4; // Standard 4/4 time
      
      if (this.isUsingCustomBeats && this.customBeatsByPosition) {
        // Custom beats per position logic
        let bars = [];
        let currentBar = [];
        let currentBarNumber = 1;
        let currentBeatTotal = 0;
        let currentChordIndex = 0;
        
        // Process all chords in displayedChords
        while (currentChordIndex < this.displayedChords.length) {
          const chord = this.displayedChords[currentChordIndex];
          const beats = this.customBeatsByPosition[currentChordIndex] || 1;
          
          // Check if adding this chord would exceed the beats per bar
          if (currentBeatTotal + beats > beatsPerBar) {
            // Complete the current bar and start a new one
            bars.push({
              barNumber: currentBarNumber,
              chords: [...currentBar]
            });
            
            currentBarNumber++;
            currentBar = [];
            currentBeatTotal = 0;
            // Don't increment currentChordIndex here - try to fit this chord in the next bar
          } else {
            // Add the chord to the current bar
            currentBar.push({
              chord: chord,
              beats: beats
            });
            
            currentBeatTotal += beats;
            currentChordIndex++;
            
            // If we've exactly filled a bar, start a new one
            if (currentBeatTotal === beatsPerBar) {
              bars.push({
                barNumber: currentBarNumber,
                chords: [...currentBar]
              });
              
              currentBarNumber++;
              currentBar = [];
              currentBeatTotal = 0;
            }
          }
          
          // Safety check to avoid infinite loop
          if (bars.length >= 100) break;
        }
        
        // Add any remaining chords as the last bar
        if (currentBar.length > 0) {
          // If the last bar is not full, add a chord to fill it
          if (currentBeatTotal < beatsPerBar) {
            // Try to continue the progression pattern instead of using a default chord
            const nextChordIndex = currentChordIndex % this.displayedChords.length;
            currentBar.push({
              chord: this.displayedChords[nextChordIndex],
              beats: beatsPerBar - currentBeatTotal
            });
          }
          
          bars.push({
            barNumber: currentBarNumber,
            chords: [...currentBar]
          });
        }
        
        // Ensure we have the correct number of bars
        while (bars.length < this.selectedBars) {
          const patternLength = this.displayedChords.length;
          let newBar = [];
          let beatCount = 0;
          
          // Create a new bar following the progression pattern
          while (beatCount < beatsPerBar) {
            const nextChordIndex = (currentChordIndex++) % patternLength;
            const nextChord = this.displayedChords[nextChordIndex];
            
            // Default to 2 beats per chord, but adjust if it would exceed beats per bar
            const chordBeats = Math.min(2, beatsPerBar - beatCount);
            
            newBar.push({
              chord: nextChord,
              beats: chordBeats
            });
            
            beatCount += chordBeats;
          }
          
          bars.push({
            barNumber: bars.length + 1,
            chords: newBar
          });
        }
        
        // Trim if we have too many bars
        if (bars.length > this.selectedBars) {
          bars = bars.slice(0, this.selectedBars);
        }
        
        return bars;
      } else {
        // Original logic for uniform beats per chord
        const chordsPerBar = beatsPerBar / this.beatsPerChord;
        const totalChords = this.selectedBars * chordsPerBar;
        
        let expandedChords = [];
        for (let i = 0; i < totalChords; i++) {
          expandedChords.push(this.displayedChords[i % this.displayedChords.length]);
        }
        
        let bars = [];
        for (let i = 0; i < this.selectedBars; i++) {
          let barChords = [];
          for (let j = 0; j < chordsPerBar; j++) {
            const chordIndex = i * chordsPerBar + j;
            if (chordIndex < expandedChords.length) {
              barChords.push({
                chord: expandedChords[chordIndex],
                beats: this.beatsPerChord
              });
            }
          }
          bars.push({
            barNumber: i + 1,
            chords: barChords
          });
        }
        
        return bars;
      }
    },
    
    // Get all chords as a flat array for playing
    allChords() {
      if (!this.chordBarsDisplay.length) return [];
      
      return this.chordBarsDisplay.reduce((acc, bar) => {
        return acc.concat(bar.chords.map(chordData => chordData.chord));
      }, []);
    }
  },
  watch: {
    selectedBars(newValue) {
      if (newValue < 1) {
        this.selectedBars = 1;
      } else if (newValue > 32) {
        this.selectedBars = 32;
      }
    },
    
    // Stop playing when tempo changes to avoid timing issues
    tempo() {
      if (this.isPlaying) {
        this.stopPlaying();
      }
    }
  },
  methods: {
    openCustomModal() {
      this.isCustomModalOpen = true;
    },
    
    closeCustomModal() {
      this.isCustomModalOpen = false;
    },
    
    applyCustomSettings(customSettings) {
      // Set custom chords and beats per chord
      if (customSettings.beatsByPosition) {
        // Handle the new format with individual beats per position
        this.displayedChords = customSettings.chords;
        
        // Store the custom beats array for use in chord bar display
        this.customBeatsByPosition = customSettings.beatsByPosition;
        this.selectedBars = customSettings.barCount || this.selectedBars;
        
        // Using custom beats per position
        this.isUsingCustomBeats = true;
      } else {
        // Handle the original format (all chords have same beat value)
        this.displayedChords = customSettings.chords;
        this.beatsPerChord = customSettings.beatsPerChord;
        this.isUsingCustomBeats = false;
        this.customBeatsByPosition = null;
      }
      
      // Mark as custom progression but keep original key for reference
      this.isCustomProgression = true;
      this.selectedProgression = "Custom";
      this.selectedKey = "Custom";
      this.isProgressionSelected = true;
      
      // Update highlighted chords (none for custom)
      this.highlightedChords = [];
      
      // บันทึกค่าเพื่อให้สามารถเรียกใช้ใน CustomChordModal ได้
      this.$nextTick(() => {
        // แน่ใจว่าข้อมูล chordBarsDisplay ได้รับการอัพเดทก่อน
        console.log('Custom settings applied, bars displayed: ', this.chordBarsDisplay.length);
      });
    },
    
    selectProgression(progression, key) {
      this.selectedKey = key;
      this.originalKey = key; // Save the original key
      this.selectedProgression = progression;
      this.generateProgression();
      this.setDisplayedChords();
      this.isProgressionSelected = true;
      this.isCustomProgression = false;
      this.isUsingCustomBeats = false;
      this.customBeatsByPosition = null;
      this.beatsPerChord = 2;
    },
    
    generateProgression() {
      const progressionSteps = this.selectedProgression.split("-").map(Number);
      this.highlightedChords = progressionSteps;
    },
    
    setDisplayedChords() {
      const progressionSteps = this.selectedProgression.split("-").map(Number);
      this.displayedChords = progressionSteps.map(step => this.keyChords[this.selectedKey][step - 1]);
    },
    
    async playChordSound(chord, barIndex, chordIndex) {
      if (this.isPlaying || this.playingSingleChord) return;
      
      try {
        this.playingSingleChord = true;
        this.playingBarIndex = barIndex;
        this.playingChordInBarIndex = chordIndex;
        
        await this.audioService.playSingleChord(chord);
        
        // Reset highlighting
        this.playingSingleChord = false;
        this.playingBarIndex = -1;
        this.playingChordInBarIndex = -1;
      } catch (error) {
        console.error('Failed to play chord sound:', error);
        this.playingSingleChord = false;
        this.playingBarIndex = -1;
        this.playingChordInBarIndex = -1;
      }
    },
    
    togglePlay() {
      if (this.isPlaying) {
        this.stopPlaying();
      } else {
        this.playSound();
      }
    },
    
    async playSound() {
      if (this.isPlaying) return;
      if (this.allChords.length === 0) return;

      this.isPlaying = true;
      
      // Stop any previous playback
      if (this.stopPlayingFunction) {
        this.stopPlayingFunction();
      }

      try {
        // Preload all chords before playing for smoother playback
        await this.audioService.preloadAllChords(this.allChords);
        
        // Get all beats for custom beat pattern
        const allBeatsForChords = [];
        
        // Extract the beats information for each chord from chordBarsDisplay
        if (this.isUsingCustomBeats) {
          for (const bar of this.chordBarsDisplay) {
            for (const chord of bar.chords) {
              allBeatsForChords.push(chord.beats);
            }
          }
        }

        // Play the sequence using the audio service
        this.stopPlayingFunction = await this.audioService.playChordSequence(
          this.allChords,
          this.tempo,
          this.isUsingCustomBeats ? allBeatsForChords : this.beatsPerChord, // Pass custom beats if available
          (barIndex, chordIndex) => {
            // Update the UI to show which chord is playing
            this.playingBarIndex = barIndex;
            this.playingChordInBarIndex = chordIndex;
          },
          () => {
            // When playback is complete
            this.isPlaying = false;
            this.playingBarIndex = -1;
            this.playingChordInBarIndex = -1;
            this.stopPlayingFunction = null;
          }
        );
      } catch (error) {
        console.error('Failed to play sound sequence:', error);
        this.isPlaying = false;
      }
    },
    
    stopPlaying() {
      this.isPlaying = false;
      this.playingBarIndex = -1;
      this.playingChordInBarIndex = -1;
      
      if (this.stopPlayingFunction) {
        this.stopPlayingFunction();
        this.stopPlayingFunction = null;
      } else {
        this.audioService.stopAll();
      }
    },
    
    async generateMidiFile() {
      if (this.displayedChords.length === 0) {
        alert('Please select a chord progression first!');
        return;
      }
      
      this.isGeneratingMidi = true;
      
      try {
        let expandedChords = [];
        let chordBeats = [];
        
        // Handle custom beats
        if (this.isUsingCustomBeats && this.customBeatsByPosition) {
          // Use the chords and beats from chordBarsDisplay for accuracy
          for (const bar of this.chordBarsDisplay) {
            for (const chordObj of bar.chords) {
              expandedChords.push(chordObj.chord);
              chordBeats.push(chordObj.beats);
            }
          }
        } else {
          // Standard, uniform beats per chord
          const beatsPerBar = 4;
          const chordsPerBar = beatsPerBar / this.beatsPerChord;
          const totalChords = this.selectedBars * chordsPerBar;
          
          for (let i = 0; i < totalChords; i++) {
            expandedChords.push(this.displayedChords[i % this.displayedChords.length]);
            chordBeats.push(this.beatsPerChord);
          }
        }
        
        // Generate MIDI file with custom beats
        const midiFile = this.midiService.generateMidiFileWithCustomBeats(
          expandedChords, 
          this.tempo, 
          chordBeats
        );
        
        // Download the file
        this.midiService.downloadMidiFile(midiFile, this.selectedKey, this.selectedProgression, this.tempo);
        
      } catch (error) {
        console.error('Error generating MIDI file:', error);
        alert('Error generating MIDI file. Please try again.');
      } finally {
        this.isGeneratingMidi = false;
      }
    },
    
    // Add method to update bar count (if needed - may already exist)
    updateSelectedBars(value) {
      // Check if we're adding bars
      const oldValue = this.selectedBars;
      const adding = value > oldValue;
      this.selectedBars = value;
      
      // ถ้ากำลังเพิ่ม bar และใช้ custom beats
      if (adding && this.isUsingCustomBeats && this.customBeatsByPosition) {
        const additionalBars = value - oldValue;
        if (additionalBars > 0) {
          // เก็บข้อมูลเดิม
          const originalChords = [...this.displayedChords];
          const originalBeats = [...this.customBeatsByPosition];
          
          // เตรียมอาเรย์สำหรับคอร์ดและบีทใหม่
          const newChords = [];
          const newBeats = [];
          
          // สำหรับแต่ละบาร์ที่เพิ่ม (2 คอร์ดต่อบาร์ - 2 บีทต่อคอร์ด)
          for (let i = 0; i < additionalBars; i++) {
            // แต่ละบาร์มี 2 คอร์ด
            for (let j = 0; j < 2; j++) {
              // คำนวณตำแหน่งของคอร์ดถัดไปตาม progression
              const patternLength = originalChords.length;
              const nextIndex = (originalChords.length + newChords.length) % patternLength;
              
              // เพิ่มคอร์ดและบีทใหม่
              newChords.push(originalChords[nextIndex]);
              newBeats.push(2); // 2 บีทต่อคอร์ด
            }
          }
          
          // อัพเดทข้อมูลคอร์ดและบีท
          this.displayedChords = [...originalChords, ...newChords];
          this.customBeatsByPosition = [...originalBeats, ...newBeats];
          
          console.log('Updated bars with continuous progression pattern, added', newChords.length, 'new chords');
        }
      }
    },
    
    goToMelodyCreator() {
      // นำทางไปยังหน้า Melody creator
      this.$router.push('/melody');
    }
  },
  
  created() {
    // Initialize services first thing when component is created
    this.audioService = new AudioService();
    this.midiService = new MidiService();
  },
  
  mounted() {
    // Initialize with default progression but don't show it until user selects one
    this.generateProgression();
    this.setDisplayedChords();
    this.isProgressionSelected = false; // Start without showing progression
    
    // Preload all common chords for responsive playback
    const allPossibleChords = [];
    Object.values(this.keyChords).forEach(chords => {
      allPossibleChords.push(...chords);
    });
    
    // Remove duplicates and preload
    const uniqueChords = [...new Set(allPossibleChords)];
    this.audioService.preloadAllChords(uniqueChords);
  },
  
  beforeUnmount() {
    this.stopPlaying();
    if (this.audioService) {
      this.audioService.stopAll();
    }
  },
};
</script>

<template>
  <div class="body">
    <header class="app-header">
      <div class="tab-selector">
        <button class="tab-button active">CHORD PROGRESSION</button>
        <button class="tab-button" @click="goToMelodyCreator">MELODY CREATOR</button>
      </div>
    </header>
    
    <div class="result">
      <!-- Chord Table Component -->
      <ChordTable
        :notes="notes"
        :keyChords="keyChords"
        :progressions="progressions"
        :selectedKey="selectedKey"
        :selectedProgression="selectedProgression"
        :highlightedChords="highlightedChords"
        @select-progression="selectProgression"
        @play-chord="playChordSound($event, -1, -1)"
      />

      <!-- Components that appear after selecting a progression -->
      <div v-if="isProgressionSelected && displayedChords.length > 0" class="progression-section">
        <!-- Controls Panel Component -->
        <ControlPanel
          v-model:selectedBars="selectedBars"
          v-model:tempo="tempo"
          :beatsPerChord="beatsPerChord"
          @open-custom-modal="openCustomModal"
        />

        <!-- Chord Progression Display Component -->
        <ChordProgressionDisplay
          :selectedKey="selectedKey"
          :selectedProgression="selectedProgression"
          :chordBarsDisplay="chordBarsDisplay"
          :isPlaying="isPlaying"
          :playingBarIndex="playingBarIndex"
          :playingChordInBarIndex="playingChordInBarIndex"
          :playingSingleChord="playingSingleChord"
          :beatsPerChord="beatsPerChord"
          :isGeneratingMidi="isGeneratingMidi"
          @toggle-play="togglePlay"
          @play-chord="playChordSound"
          @generate-midi="generateMidiFile"
        />
      </div>
      
      <!-- Custom Chord Modal -->
      <CustomChordModal
        :is-visible="isCustomModalOpen"
        :key-chords="keyChords"
        :initial-beats-per-chord="beatsPerChord"
        :initial-selected-bars="selectedBars"
        :current-displayed-chords="displayedChords"
        :current-key="selectedKey"
        :original-key="originalKey"
        :current-progression="selectedProgression"
        :custom-beats-by-position="customBeatsByPosition"
        :chord-bars-display="chordBarsDisplay"
        @close="closeCustomModal"
        @apply="applyCustomSettings"
      />
    </div>
  </div>
</template>

<style scoped>
.body {
  text-align: center;
  min-height: 100vh;
  background-color: #1b1b1b;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.tab-selector {
  display: inline-flex;
  background-color: #333;
  border-radius: 30px;
  padding: 5px;
  margin: 30px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.tab-button {
  padding: 12px 30px;
  background: transparent;
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  letter-spacing: 1px;
  font-size: 14px;
}

.tab-button.active {
  background-color: #fff;
  color: #000;
}

.result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.progression-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
