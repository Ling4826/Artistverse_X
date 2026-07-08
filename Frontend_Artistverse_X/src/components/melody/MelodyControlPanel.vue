<template>
  <div class="melody-control-panel">
    
    <!-- MIDI Generation Section -->
    <div class="generate-section">
      <button 
        @click="generateMidi"
        class="generate-midi-btn"
        :disabled="!canGenerate"
      >
        Generate MIDI
      </button>
    </div>
    
    <!-- Control Panel Section -->
    <div class="control-panel-section">
      
      <!-- Instrument Selection -->
      <div class="instrument-section">
        <label for="instrument" class="control-label">Pick instrument</label>
        <select 
          id="instrument"
          v-model="selectedInstrument" 
          class="instrument-select"
          @change="onInstrumentChange"
        >
          <option value="piano">Piano</option>
          <option value="guitar">Guitar</option>
        </select>
        
        <!-- Download MIDI File Button -->
        <button 
          @click="downloadMidi"
          class="download-btn"
          :disabled="!hasMidiFile"
        >
          Download MIDI File
        </button>
      </div>
      
      <!-- Audio Player Section -->
      <div class="audio-player-section">
        <div class="audio-player">
          
          <!-- Play/Pause Button -->
          <button 
            @click="togglePlayback"
            class="play-btn"
            :disabled="!hasMidiFile"
          >
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          
          <!-- Progress Bar and Time Display -->
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="time-display">{{ currentTime }} / {{ totalTime }}</span>
          </div>
          
          <!-- Volume Control -->
          <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model="volume"
              class="volume-slider"
              @input="onVolumeChange"
            />
          </div>
          
        </div>
      </div>
      
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'MelodyControlPanel',
  props: {
    notes: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      // Control states
      selectedInstrument: 'piano',
      hasMidiFile: false,
      isPlaying: false,
      currentTime: '0:00',
      totalTime: '0:00',
      progressPercentage: 0,
      volume: 50,
      progressInterval: null
    }
  },
  
  computed: {
    canGenerate() {
      return this.notes && this.notes.length > 0;
    }
  },
  
  methods: {
    generateMidi() {
      if (!this.canGenerate) {
        alert('Please add at least 1 note before creating a MIDI file');
        return;
      }
      
      this.$emit('generate-midi', {
        notes: this.notes,
        settings: this.settings,
        instrument: this.selectedInstrument
      });
      
      this.hasMidiFile = true;
      this.calculateTotalTime();
    },
    
    onInstrumentChange() {
      this.$emit('instrument-changed', this.selectedInstrument);
    },
    
    downloadMidi() {
      if (!this.hasMidiFile) {
        alert('Please generate MIDI file first');
        return;
      }
      
      this.$emit('download-midi', {
        notes: this.notes,
        settings: this.settings,
        instrument: this.selectedInstrument
      });
    },
    
    togglePlayback() {
      if (!this.hasMidiFile) return;
      
      this.isPlaying = !this.isPlaying;
      
      if (this.isPlaying) {
        this.startPlayback();
      } else {
        this.pausePlayback();
      }
    },
    
    startPlayback() {
      this.$emit('start-playback', {
        notes: this.notes,
        settings: this.settings,
        instrument: this.selectedInstrument
      });
      
      this.simulateProgress();
    },
    
    pausePlayback() {
      this.$emit('pause-playback');
      
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    },
    
    onVolumeChange() {
      this.$emit('volume-changed', this.volume / 100);
    },
    
    calculateTotalTime() {
      if (!this.settings || !this.notes.length) return;
      
      const useExactNotes = this.notes.length < 4;
      
      let totalNotesToPlay;
      if (useExactNotes) {
        totalNotesToPlay = this.notes.length;
      } else {
        const notesPerBar = 4 / this.settings.noteDuration;
        totalNotesToPlay = this.settings.numberOfBars * notesPerBar;
      }
      
      const msPerBeat = 60000 / this.settings.tempo;
      const msPerNote = msPerBeat * this.settings.noteDuration;
      const totalSeconds = (totalNotesToPlay * msPerNote) / 1000;
      
      this.totalTime = this.formatTime(totalSeconds);
    },
    
    simulateProgress() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
      }
      
      const totalSeconds = this.parseTime(this.totalTime);
      const startTime = Date.now();
      
      this.progressInterval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
          return;
        }
        
        const elapsed = (Date.now() - startTime) / 1000;
        
        if (elapsed >= totalSeconds) {
          this.currentTime = this.totalTime;
          this.progressPercentage = 100;
          this.isPlaying = false;
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        } else {
          this.currentTime = this.formatTime(elapsed);
          this.progressPercentage = (elapsed / totalSeconds) * 100;
        }
      }, 100);
    },
    
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    parseTime(timeString) {
      const [minutes, seconds] = timeString.split(':').map(Number);
      return minutes * 60 + seconds;
    },
    
    resetPlaybackState() {
      this.hasMidiFile = false;
      this.isPlaying = false;
      this.currentTime = '0:00';
      this.progressPercentage = 0;
    }
  },
  
  watch: {
    notes() {
      this.resetPlaybackState();
    },
    settings: {
      handler() {
        this.resetPlaybackState();
      },
      deep: true
    }
  },
  
  emits: [
    'generate-midi', 
    'download-midi', 
    'instrument-changed', 
    'start-playback', 
    'pause-playback', 
    'volume-changed'
  ]
}
</script>

<style scoped>
.melody-control-panel {
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

/* Generate MIDI Section */
.generate-section {
  text-align: center;
  margin-bottom: 20px;
}

.generate-midi-btn {
  padding: 15px 40px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-midi-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.generate-midi-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* Control Panel Section */
.control-panel-section {
  border-top: 1px solid #444;
  padding-top: 20px;
}

/* Instrument Selection Section */
.instrument-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
}

.control-label {
  color: white;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
}

.instrument-select {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #404040;
  color: white;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
  max-width: 150px;
  transition: background-color 0.3s;
}

.instrument-select:focus {
  outline: none;
  background-color: #505050;
}

.download-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.download-btn:hover:not(:disabled) {
  background-color: #218838;
}

.download-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* Audio Player Section */
.audio-player-section {
  background-color: #333;
  padding: 15px;
  border-radius: 8px;
}

.audio-player {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Play/Pause Button */
.play-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.play-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.play-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* Progress Bar Container */
.progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #555;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.1s ease;
}

.time-display {
  color: #ccc;
  font-size: 12px;
  white-space: nowrap;
  min-width: 70px;
  text-align: center;
}

/* Volume Control */
.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.volume-icon {
  font-size: 14px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  background: #555;
  outline: none;
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .instrument-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .instrument-select {
    max-width: none;
  }
  
  .audio-player {
    flex-direction: column;
    gap: 10px;
  }
  
  .progress-container {
    width: 100%;
  }
}
</style>