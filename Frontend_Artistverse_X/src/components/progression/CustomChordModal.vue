<script>
export default {
  props: {
    isVisible: Boolean,
    keyChords: {
      type: Object,
      required: true
    },
    initialBeatsPerChord: {
      type: Number,
      default: 2
    },
    initialSelectedBars: {
      type: Number,
      default: 4
    },
    currentDisplayedChords: {
      type: Array,
      default: () => []
    },
    currentKey: {
      type: String,
      default: 'C'
    },
    currentProgression: {
      type: String,
      default: ''
    },
    customBeatsByPosition: {
      type: Array,
      default: () => null
    },
    originalKey: {
      type: String,
      default: 'C'
    },
    chordBarsDisplay: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      customBars: [],
      originalCustomBars: [], // Store original state for reset functionality
      isEditingChord: false,
      activeEditPosition: {
        barIndex: -1,
        slotIndex: -1
      },
      editingChordName: 'C',
      editingBeats: 2,
      chordsPerBar: 2,
      fallbackChords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      showFullBarWarning: false // Warning when selecting 4 beats
    }
  },
  computed: {
    chordsInOriginalKey() {
      // Handle Custom key by providing fallback chords
      if (this.originalKey === "Custom") {
        return this.fallbackChords;
      }
      return this.keyChords[this.originalKey] || [];
    },
    displayKey() {
      return this.currentKey === "Custom" ? "Custom" : this.currentKey;
    },
    isCustomKey() {
      return this.currentKey === "Custom";
    },
    barCount() {
      return this.initialSelectedBars;
    },
    canDeleteChord() {
      if (this.isEditingChord) {
        const barIndex = this.activeEditPosition.barIndex;
        return this.customBars[barIndex] && this.customBars[barIndex].length > 1;
      }
      return false;
    },
    hasBarWithInvalidBeats() {
      return this.customBars.some((bar, index) => this.getTotalBeatsInBar(index) !== 4);
    }
  },
  watch: {
    isVisible(newValue) {
      if (newValue) {
        this.chordsPerBar = this.initialBeatsPerChord === 1 ? 4 : 
                           this.initialBeatsPerChord === 2 ? 2 : 1;
        this.initializeCustomBarsFromCurrentChords();
      } else {
        this.cancelChordEdit();
      }
    },

    // Update data when bar count changes while modal is visible
    chordBarsDisplay: {
      handler(newChordBarsDisplay) {
        if (this.isVisible && 
            newChordBarsDisplay && 
            this.customBars.length !== newChordBarsDisplay.length) {
          this.initializeCustomBarsFromCurrentChords();
        }
      },
      deep: true
    }
  },
  methods: {
    getTotalBeatsInBar(barIndex) {
      return this.customBars[barIndex].reduce((total, chord) => total + chord.beats, 0);
    },
    
    addChordToBar(barIndex) {
      const totalBeats = this.getTotalBeatsInBar(barIndex);
      const remainingBeats = 4 - totalBeats;
      
      if (remainingBeats <= 0) return;
      
      this.customBars[barIndex].push({
        chord: this.chordsInOriginalKey[0] || 'C',
        beats: remainingBeats
      });
    },
    
    deleteChord() {
      if (!this.isEditingChord || !this.canDeleteChord) return;
      
      const barIndex = this.activeEditPosition.barIndex;
      const slotIndex = this.activeEditPosition.slotIndex;
      
      this.customBars[barIndex].splice(slotIndex, 1);
      this.cancelChordEdit();
    },
    
    initializeCustomBars() {
      this.customBars = [];
      
      for (let i = 0; i < this.barCount; i++) {
        const bar = [];
        
        // Default to 2 chords with 2 beats each
        bar.push({
          chord: this.chordsInOriginalKey[0] || 'C',
          beats: 2
        });
        
        bar.push({
          chord: this.chordsInOriginalKey[0] || 'C',
          beats: 2
        });
        
        this.customBars.push(bar);
      }
    },
    
    initializeCustomBarsFromCurrentChords() {
      // Use chordBarsDisplay as primary source if available
      if (this.chordBarsDisplay && this.chordBarsDisplay.length > 0) {
        this.customBars = this.chordBarsDisplay.map(bar => {
          return bar.chords.map(chord => ({
            chord: chord.chord,
            beats: chord.beats
          }));
        });
        
        this.originalCustomBars = JSON.parse(JSON.stringify(this.customBars));
        return;
      }
      
      // If no current chords, use the default initialization
      if (!this.currentDisplayedChords || this.currentDisplayedChords.length === 0) {
        this.initializeCustomBars();
        return;
      }
      
      this.customBars = [];
      
      // Check if we have custom beats from previous edits
      if (this.customBeatsByPosition && this.customBeatsByPosition.length > 0) {
        // For each bar
        for (let i = 0; i < Math.max(this.barCount, this.customBeatsByPosition.length / 4); i++) {
          const bar = [];
          let barBeatsTotal = 0;
          const startIndex = i * 4; // Start a new count for each bar
          
          // Add chords based on position-specific beats
          for (let j = 0; j < 4 && startIndex + j < this.customBeatsByPosition.length; j++) {
            const positionIndex = startIndex + j;
            
            if (positionIndex >= this.customBeatsByPosition.length || positionIndex >= this.currentDisplayedChords.length) {
              break;
            }
            
            const chordName = this.currentDisplayedChords[positionIndex];
            const chordBeats = this.customBeatsByPosition[positionIndex];
            
            if (barBeatsTotal + chordBeats <= 4) {
              bar.push({
                chord: chordName,
                beats: chordBeats
              });
              
              barBeatsTotal += chordBeats;
            } else {
              // Adjust if adding this chord would exceed 4 beats
              const remainingBeats = 4 - barBeatsTotal;
              if (remainingBeats > 0) {
                bar.push({
                  chord: chordName,
                  beats: remainingBeats
                });
              }
              barBeatsTotal = 4;
              break;
            }
          }
          
          // If bar isn't full, add a chord to complete it
          if (barBeatsTotal < 4) {
            bar.push({
              chord: this.chordsInOriginalKey[0] || 'C',
              beats: 4 - barBeatsTotal
            });
          }
          
          this.customBars.push(bar);
          
          if (this.customBars.length >= this.barCount) {
            break;
          }
        }
      } else {
        // Standard initialization with uniform beats
        // Create variation to avoid repeating the same pattern
        let expandedChords = [...this.currentDisplayedChords];
        
        // Expand array to cover all bars with variations
        while (expandedChords.length < this.barCount * 4) {
          const variation = [...this.currentDisplayedChords];
          
          // Fisher-Yates shuffle for variation
          for (let i = variation.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [variation[i], variation[j]] = [variation[j], variation[i]];
          }
          
          expandedChords = [...expandedChords, ...variation];
        }
        
        // Create bars with different chords
        const chordsPerBar = 4 / this.initialBeatsPerChord;
        
        for (let i = 0; i < this.barCount; i++) {
          const bar = [];
          const startIndex = i * chordsPerBar;
          
          for (let j = 0; j < chordsPerBar; j++) {
            const chordIndex = startIndex + j;
            if (chordIndex < expandedChords.length) {
              bar.push({
                chord: expandedChords[chordIndex],
                beats: this.initialBeatsPerChord
              });
            }
          }
          
          this.customBars.push(bar);
        }
      }
      
      // Store original state for reset functionality
      this.originalCustomBars = JSON.parse(JSON.stringify(this.customBars));
    },
    
    addBar() {
      if (this.customBars.length >= 32) return; // Limit to 32 bars
      
      const newBar = [];
      
      // Create a bar following the progression pattern
      if (this.currentDisplayedChords && this.currentDisplayedChords.length > 0) {
        const chordsPerBar = 2; // Standard of 2 chords per bar with 2 beats each
        
        const firstChordIdx = (this.customBars.length * chordsPerBar) % this.currentDisplayedChords.length;
        const secondChordIdx = (this.customBars.length * chordsPerBar + 1) % this.currentDisplayedChords.length;
        
        newBar.push({
          chord: this.currentDisplayedChords[firstChordIdx],
          beats: 2
        });
        
        newBar.push({
          chord: this.currentDisplayedChords[secondChordIdx],
          beats: 2
        });
      } else {
        // Fallback if no current displayed chords
        newBar.push({
          chord: this.chordsInOriginalKey[0] || 'C',
          beats: 2
        });
        
        newBar.push({
          chord: this.chordsInOriginalKey[1] || 'Dm',
          beats: 2
        });
      }
      
      this.customBars.push(newBar);
    },
    
    editChord(barIndex, slotIndex) {
      this.isEditingChord = true;
      this.activeEditPosition = {
        barIndex,
        slotIndex
      };
      
      const selectedChordSlot = this.customBars[barIndex][slotIndex];
      this.editingChordName = selectedChordSlot.chord;
      this.editingBeats = selectedChordSlot.beats;
      
      this.updateBeatConstraintsForEdit(barIndex, slotIndex);
    },
    
    updateBeatConstraintsForEdit(barIndex, slotIndex) {
      const bar = this.customBars[barIndex];
      
      // Show warning when selecting 4 beats if bar has multiple chords
      this.showFullBarWarning = this.editingBeats === 4 && bar.length > 1;
    },
    
    saveChordEdit() {
      if (!this.isEditingChord) return;
      
      const barIndex = this.activeEditPosition.barIndex;
      const slotIndex = this.activeEditPosition.slotIndex;
      
      // Deep copy to avoid reference issues
      const bar = JSON.parse(JSON.stringify(this.customBars[barIndex]));
      
      // Special case: 4 beats means this chord takes the whole bar
      if (this.editingBeats === 4) {
        this.customBars[barIndex] = [{
          chord: this.editingChordName,
          beats: 4
        }];
        
        this.cancelChordEdit();
        return;
      }
      
      // Update chord
      bar[slotIndex] = {
        chord: this.editingChordName,
        beats: this.editingBeats
      };
      
      // Calculate total beats
      const newTotalBeats = bar.reduce((sum, chord) => sum + chord.beats, 0);
      
      // Handle case where total beats is less than 4
      if (newTotalBeats < 4) {
        const remainingBeats = 4 - newTotalBeats;
        
        if (bar.length === 1 || slotIndex === bar.length - 1) {
          // Add new chord if this is last chord
          bar.push({
            chord: this.chordsInOriginalKey[0] || 'C',
            beats: remainingBeats
          });
        } else {
          // Add remaining beats to next chord
          const nextSlotIndex = slotIndex + 1;
          if (nextSlotIndex < bar.length) {
            bar[nextSlotIndex].beats += remainingBeats;
          }
        }
      } 
      // Handle case where total beats exceeds 4
      else if (newTotalBeats > 4) {
        const excessBeats = newTotalBeats - 4;
        
        if (slotIndex < bar.length - 1) {
          // Try to reduce beats from later chords
          for (let i = slotIndex + 1; i < bar.length && excessBeats > 0; i++) {
            if (bar[i].beats > excessBeats) {
              bar[i].beats -= excessBeats;
              break;
            } else {
              // Remove chord if it will have 0 beats
              bar.splice(i, 1);
              i--; // Adjust index
            }
          }
        } else {
          // Adjust previous chords proportionally
          const otherChordsBeats = newTotalBeats - this.editingBeats;
          
          if (otherChordsBeats > 0) {
            const reductionFactor = (otherChordsBeats - excessBeats) / otherChordsBeats;
            
            for (let i = 0; i < bar.length; i++) {
              if (i !== slotIndex) {
                let newBeats = Math.max(1, Math.floor(bar[i].beats * reductionFactor));
                bar[i].beats = newBeats;
              }
            }
          } else {
            // If we can't reduce proportionally, make this chord take the whole bar
            bar[slotIndex].beats = 4;
            const currentChord = bar[slotIndex];
            bar.length = 0;
            bar.push(currentChord);
          }
        }
      }
      
      // Final check to ensure we have exactly 4 beats
      const finalTotalBeats = bar.reduce((sum, chord) => sum + chord.beats, 0);
      
      if (finalTotalBeats !== 4) {
        // Find a chord to adjust (not the one being edited)
        let adjustableChordIndex = -1;
        
        for (let i = 0; i < bar.length; i++) {
          if (i !== slotIndex && bar[i].beats > 1) {
            adjustableChordIndex = i;
            break;
          }
        }
        
        if (adjustableChordIndex >= 0) {
          bar[adjustableChordIndex].beats += (4 - finalTotalBeats);
        } else {
          // If no other chord can be adjusted, adjust the current chord
          bar[slotIndex].beats += (4 - finalTotalBeats);
        }
      }
      
      // Remove any chord with 0 beats
      const finalBar = bar.filter(chord => chord.beats > 0);
      
      // Update the bar
      this.customBars[barIndex] = finalBar;
      
      this.cancelChordEdit();
    },
    
    cancelChordEdit() {
      this.isEditingChord = false;
      this.activeEditPosition = {
        barIndex: -1,
        slotIndex: -1
      };
    },
    
    close() {
      this.cancelChordEdit();
      this.$emit('close');
    },
    
    applyChanges() {
      if (this.hasBarWithInvalidBeats) return;
      
      // Convert the bar/chord structure to a flat array
      const chords = [];
      const allBeatsPerPosition = [];
      
      for (const bar of this.customBars) {
        for (const slot of bar) {
          chords.push(slot.chord);
          allBeatsPerPosition.push(slot.beats);
        }
      }
      
      this.$emit('apply', {
        chords: chords,
        beatsByPosition: allBeatsPerPosition,
        barCount: this.customBars.length
      });
      
      this.close();
    },
    
    resetChanges() {
      if (this.originalCustomBars.length > 0) {
        this.customBars = JSON.parse(JSON.stringify(this.originalCustomBars));
      } else {
        this.initializeCustomBarsFromCurrentChords();
      }
      
      this.cancelChordEdit();
    }
  },
  created() {
    this.initializeCustomBars();
  }
}
</script>

