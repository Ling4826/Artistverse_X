/**
 * Service for handling audio playback and caching
 */
export default class AudioService {
  constructor() {
    this.audioCache = new Map();
    this.currentPlayingAudio = null;
    this.previousAudio = null;
    this.currentTimeout = null;
    this.fadeOutTimeout = null;
    this.fadeDuration = 40;
    this.isPreloading = false;
    this.fadeIntervals = []; 
    this.volumeEnvelope = {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.8,
      release: 0.3
    };
    this.volumeEnvelopeInterval = null;
    this.globalVolume = 0.8; // Add global volume control
    this.progressCallback = null; // Add progress tracking
    this.playbackStartTime = null; // Track playback start time
  }
  
  /**
   * Preloads audio files for all chord names
   * @param {Array<string>} chords - Array of chord names to preload
   * @returns {Promise<void>}
   */
  async preloadAllChords(chords) {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    const uniqueChords = [...new Set(chords)];
      try {
      // Use Promise.allSettled to continue preloading even if some chords fail
      await Promise.allSettled(
        uniqueChords.map(chord => this.preloadAudio(chord))
      );
    } catch (error) {
      console.warn('Some chords failed to preload:', error);
    } finally {
      this.isPreloading = false;
    }
  }
  
  /**
   * Preloads an audio file for a chord
   * @param {string} chord - The chord to preload audio for
   * @returns {Promise<HTMLAudioElement>} - A promise resolving to the audio element
   */
  async preloadAudio(chord) {
    if (this.audioCache.has(chord)) {
      // Create a new instance to allow multiple sounds to be played simultaneously
      const cachedAudio = this.audioCache.get(chord);
      const newAudio = new Audio(cachedAudio.src);
      newAudio.volume = 0.8;
      newAudio.preload = "auto";
      return newAudio;
    }
    
    const audioUrl = new URL(`../assets/singlechord/${chord}.mp3`, import.meta.url).href;
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.volume = 0.8;
    
    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(chord, audio);
        // Create a new instance for use
        const newAudio = new Audio(audio.src);
        newAudio.volume = 0.8;
        newAudio.preload = "auto";
        resolve(newAudio);
      });
      audio.addEventListener('error', reject);
      audio.load();
    });
  }
    /**
   * Stop all playing audio and clear timeouts
   */
  stopAll() {
    // Clear any existing timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    if (this.fadeOutTimeout) {
      clearTimeout(this.fadeOutTimeout);
      this.fadeOutTimeout = null;
    }    
    // Clear all intervals
    this.fadeIntervals.forEach(intervalId => clearInterval(intervalId));
    this.fadeIntervals = [];

    if (this.volumeEnvelopeInterval) {
      clearInterval(this.volumeEnvelopeInterval);
      this.volumeEnvelopeInterval = null;
    }
    
    // Stop currently playing audio
    if (this.currentPlayingAudio) {
      this.currentPlayingAudio.pause();
      this.currentPlayingAudio.currentTime = 0;
      this.currentPlayingAudio = null;
    }
    
    // Stop previous audio
    if (this.previousAudio) {
      this.previousAudio.pause();
      this.previousAudio.currentTime = 0;
      this.previousAudio = null;
    }
    
    // Stop all cached audios
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
    /**
   * Fade out and stop audio
   * @param {HTMLAudioElement} audio - Audio element to stop
   * @param {number} duration - Fade duration in ms
   */
  fadeOutAndStop(audio, duration = this.fadeDuration) {
    if (!audio) return;
    
    if (!audio || typeof audio.volume === 'undefined') {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }
    
    const originalVolume = audio.volume;
    const fadeSteps = 5; 
    const fadeInterval = duration / fadeSteps;    
    let currentStep = 0;
    
    // Stop all existing intervals
    this.fadeIntervals = this.fadeIntervals.filter(id => {
      clearInterval(id);
      return false;
    });
    
    const fadeOutInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= fadeSteps || !audio) {
        clearInterval(fadeOutInterval);
        
        const index = this.fadeIntervals.indexOf(fadeOutInterval);
        if (index !== -1) this.fadeIntervals.splice(index, 1);
        
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      } else {
        try {
          // Use exponential fadeout for natural sound
          const ratio = Math.pow(1 - (currentStep / fadeSteps), 2);
          audio.volume = Math.max(0, originalVolume * ratio);
        } catch (error) {
          console.error('Error setting audio volume:', error);
          clearInterval(fadeOutInterval);
        }
      }
    }, fadeInterval);
    
    // Store interval ID
    this.fadeIntervals.push(fadeOutInterval);
  }
  /**
   * Apply ADSR envelope to audio
   * @param {HTMLAudioElement} audio - Audio element to apply envelope to
   * @param {number} durationMs - Total chord duration in ms
   */  applyVolumeEnvelope(audio, durationMs) {
    if (!audio) return;
    
    // Clear previous interval
    if (this.volumeEnvelopeInterval) {
      clearInterval(this.volumeEnvelopeInterval);
      this.volumeEnvelopeInterval = null;
    }
    
    const maxVolume = 0.8;
    
    // Calculate time for each phase (ms)
    const attackTime = durationMs * this.volumeEnvelope.attack;
    const decayTime = durationMs * this.volumeEnvelope.decay;
    const sustainLevel = this.volumeEnvelope.sustain * maxVolume;
    const releaseTime = durationMs * this.volumeEnvelope.release;
    
    // Start time for each phase
    const decayStart = attackTime;
    const sustainStart = attackTime + decayTime;
    const releaseStart = durationMs - releaseTime;
    
    const updateInterval = Math.min(30, durationMs / 50); // 30ms = smooth updates, /50 = 2% of duration max
    let startTime = Date.now();
    
    audio.volume = 0;
    
    this.volumeEnvelopeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= durationMs) {
        clearInterval(this.volumeEnvelopeInterval);
        this.volumeEnvelopeInterval = null;
        return;
      }
      
      try {        // Apply ADSR envelope phases
        if (elapsed < attackTime) {
          // Attack: fade in from silence to peak volume
          const ratio = elapsed / attackTime;
          audio.volume = maxVolume * ratio;
        } 
        else if (elapsed < sustainStart) {
          // Decay: reduce from peak to sustain level
          const ratio = (elapsed - decayStart) / decayTime;
          audio.volume = maxVolume - (ratio * (maxVolume - sustainLevel));
        } 
        else if (elapsed < releaseStart) {
          // Sustain: hold constant volume
          audio.volume = sustainLevel;
        } 
        else {
          // Release: fade out to silence
          const ratio = (elapsed - releaseStart) / releaseTime;
          audio.volume = sustainLevel * (1 - ratio);
        }
      } catch (error) {
        console.error('Error setting volume in envelope:', error);
        clearInterval(this.volumeEnvelopeInterval);
        this.volumeEnvelopeInterval = null;
      }
    }, updateInterval);
  }
    /**
   * Play a single chord
   * @param {string} chord - Chord name
   * @returns {Promise<void>}
   */
  async playSingleChord(chord) {
    const audio = await this.preloadAudio(chord);
    
    if (this.currentPlayingAudio) {
      this.fadeOutAndStop(this.currentPlayingAudio);
    }
    
    this.currentPlayingAudio = audio;
    audio.currentTime = 0;
    audio.volume = 0;    
    const playPromise = audio.play();
    
    // Use volume envelope instead of simple fade in
    this.applyVolumeEnvelope(audio, 2000); // 2 seconds for single chord playback
    
    return playPromise;
  }
  
  /**
   * Improved calculation of bar and chord positions for visualization
   * @param {number} sequenceIndex - Current index in the sequence
   * @param {number|Array<number>} beatsPerChord - Beats per chord settings
   * @returns {Object} - Contains barIndex and chordIndex
   */
  calculatePositionIndices(sequenceIndex, beatsPerChord) {
    // Handle custom beats calculation for visualization
    if (Array.isArray(beatsPerChord)) {
      let barIndex = 0;
      let beatCounter = 0;
      let chordsInCurrentBar = 0;
      
      // Calculate each bar's content
      for (let i = 0; i <= sequenceIndex; i++) {
        // If we've reached our target index, return current position
        if (i === sequenceIndex) {
          return {
            barIndex: barIndex,
            chordIndex: chordsInCurrentBar
          };
        }
        
        // Add beats for this chord
        const chordBeats = beatsPerChord[i] || 2;
        beatCounter += chordBeats;
        chordsInCurrentBar++;
        
        // Every 4 beats is a new bar (standard 4/4 time)
        if (beatCounter >= 4) {
          barIndex++;
          beatCounter = beatCounter % 4;
          chordsInCurrentBar = 0;
        }
      }
      
      // Fallback - shouldn't reach here
      return {
        barIndex: barIndex,
        chordIndex: chordsInCurrentBar
      };
    } else {
      // Standard uniform beats calculation
      const chordsPerBar = Math.round(4 / beatsPerChord); // Assuming 4/4 time
      return {
        barIndex: Math.floor(sequenceIndex / chordsPerBar),
        chordIndex: sequenceIndex % chordsPerBar
      };
    }
  }
  
  /**
   * Plays a sequence of chords at the specified tempo without overlapping sounds
   * @param {Array<string>} chords - Array of chord names to play
   * @param {number} tempo - The tempo in BPM
   * @param {number|Array<number>} beatsPerChord - Number of beats per chord or array of beats for each chord
   * @param {Function} onChordChange - Callback for when chord changes, receives indices
   * @param {Function} onComplete - Callback for when playback completes
   * @returns {Function} - A function to stop playback
   */  async playChordSequence(chords, tempo, beatsPerChord, onChordChange, onComplete) {
    this.stopAll();
    
    // Adjust envelope based on tempo
    if (tempo > 150) {
      // Fast tempo: quicker attack, shorter release
      this.volumeEnvelope.attack = 0.005;
      this.volumeEnvelope.decay = 0.02;
      this.volumeEnvelope.sustain = 0.7;
      this.volumeEnvelope.release = 0.2;
    } else if (tempo > 100) {
      // Medium tempo
      this.volumeEnvelope.attack = 0.01;
      this.volumeEnvelope.decay = 0.05;
      this.volumeEnvelope.sustain = 0.8;
      this.volumeEnvelope.release = 0.25;
    } else {
      // Slow tempo: smoother attack, longer release
      this.volumeEnvelope.attack = 0.02;
      this.volumeEnvelope.decay = 0.08;
      this.volumeEnvelope.sustain = 0.85;
      this.volumeEnvelope.release = 0.3;
    }
    
    // Preload all chords
    await this.preloadAllChords(chords);
    
    try {
      let sequenceIndex = 0;
      const msPerBeat = 60000 / tempo;
      let isPlaying = true;
        const playNextChord = async () => {
        if (sequenceIndex < chords.length && isPlaying) {
          // Get chord information
          const currentChord = chords[sequenceIndex];
          
          // Calculate chord duration
          const currentBeats = Array.isArray(beatsPerChord) ? 
            (beatsPerChord[sequenceIndex] || 2) : beatsPerChord;
          const msPerChord = msPerBeat * currentBeats;
          
          // Calculate position for visualization
          const { barIndex, chordIndex } = this.calculatePositionIndices(sequenceIndex, beatsPerChord);
          
          // Notify callback when chord changes
          onChordChange(barIndex, chordIndex);
          
          // Stop previous audio
          if (this.currentPlayingAudio) {
            if (this.previousAudio) {
              this.previousAudio.pause();
              this.previousAudio.currentTime = 0;
              this.previousAudio = null;
            }
            
            this.previousAudio = this.currentPlayingAudio;
            this.fadeOutAndStop(this.previousAudio, 100);
          }
          
          // Prepare audio
          const audio = await this.preloadAudio(currentChord);
          
          // Set audio properties
          this.currentPlayingAudio = audio;
          audio.currentTime = 0;
          audio.volume = 0;
          
          // Play audio
          try {
            await audio.play();
          } catch (error) {
            console.error('Audio play failed:', error);
          }
            // Adjust volume with envelope
          // Reduce time slightly to create gap between chords
          const adjustedDuration = msPerChord * 0.95; // 5% gap for natural separation
          this.applyVolumeEnvelope(audio, adjustedDuration);
          
          // Move to next chord
          sequenceIndex++;
          
          if (sequenceIndex < chords.length && isPlaying) {
            // Schedule next chord playback
            this.currentTimeout = setTimeout(playNextChord, msPerChord);
          } else {
            // Playback complete
            const finalBeats = Array.isArray(beatsPerChord) ? 
              (beatsPerChord[sequenceIndex - 1] || 2) : beatsPerChord;
            const finalMsPerChord = msPerBeat * finalBeats;
            
            // Set timeout for playback completion
            this.currentTimeout = setTimeout(() => {
              isPlaying = false;
              this.stopAll();
              
              // Call onComplete
              onComplete();
              this.currentTimeout = null;
              this.currentPlayingAudio = null;
              this.previousAudio = null;
            }, finalMsPerChord * 0.8);
          }
        }
      };      
      // Start playing first chord
      playNextChord();
      
      // Return stop function
      return () => {
        isPlaying = false;
        this.stopAll();
      };
    } catch (error) {
      console.error('Failed to play chord sequence:', error);
      onComplete();
      return () => {};
    }
  }
    /**
   * Set global volume for all audio playback
   * @param {number} volume - Volume level (0.0-1.0)
   */
  setGlobalVolume(volume) {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    // Apply to current playing audio
    if (this.currentPlayingAudio) {
      this.currentPlayingAudio.volume = this.globalVolume * 0.8;
    }
  }  
  // Melody Audio Playback Methods
  
  /**
   * Convert melody note to audio file path
   * @param {string} pitch - The note pitch (C, D, E, F, G, A, B)
   * @param {number|string} octave - The octave number (2, 3, 4, 5, 6)
   * @param {string} instrument - The instrument (piano/guitar)
   * @returns {string} - Path to the audio file
   */
  getMelodyNoteAudioPath(pitch, octave, instrument) {
    // Convert to format expected by file naming: C4, D5, etc.
    const noteFileName = `${pitch}${octave}.mp3`;
    return new URL(`../assets/melodynote/${instrument}/${noteFileName}`, import.meta.url).href;
  }
    /**
   * Preload melody note audio files for all notes and instrument
   * @param {Array<string>} notes - Array of note pitches
   * @param {Array<number>} octaves - Array of octaves corresponding to notes
   * @param {string} instrument - The instrument (piano/guitar)
   * @returns {Promise<void>}
   */
  async preloadMelodyNotes(notes, octaves, instrument) {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    
    try {
      // Get unique notes to avoid duplicate loading
      const uniqueNotes = [];
      const seenNotes = new Set();
      
      notes.forEach((note, index) => {
        const octave = octaves[index] || 4;
        const noteKey = `${note}${octave}`;
        if (!seenNotes.has(noteKey)) {
          seenNotes.add(noteKey);
          uniqueNotes.push({ pitch: note, octave: octave });
        }
      });
      
      // Preload all unique notes for the selected instrument
      await Promise.allSettled(
        uniqueNotes.map(noteObj => this.preloadMelodyNoteAudio(noteObj.pitch, noteObj.octave, instrument))
      );
    } catch (error) {
      console.warn('Some melody notes failed to preload:', error);
    } finally {
      this.isPreloading = false;
    }
  }
  
  /**
   * Preload a single melody note audio file
   * @param {string} pitch - The note pitch (C, D, E, F, G, A, B)
   * @param {number|string} octave - The octave number (2, 3, 4, 5, 6)
   * @param {string} instrument - The instrument (piano/guitar)
   * @returns {Promise<HTMLAudioElement>} - A promise resolving to the audio element
   */
  async preloadMelodyNoteAudio(pitch, octave, instrument) {
    const noteKey = `${pitch}${octave}_${instrument}`;
    
    if (this.audioCache.has(noteKey)) {
      // Create a new instance for concurrent playback
      const cachedAudio = this.audioCache.get(noteKey);
      const newAudio = new Audio(cachedAudio.src);
      newAudio.volume = 0.8;
      newAudio.preload = "auto";
      return newAudio;
    }
    
    const audioPath = this.getMelodyNoteAudioPath(pitch, octave, instrument);
    const audio = new Audio(audioPath);
    audio.preload = "auto";
    audio.volume = 0.8;
      return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(noteKey, audio);
        // Create a new instance for use
        const newAudio = new Audio(audio.src);
        newAudio.volume = this.globalVolume * 0.8; // Apply global volume
        newAudio.preload = "auto";
        resolve(newAudio);
      });
      audio.addEventListener('error', (error) => {
        console.warn(`Failed to load melody note: ${noteKey}`, error);
        reject(new Error(`Failed to load melody note: ${noteKey}`));
      });
      audio.load();
    });
  }
  
  /**
   * Play a single melody note
   * @param {string} pitch - The note pitch (C, D, E, F, G, A, B)
   * @param {number|string} octave - The octave number (2, 3, 4, 5, 6)
   * @param {string} instrument - The instrument (piano/guitar)
   * @returns {Promise<void>} - Promise that resolves when note starts playing
   */
  async playSingleMelodyNote(pitch, octave, instrument) {
    try {
      const audio = await this.preloadMelodyNoteAudio(pitch, octave, instrument);
      
      // Stop current audio if playing
      if (this.currentPlayingAudio) {
        this.fadeOutAndStop(this.currentPlayingAudio);
      }
      
      this.currentPlayingAudio = audio;
      audio.currentTime = 0;
      audio.volume = 0;
      
      const playPromise = audio.play();
      
      // Apply volume envelope for natural sound
      this.applyVolumeEnvelope(audio, 1500); // 1.5 seconds for single note
      
      return playPromise;
    } catch (error) {
      console.error(`Failed to play melody note ${pitch}${octave} on ${instrument}:`, error);
    }
  }
  
  /**
   * Play a sequence of melody notes
   * @param {Array<Object>} notes - Array of note objects {pitch, octave}
   * @param {Object} settings - Settings object {tempo, numberOfBars, noteDuration}
   * @param {string} instrument - The instrument (piano/guitar)
   * @param {Function} onNoteChange - Callback when note changes, receives (noteIndex, note)
   * @param {Function} onComplete - Callback when playback completes
   * @returns {Function} - A function to stop playback
   */  async playMelodySequence(notes, settings, instrument, onNoteChange, onComplete) {
    this.stopAll();
    
    // Adjust volume envelope based on tempo and note duration
    this.adjustVolumeEnvelopeForMelody(settings.tempo, settings.noteDuration);
    
    // Preload all melody notes for the selected instrument - extract arrays from note objects
    const pitches = notes.map(note => note.pitch);
    const octaves = notes.map(note => note.octave);
    await this.preloadMelodyNotes(pitches, octaves, instrument);
    
    try {
      let noteIndex = 0;
      const msPerBeat = 60000 / settings.tempo;
      const msPerNote = msPerBeat * settings.noteDuration;
      let isPlaying = true;
        // Check if user wants to use exact notes or fill bars
      const useExactNotes = notes.length < 4; // Simple heuristic: few notes = use exactly
      
      let totalNotesToPlay;
      if (useExactNotes) {
        totalNotesToPlay = notes.length;
      } else {
        // Calculate total notes needed to fill the specified number of bars
        const notesPerBar = 4 / settings.noteDuration; // 4/4 time signature
        totalNotesToPlay = settings.numberOfBars * notesPerBar;
      }
      
      const playNextNote = async () => {
        if (noteIndex < totalNotesToPlay && isPlaying) {
          // Get current note (cycle through melody pattern if needed)
          const currentNoteIndex = noteIndex % notes.length;
          const currentNote = notes[currentNoteIndex];
          
          // Notify callback about note change
          onNoteChange(noteIndex, currentNote);
          
          // Stop previous audio
          if (this.currentPlayingAudio) {
            if (this.previousAudio) {
              this.previousAudio.pause();
              this.previousAudio.currentTime = 0;
              this.previousAudio = null;
            }
            
            this.previousAudio = this.currentPlayingAudio;
            this.fadeOutAndStop(this.previousAudio, 50); // Quick fade for melody
          }
          
          // Play current note
          try {
            const audio = await this.preloadMelodyNoteAudio(
              currentNote.pitch, 
              currentNote.octave, 
              instrument
            );
            
            this.currentPlayingAudio = audio;
            audio.currentTime = 0;
            audio.volume = 0;
            
            await audio.play();
            
            // Apply volume envelope adjusted for note duration
            const noteDurationMs = msPerNote * 0.9; // Slight gap between notes
            this.applyVolumeEnvelope(audio, noteDurationMs);
            
          } catch (error) {
            console.error('Failed to play melody note:', error);
          }
          
          noteIndex++;
          
          if (noteIndex < totalNotesToPlay && isPlaying) {
            // Schedule next note
            this.currentTimeout = setTimeout(playNextNote, msPerNote);
          } else {
            // Playback complete
            this.currentTimeout = setTimeout(() => {
              isPlaying = false;
              this.stopAll();
              onComplete();
              this.currentTimeout = null;
              this.currentPlayingAudio = null;
              this.previousAudio = null;
            }, msPerNote * 0.8);
          }
        }
      };
      
      // Start playing first note
      playNextNote();
      
      // Return stop function
      return () => {
        isPlaying = false;
        this.stopAll();
      };
      
    } catch (error) {
      console.error('Failed to play melody sequence:', error);
      onComplete();
      return () => {};
    }
  }
  
  /**
   * Adjust volume envelope settings for melody playback
   * @param {number} tempo - The tempo in BPM
   * @param {number} noteDuration - Duration of each note (in beats)
   */  adjustVolumeEnvelopeForMelody(tempo, noteDuration) {
    // Faster tempo or shorter notes = quicker envelope
    if (tempo > 150 || noteDuration <= 0.125) {
      // Fast tempo or short notes: quick attack/release for crisp articulation
      this.volumeEnvelope.attack = 0.005;
      this.volumeEnvelope.decay = 0.01;
      this.volumeEnvelope.sustain = 0.75;
      this.volumeEnvelope.release = 0.15;
    } else if (tempo > 100 || noteDuration <= 0.25) {
      // Medium tempo: balanced envelope for natural sound
      this.volumeEnvelope.attack = 0.01;
      this.volumeEnvelope.decay = 0.03;
      this.volumeEnvelope.sustain = 0.8;
      this.volumeEnvelope.release = 0.2;
    } else {
      // Slow tempo or long notes: gentle envelope for smooth transitions
      this.volumeEnvelope.attack = 0.02;
      this.volumeEnvelope.decay = 0.05;
      this.volumeEnvelope.sustain = 0.85;
      this.volumeEnvelope.release = 0.25;
    }
  }
}
