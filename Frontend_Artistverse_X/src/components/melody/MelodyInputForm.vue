<template>  <div class="melody-input-form">
    <!-- Melody Notes Input Section -->
    <div class="notes-input-section">
      <h3 class="section-title">Input Melody</h3>
      
      <!-- Progress Indicator -->
      <div class="notes-progress" v-if="settings.numberOfBars">
        <div class="progress-info">
          <span class="notes-count">{{ notes.length }} notes</span>
          <span class="separator">•</span>
          <span class="total-notes">{{ totalNotesNeeded }} total needed</span>
          <span class="separator">•</span>
          <span class="bars-info">{{ settings.numberOfBars }} bars</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
              :class="{ 'complete': progressPercentage >= 100 }"
            ></div>
          </div>
          <span class="progress-text">{{ Math.round(progressPercentage) }}%</span>
        </div>        <div class="progress-description">
          <span v-if="useExactNotes" class="exact-mode">
            Using your {{ notes.length }} notes exactly ({{ actualBars.toFixed(1) }} bars total)
          </span>          
          <span v-else-if="progressPercentage < 100" class="incomplete">
            {{ totalNotesNeeded - notes.length }} more notes needed for {{ settings.numberOfBars }} bars target
          </span>
          <span v-else-if="progressPercentage === 100" class="complete">
            Perfect! Your melody fills exactly {{ settings.numberOfBars }} bars
          </span>          <span v-else class="overflow">
            Your melody pattern will repeat to fill {{ settings.numberOfBars }} bars
          </span>
        </div>
      </div>      <!-- Note Input Rows -->
      <div class="note-rows-container">
        <div class="note-rows" ref="noteRowsContainer">
          <div 
            v-for="(note, index) in notes" 
            :key="index" 
            class="note-row"
            :class="{ 'highlighted': shouldHighlightNote(index) }"
          >
            <span class="note-number">{{ index + 1 }}</span>
              <!-- Note Selection Dropdown -->
            <select v-model="notes[index]" class="note-select" @change="emitNotesChange">
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
            
            <!-- Octave Selection Dropdown -->
            <select v-model="octaves[index]" class="octave-select" @change="emitNotesChange">
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
            
            <!-- Remove Note Button -->
            <button 
              @click="removeNote(index)" 
              class="remove-note-btn"
              :disabled="notes.length <= 1"
              title="Remove this note"
            >
              ×
            </button>
          </div>
        </div>
          <!-- Scroll Indicator -->
        <div v-if="notes.length > 8" class="scroll-indicator">
          <span class="scroll-text">{{ notes.length - 8 }} more notes below ↓</span>
        </div>
      </div>
      
      <!-- Add Note Section -->
      <div class="add-note-section">
        <button 
          @click="addNote" 
          class="add-note-btn"
          :class="{ 'suggested': shouldSuggestAddingNote }"
        >
          + Add Note
          <span v-if="shouldSuggestAddingNote" class="suggestion">
            ({{ totalNotesNeeded - notes.length }} more needed)
          </span>
        </button>
        
        <!-- Quick Fill Button -->
        <button 
          v-if="!useExactNotes && totalNotesNeeded > notes.length" 
          @click="quickFillNotes"
          class="quick-fill-btn"
          title="Fill remaining notes with the last note"
        >
          Quick Fill ({{ totalNotesNeeded - notes.length }})
        </button>
      </div>
      
      <!-- Validation Message -->
      <p v-if="notes.length === 0" class="validation-message">
        Please add at least 1 note before creating a MIDI file
      </p>
    </div>
    
    <!-- Settings Section -->
    <div class="settings-section">
      <div class="settings-grid">        
        <!-- Number of Bars Input -->
        <div class="setting-group">
          <label for="numberOfBars" 
          class="setting-label">Target Bars (Optional)
        </label>
          <div class="input-wrapper">            
            <input 
              id="numberOfBars"
              v-model="settings.numberOfBars"
              type="text" 
              class="setting-input number-input"
              @input="handleNumberOfBarsInput"
              @blur="validateNumberOfBars"
              @keydown="preventArrowKeys"
              @wheel="preventDefault"
              placeholder="4"
            />
            <span class="input-unit">bars</span>
          </div>
          <span class="setting-description">(1-32) Target length in bars</span>
        </div>
        
        <!-- Tempo Input -->
        <div class="setting-group">
          <label for="tempo" class="setting-label">Tempo (BPM)</label>
          <div class="input-wrapper">            <input 
              id="tempo"
              v-model="settings.tempo"
              type="text" 
              class="setting-input number-input"
              @input="handleTempoInput"
              @blur="validateTempo"
              @keydown="preventArrowKeys"
              @wheel="preventDefault"
              placeholder="120"
            />
            <span class="input-unit">BPM</span>
          </div>
          <span class="setting-description">40-240 BPM</span>
        </div>
        
        <!-- Note Duration Selection -->
        <div class="setting-group">
          <label for="noteDuration" class="setting-label">Note Duration</label>
          <select 
            id="noteDuration"
            v-model="settings.noteDuration" 
            class="setting-select"
            @change="emitSettingsChange"
          >
            <option value="1">Whole Note (1)</option>
            <option value="0.5">Half Note (1/2)</option>
            <option value="0.25">Quarter Note (1/4)</option>
            <option value="0.125">Eighth Note (1/8)</option>
            <option value="0.0625">Sixteenth Note (1/16)</option>
          </select>
          <span class="setting-description">Applied to all notes</span>
        </div>
        
        <!-- Apply Octave Range to All Notes -->
        <div class="setting-group">
          <label for="octaveRange" class="setting-label">Apply Octave Range</label>
          <select 
            id="octaveRange"
            v-model="settings.octaveRange" 
            class="setting-select"
            @change="applyOctaveRangeToAllNotes"
          >
            <option value="2">Very Low (2)</option>
            <option value="3">Low (3)</option>
            <option value="4">Medium (4)</option>
            <option value="5">High (5)</option>
            <option value="6">Very High (6)</option>
          </select>
          <span class="setting-description">Click to apply this octave to all notes</span>
        </div>
        
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'MelodyInputForm',
  
  data() {
    return {
      // Melody data structure
      notes: ['C', 'D', 'E'],
      octaves: [4, 4, 4],
      
      // User settings
      settings: {
        numberOfBars: 4,
        tempo: 120,
        noteDuration: 0.25,
        octaveRange: 4,
        instrumentSelection: 'piano'
      },
      
      // File and status tracking
      midiFile: null,
      isGeneratingMidi: false,
      isPreviewing: false
    }
  },
  
  computed: {
    // Calculate notes needed for target bars
    totalNotesNeeded() {
      if (!this.settings.noteDuration || !this.settings.numberOfBars) return 0;
      return Math.ceil((4 / this.settings.noteDuration) * this.settings.numberOfBars);
    },
    
    progressPercentage() {
      if (this.totalNotesNeeded === 0) return 0;
      return Math.min((this.notes.length / this.totalNotesNeeded) * 100, 100);
    },
    
    actualBars() {
      if (!this.settings.noteDuration || !this.notes.length) return 0;
      return (this.notes.length * this.settings.noteDuration) / 4;
    },
    
    useExactNotes() {
      return this.notes.length > 0 && this.notes.length < 4;
    },
    
    shouldSuggestAddingNote() {
      return !this.useExactNotes && this.totalNotesNeeded > this.notes.length;
    },
    
    // Generated melody for services
    generatedMelody() {
      return this.notes.map((note, index) => ({
        note: note,
        octave: this.octaves[index] || 4,
        duration: this.settings.noteDuration
      }));
    },
    
    isPlayable() {
      return this.notes.length > 0 && this.notes.every(note => note !== '');
    },
    
    // Compatibility aliases
    bars() {
      return this.settings.numberOfBars;
    },
    
    tempo() {
      return this.settings.tempo;
    }
  },
  
  methods: {
    addNote() {
      const lastNote = this.notes[this.notes.length - 1] || 'C';
      const lastOctave = this.octaves[this.octaves.length - 1] || 4;
      
      this.notes.push(lastNote);
      this.octaves.push(lastOctave);
      this.emitNotesChange();
      
      this.$nextTick(() => {
        this.scrollToLatestNote();
      });
    },
    
    removeNote(index) {
      if (this.notes.length > 1) {
        this.notes.splice(index, 1);
        this.octaves.splice(index, 1);
        this.emitNotesChange();
      }
    },
    
    quickFillNotes() {
      if (this.notes.length === 0) return;
      
      const lastNote = this.notes[this.notes.length - 1];
      const lastOctave = this.octaves[this.octaves.length - 1];
      const notesToAdd = this.totalNotesNeeded - this.notes.length;
      
      for (let i = 0; i < notesToAdd; i++) {
        this.notes.push(lastNote);
        this.octaves.push(lastOctave);
      }
      
      this.emitNotesChange();
    },
    
    shouldHighlightNote(index) {
      return index < Math.min(this.notes.length, this.totalNotesNeeded);
    },
    
    applyOctaveRangeToAllNotes() {
      const selectedOctave = this.settings.octaveRange;
      for (let i = 0; i < this.octaves.length; i++) {
        this.octaves[i] = selectedOctave;
      }
      
      this.emitNotesChange();
      this.emitSettingsChange();
    },
    
    emitNotesChange() {
      const noteObjects = this.notes.map((note, index) => ({
        pitch: note,
        octave: this.octaves[index]
      }));
      
      this.$emit('notes-changed', noteObjects);
    },    emitSettingsChange() {
      this.$emit('settings-changed', this.settings);
    },
    
    handleNumberOfBarsInput(event) {
      const value = event.target.value;
      // Allow any input during typing, only filter non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue !== value) {
        event.target.value = numericValue;
        this.settings.numberOfBars = numericValue;
      } else {
        this.settings.numberOfBars = value;
      }
    },
    
    validateNumberOfBars(event) {
      const value = event.target.value;
      // Allow empty string for clearing the field
      if (value === '') {
        this.settings.numberOfBars = '';
        this.emitSettingsChange();
        return;
      }
      
      // Validate and clamp the final value
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        // Clamp between 1 and 32
        const clampedValue = Math.max(1, Math.min(32, numValue));
        this.settings.numberOfBars = clampedValue;
        // Update the input field to show the clamped value
        event.target.value = clampedValue;
        this.emitSettingsChange();
      } else {
        // If invalid input, set to default
        this.settings.numberOfBars = 4;
        event.target.value = 4;
        this.emitSettingsChange();
      }
    },
    
    handleTempoInput(event) {
      const value = event.target.value;
      // Allow any input during typing, only filter non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue !== value) {
        event.target.value = numericValue;
        this.settings.tempo = numericValue;
      } else {
        this.settings.tempo = value;
      }
    },
    
    validateTempo(event) {
      const value = event.target.value;
      // Allow empty string for clearing the field
      if (value === '') {
        this.settings.tempo = '';
        this.emitSettingsChange();
        return;
      }
      
      // Validate and clamp the final value
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        // Clamp between 40 and 240
        const clampedValue = Math.max(40, Math.min(240, numValue));
        this.settings.tempo = clampedValue;
        // Update the input field to show the clamped value
        event.target.value = clampedValue;
        this.emitSettingsChange();
      } else {
        // If invalid input, set to default
        this.settings.tempo = 120;
        event.target.value = 120;
        this.emitSettingsChange();
      }
    },
    
    preventArrowKeys(event) {
      // Prevent arrow up/down from changing values
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
      }
    },
    
    preventDefault(event) {
      // Prevent mouse wheel from changing values
      event.preventDefault();
    },
    
    scrollToLatestNote() {
      const container = this.$refs.noteRowsContainer;
      if (container && this.notes.length > 8) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  },
  
  mounted() {
    this.emitNotesChange();
    this.emitSettingsChange();
  },
  
  emits: ['notes-changed', 'settings-changed']
}
</script>