<template>
  <div v-if="isVisible" class="modal-background">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Custom Chord and Beat</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Current Key and Available Chords Info -->
        <div class="current-key-info">
          <div class="key-display">
            <h3>
              Current Key: 
              <span class="highlight">{{ displayKey }}</span>
              <span v-if="isCustomKey" class="original-key-note">
                (Original: {{ originalKey }})
              </span>
            </h3>
            <p class="info-text">You can customize chord progression based on chords in the {{ originalKey }} key</p>
          </div>
          
          <div class="chords-in-key">
            <h4>Chords available in {{ originalKey }} key:</h4>
            <div class="chord-chips">
              <div v-for="(chord, index) in chordsInOriginalKey" :key="index" class="chord-chip">
                {{ chord }}
              </div>
            </div>
          </div>
        </div>

        <!-- Chord Editor Section -->
        <div class="bars-editor">
          <h3>Customize Your Chord Progression</h3>
          <p class="instruction">Click on any chord to customize it - Total beats in each bar must be 4</p>
          
          <div class="bars-container">
            <div v-for="(bar, barIndex) in customBars" :key="`bar-${barIndex}`" class="bar-editor">
              <div class="bar-header">
                Bar {{ barIndex + 1 }}
                <span class="beat-total" :class="{ 'beat-error': getTotalBeatsInBar(barIndex) !== 4 }">
                  ({{ getTotalBeatsInBar(barIndex) }}/4 beats)
                </span>
              </div>
              <div class="bar-chords">
                <div 
                  v-for="(chordSlot, slotIndex) in bar" 
                  :key="`chord-${barIndex}-${slotIndex}`"
                  class="chord-slot"
                  @click="editChord(barIndex, slotIndex)"
                  :class="{'active': activeEditPosition.barIndex === barIndex && activeEditPosition.slotIndex === slotIndex}"
                >
                  <div class="chord-display">{{ chordSlot.chord }}</div>
                  <div class="beats-display">{{ chordSlot.beats }} beat{{ chordSlot.beats > 1 ? 's' : '' }}</div>
                </div>
                <div 
                  v-if="bar.length < 4" 
                  class="add-chord-button"
                  @click="addChordToBar(barIndex)"
                >
                  + Add Chord
                </div>
              </div>
            </div>
            
            <!-- Add button for adding more bars -->
            <div v-if="customBars.length < 32" class="add-bar-button" @click="addBar">
              + Add Bar
            </div>
          </div>
        </div>

        <!-- Chord Editor Dialog -->
        <div v-if="isEditingChord" class="chord-editor">
          <div class="editor-header">
            <h4>Editing chord in Bar {{ activeEditPosition.barIndex + 1 }}, Position {{ activeEditPosition.slotIndex + 1 }}</h4>
            <div class="editor-actions-top">
              <button class="delete-chord" @click="deleteChord" v-if="canDeleteChord">Delete</button>
              <button class="close-editor" @click="cancelChordEdit">&times;</button>
            </div>
          </div>
          
          <div class="editor-body">
            <div class="editor-row">
              <label>Select Chord:</label>
              <select v-model="editingChordName">
                <!-- ใช้ fallback chord ถ้า chordsInOriginalKey เป็น array ว่าง -->
                <template v-if="chordsInOriginalKey && chordsInOriginalKey.length > 0">
                  <option v-for="chord in chordsInOriginalKey" :key="chord" :value="chord">{{ chord }}</option>
                </template>
                <template v-else>
                  <option v-for="chord in fallbackChords" :key="chord" :value="chord">{{ chord }}</option>
                </template>
              </select>
            </div>
            
            <div class="editor-row">
              <label>Beats:</label>
              <div class="beat-buttons">
                <button
                  v-for="beatValue in [1, 2, 3, 4]"
                  :key="beatValue"
                  :class="['beat-button', { active: editingBeats === beatValue }]"
                  @click="editingBeats = beatValue; updateBeatConstraintsForEdit(activeEditPosition.barIndex, activeEditPosition.slotIndex)"
                >
                  {{ beatValue }}
                </button>
              </div>
              <div class="beat-info">
                This chord will take {{ editingBeats }} of the 4 beats in the bar
                <span v-if="showFullBarWarning" class="full-bar-warning">
                  (Selecting 4 beats will remove all other chords in this bar)
                </span>
              </div>
            </div>
            
            <div class="editor-actions">
              <button class="save-chord" @click="saveChordEdit">Save Changes</button>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <div class="error-message" v-if="hasBarWithInvalidBeats">
          Some bars don't have exactly 4 beats total. Please fix this before applying.
        </div>
        <div class="footer-buttons">
          <button class="reset-button" @click="resetChanges" title="Reset to original state">
            Reset
          </button>
          <div class="action-buttons">
            <button class="cancel-button" @click="close">Cancel</button>
            <button class="apply-button" @click="applyChanges" :disabled="hasBarWithInvalidBeats">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  background-color: #2c2c2c;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #151b22;
  border-bottom: 2px solid #444;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  color: #fff;
  font-family: 'Avalors Personal Use', sans-serif;
  font-size: 24px;
}

