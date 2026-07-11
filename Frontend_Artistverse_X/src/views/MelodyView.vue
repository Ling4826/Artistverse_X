<script>
import MelodyInputForm from '@/components/melody/MelodyInputForm.vue'
import MelodyControlPanel from '@/components/melody/MelodyControlPanel.vue'
import MidiService from '@/services/MidiService.js'
import AudioService from '@/services/audioService.js'

export default {
  name: 'MelodyView',
  components: {
    MelodyInputForm,
    MelodyControlPanel
  },  data() {
    return {
      currentNotes: [],         // Notes from MelodyInputForm
      currentSettings: {},      // Settings from MelodyInputForm
      midiService: null,        // MIDI service instance
      audioService: null,       // Audio service instance
      stopPlaybackFn: null,     // Function to stop current playback
      currentMidiFile: null,    // Generated MIDI file data
      currentMidiData: null,    // Current MIDI generation data
      currentVolume: 0.5,       // Current volume level (0.0-1.0)
      isGeneratingMidi: false,  // MIDI generation status
      isPreviewing: false       // Audio preview status
    }
  },
  created() {
    // Initialize services
    this.midiService = new MidiService();
    this.audioService = new AudioService();
  },
  beforeUnmount() {
    // Clean up audio when component is destroyed
    if (this.audioService) {
      this.audioService.stopAll();
    }
    if (this.stopPlaybackFn) {
      this.stopPlaybackFn();
    }
  },
  methods: {
    // Navigation to Chord Progression
    goToChordProgression() {
      this.$router.push('/progression');
    },
    
    // Handle notes change from MelodyInputForm
    onNotesChanged(notes) {
      this.currentNotes = notes;
      console.log('Notes updated:', notes);
    },
    
    // Handle settings change from MelodyInputForm
    onSettingsChanged(settings) {
      this.currentSettings = settings;
      console.log('Settings updated:', settings);
    },    // Handle MIDI generation from MelodyControlPanel
    onGenerateMidi(data) {
      this.isGeneratingMidi = true;
      
      try {
        // Generate MIDI file using MidiService
        const midiFile = this.midiService.generateMelodyMidiFile(data.notes, data.settings);
        console.log('MIDI Generated successfully:', {
          notes: data.notes.length,
          tempo: data.settings.tempo,
          instrument: data.instrument,
          fileSize: midiFile.length
        });
        
        // Store for potential download
        this.currentMidiFile = midiFile;
        this.currentMidiData = data;
        
      } catch (error) {
        console.error('Failed to generate MIDI:', error);
        alert('Failed to generate MIDI file. Please check your settings.');
      } finally {
        this.isGeneratingMidi = false;
      }
    },
    
    // Handle MIDI download from MelodyControlPanel
    onDownloadMidi(data) {
      try {
        if (!this.currentMidiFile) {
          alert('Please generate MIDI file first');
          return;
        }
        
        // Download MIDI file using MidiService
        this.midiService.downloadMelodyMidiFile(
          this.currentMidiFile,
          data.instrument,
          data.settings.tempo,
          data.settings.numberOfBars
        );
        
        console.log('MIDI download initiated');
      } catch (error) {
        console.error('Failed to download MIDI:', error);
        alert('Failed to download MIDI file.');
      }
    },
    
    // Handle instrument change
    onInstrumentChanged(instrument) {
      console.log('Instrument changed to:', instrument);
      // Stop current playback when instrument changes
      if (this.stopPlaybackFn) {
        this.stopPlaybackFn();
      }
    },    // Handle playback start
    async onStartPlayback(data) {
      try {
        console.log('Starting melody playback:', data);
        this.isPreviewing = true;
        
        // Stop any existing playback
        if (this.stopPlaybackFn) {
          this.stopPlaybackFn();
        }
        
        // Start melody sequence playback using AudioService
        this.stopPlaybackFn = await this.audioService.playMelodySequence(
          data.notes,
          data.settings,
          data.instrument,
          this.onNoteChange,
          this.onPlaybackComplete
        );
        
      } catch (error) {
        console.error('Failed to start playback:', error);
        alert('Failed to start audio playback. Please check your browser settings.');
        this.isPreviewing = false;
      }
    },
    
    // Handle playback pause
    onPausePlayback() {
      console.log('Pausing melody playback');
      this.isPreviewing = false;
      
      if (this.stopPlaybackFn) {
        this.stopPlaybackFn();
        this.stopPlaybackFn = null;
      }
    },// Handle volume change
    onVolumeChanged(volume) {
      console.log('Volume changed to:', volume);
      this.currentVolume = volume;
      
      // Apply global volume to AudioService
      if (this.audioService) {
        this.audioService.setGlobalVolume(volume);
      }
    },
    
    // Callback when note changes during playback
    onNoteChange(noteIndex, note) {
      console.log(`Playing note ${noteIndex + 1}: ${note.pitch}${note.octave}`);
      // Could update UI visualization here
    },    // Callback when playback completes
    onPlaybackComplete() {
      console.log('Melody playback completed');
      this.isPreviewing = false;
      this.stopPlaybackFn = null;
    }
  }
}
</script>

<template>
  <div class="body">
    <!-- Header with Tab Navigation -->
    <header class="app-header">
      <div class="tab-selector">
        <button class="tab-button" @click="goToChordProgression">CHORD PROGRESSION</button>
        <button class="tab-button active">MELODY CREATOR</button>
      </div>
    </header>
    
    <!-- Main Content -->
    <div class="content">
      <h2>Melody Creator</h2>
        <!-- Melody Input Form Component -->
      <MelodyInputForm 
        @notes-changed="onNotesChanged"
        @settings-changed="onSettingsChanged"
      />
      
      <!-- Melody Control Panel Component -->
      <MelodyControlPanel
        :notes="currentNotes"
        :settings="currentSettings"
        @generate-midi="onGenerateMidi"
        @download-midi="onDownloadMidi"
        @instrument-changed="onInstrumentChanged"
        @start-playback="onStartPlayback"
        @pause-playback="onPausePlayback"
        @volume-changed="onVolumeChanged"
      />
      
    </div>
  </div>
</template>

<style scoped>
.body {
  text-align: center;
  min-height: 100vh;
  background-color: #1b1b1b;
  color: white;
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

.content {
  width: 95%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

h2 {
  font-family: 'Avalors Personal Use', Arial, sans-serif;
  font-size: 40px;
  text-shadow: 0 0 4px white;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  color: #ccc;
}
</style>