<style scoped>
.melody-input-form {
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

/* Notes Progress Section */
.notes-progress {
  background-color: #333;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}

.notes-count {
  color: #4CAF50;
  font-weight: bold;
}

.total-notes {
  color: #ffffff;
}

.bars-info {
  color: #007bff;
  font-weight: bold;
}

.separator {
  color: #666;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #555;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress-fill.complete {
  background-color: #00C851;
}

.progress-text {
  color: white;
  font-size: 14px;
  font-weight: bold;
  min-width: 40px;
}

.progress-description {
  text-align: center;
  font-size: 13px;
}

.progress-description .incomplete {
  color: #ffc107;
}

.progress-description .complete {
  color: #4CAF50;
}

.progress-description .exact-mode {
  color: #17a2b8;
  font-weight: bold;
}

/* Note Rows Enhancements */
.note-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.note-row.highlighted {
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.note-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #555;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

/* Add Note Section */
.add-note-section {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
}

.add-note-btn.suggested {
  background-color: #ffc107;
  color: #000;
  animation: pulse 2s infinite;
}

.add-note-btn.suggested:hover {
  background-color: #ffca2c;
}

.suggestion {
  font-size: 12px;
  margin-left: 5px;
  opacity: 0.9;
}

.quick-fill-btn {
  padding: 8px 15px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
}

.quick-fill-btn:hover {
  background-color: #138496;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0);
  }
}

/* Existing styles... */
.notes-input-section {
  margin-bottom: 30px;
}

.section-title {
  color: white;
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: bold;
}

/* Note Rows Container with Scrolling */
.note-rows-container {
  position: relative;
}

.note-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
  
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #555 #2a2a2a;
}

.note-rows::-webkit-scrollbar {
  width: 6px;
}

.note-rows::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 3px;
}