/* Current Key Info Section */
.current-key-info {
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border-left: 4px solid #ff8c00;
}

.key-display h3 {
  margin-top: 0;
  color: #fff;
  font-size: 20px;
}

.key-display .highlight {
  color: #ff8c00;
  font-weight: bold;
}

.info-text {
  font-style: italic;
  color: #aaa;
  margin-top: 5px;
  font-size: 14px;
}

.chords-in-key h4 {
  color: #ddd;
  font-size: 16px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.chord-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chord-chip {
  background-color: #383838;
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: bold;
  color: #fff;
  font-size: 14px;
  border: 1px solid #555;
}

/* Close Button */
.close-button, .close-editor {
  background: none;
  border: none;
  color: #ccc;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.close-button:hover, .close-editor:hover {
  color: #ff8c00;
}

.modal-body {
  padding: 20px;
  color: #fff;
}

h3 {
  margin-top: 0;
  color: #fff;
  font-size: 18px;
  margin-bottom: 15px;
}

.bars-editor {
  margin-bottom: 25px;
}

.instruction {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 15px;
  font-style: italic;
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #383838;
  border-radius: 8px;
}

/* Bar Styling */
.bar-editor {
  background-color: #444;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #555;
}

.bar-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 10px;
  color: #ff8c00;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.beat-total {
  font-size: 12px;
  color: #aaa;
}

.beat-error {
  color: #ff4040;
  font-weight: bold;
}

.bar-chords {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chord-slot {
  background-color: #333;
  border: 2px solid #555;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  flex-grow: 1;
}

.chord-slot:hover {
  background-color: #3a3a3a;
  border-color: #ff8c00;
}

.chord-slot.active {
  background-color: #4a4a4a;
  border-color: #ff8c00;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.3);
}

.chord-display {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.beats-display {
  font-size: 12px;
  color: #aaa;
}

.add-chord-button {
  background-color: #333;
  border: 2px dashed #666;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #aaa;
  transition: all 0.2s ease;
  min-width: 80px;
  flex-grow: 1;
}

.add-chord-button:hover {
  background-color: #3a3a3a;
  border-color: #ff8c00;
  color: #ff8c00;
}

.add-bar-button {
  background-color: #333;
  border: 2px dashed #666;
  border-radius: 6px;
  padding: 15px;
  margin-top: 10px;
  text-align: center;
  cursor: pointer;
  color: #aaa;
  font-weight: bold;
  transition: all 0.2s ease;
}

.add-bar-button:hover {
  background-color: #3a3a3a;
  border-color: #ff8c00;
  color: #ff8c00;
}

/* Chord Editor */
.chord-editor {
  background-color: #383838;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  border: 2px solid #ff8c00;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.editor-header h4 {
  margin: 0;
  color: #ff8c00;
}

.editor-actions-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delete-chord {
  padding: 5px 10px;
  background-color: #ff4040;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-chord:hover {
  background-color: #ff6060;
}

.editor-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.editor-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.editor-row select {
  padding: 8px;
  background-color: #444;
  color: #fff;
  border: 1px solid #666;
  border-radius: 5px;
  flex: 1;
}

.beat-buttons {
  display: flex;
  gap: 10px;
}

.beat-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #555;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.beat-button:hover {
  background-color: #666;
}

.beat-button.active {
  background-color: #ff8c00;
  color: #000;
}

.beat-info {
  font-size: 12px;
  color: #aaa;
  font-style: italic;
  margin-top: 5px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-chord {
  padding: 8px 16px;
  background-color: #50c878;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.save-chord:hover {
  background-color: #3cb371;
  transform: scale(1.05);
}

/* Footer */
.modal-footer {
  padding: 15px 20px;
  background-color: #1e1e1e;
  display: flex;
  justify-content: space-between;
  position: sticky;
  bottom: 0;
  align-items: center;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.error-message {
  color: #ff4040;
  font-size: 14px;
  margin-right: auto;
}

.reset-button {
  padding: 10px 20px;
  background-color: #555;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.reset-button:before {
  content: "↺";
  margin-right: 6px;
  font-size: 18px;
}

.reset-button:hover {
  background-color: #ff8c00;
  transform: scale(1.05);
}

.cancel-button {
  padding: 10px 20px;
  background-color: #666;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
  background-color: #777;
}

.apply-button {
  padding: 10px 25px;
  background-color: #50c878;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.apply-button:hover:not(:disabled) {
  background-color: #3cb371;
  transform: scale(1.05);
}

.apply-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.original-key-note {
  font-size: 14px;
  color: #aaa;
  margin-left: 8px;
  font-weight: normal;
}

.full-bar-warning {
  color: #ff4040;
  font-weight: bold;
  display: block;
  margin-top: 4px;
}

/* Responsive design */
@media (max-width: 600px) {
  .editor-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .editor-row label {
    margin-bottom: 5px;
  }
  
  .chord-chips {
    justify-content: center;
  }
}
</style>