.note-rows::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.note-rows::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 11px;
  pointer-events: none;
  animation: fadeInOut 2s infinite;
  z-index: 10;
}

.scroll-text {
  font-weight: bold;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Note and Octave Selection Dropdowns */
.note-select, .octave-select {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background-color: #404040;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.note-select {
  width: 70px;
  text-align: center;
}

.octave-select {
  width: 60px;
  text-align: center;
}

.note-select:focus, .octave-select:focus {
  outline: none;
  background-color: #505050;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15), 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.note-select:hover, .octave-select:hover {
  background-color: #484848;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* Remove Note Button */
.remove-note-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background-color: #ff4444;
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.remove-note-btn:hover:not(:disabled) {
  background-color: #ff6666;
}

.remove-note-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* Add Note Button */
.add-note-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-note-btn:hover {
  background-color: #45a049;
}

/* Validation Message */
.validation-message {
  color: #ff6666;
  font-size: 14px;
  margin-top: 10px;
  font-style: italic;
}

/* Settings Section Styles */
.settings-section {
  border-top: 1px solid #444;
  padding-top: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* Settings Input and Select Elements */
.setting-input, .setting-select {
  padding: 14px 18px;
  border: none;
  border-radius: 10px;
  background-color: #404040;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-input:focus, .setting-select:focus {
  outline: none;
  background-color: #505050;
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.setting-input:hover, .setting-select:hover {
  background-color: #484848;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Input Wrapper for Number Inputs with Units */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #404040;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.input-wrapper:hover {
  background-color: #484848;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.input-wrapper:focus-within {
  background-color: #505050;
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.input-wrapper .setting-input {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 14px 18px;
  min-width: 0;
  box-shadow: none;
  transform: none;
}

.input-wrapper .setting-input:focus {
  background: transparent;
  border: none;
  box-shadow: none;
  transform: none;
}

.input-wrapper .setting-input:hover {
  background: transparent;
  transform: none;
}

.input-unit {
  padding: 14px 18px 14px 8px;
  color: #007bff;
  font-size: 14px;
  font-weight: 600;
  background: rgba(0, 123, 255, 0.1);
  white-space: nowrap;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* Number Input Specific Styles */
.number-input {
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 18px;
}

/* Remove number input arrows but keep functionality */
.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input {
  -moz-appearance: textfield;
  appearance: textfield;
}

.setting-description {
  color: #ccc;
  font-size: 12px;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .note-row {
    flex-wrap: wrap;
  }
}
</style>