/**
 * Service for generating MIDI files from chord progressions and melodies
 */
export default class MidiService {
  /**
   * Convert a chord name to MIDI note numbers
   * @param {string} chordName - The chord name (e.g., "C", "Dm")
   * @returns {Array<number>} - Array of MIDI note numbers
   */
  chordToMidiNotes(chordName) {
    // Define chord formulas (root + intervals in semitones)
    const chordFormulas = {
      // Major chords
      'C': [60, 64, 67],     // C E G
      'D': [62, 66, 69],     // D F# A
      'E': [64, 68, 71],     // E G# B
      'F': [65, 69, 72],     // F A C
      'G': [67, 71, 74],     // G B D
      'A': [69, 73, 76],     // A C# E
      'B': [71, 75, 78],     // B D# F#
      
      // Minor chords
      'Dm': [62, 65, 69],    // D F A
      'Em': [64, 67, 71],    // E G B
      'Gm': [67, 70, 74],    // G Bb D
      'Am': [69, 72, 76],    // A C E
      'Bm': [71, 74, 78],    // B D F#
      'Dbm': [61, 64, 68],   // C# E G#
      'Ebm': [63, 66, 70],   // Eb Gb Bb
      'Gbm': [66, 69, 73],   // F# A C#
      'Abm': [68, 71, 75],   // Ab B Eb
      
      // Diminished chords
      'Bdim': [71, 74, 77],  // B D F
      'C#dim': [61, 64, 67], // C# E G
      'D#dim': [63, 66, 69], // D# F# A
      'Edim': [64, 67, 70],  // E G Bb
      'F#dim': [66, 69, 72], // F# A C
      'G#dim': [68, 71, 74], // G# B D
      'A#dim': [70, 73, 76], // A# C# E
      
      // Additional chords
      'Bb': [70, 74, 77],    // Bb D F
      'Gb': [66, 70, 73],    // Gb Bb Db
    };
    
    return chordFormulas[chordName] || [60, 64, 67]; // Default to C major
  }
  
  /**
   * Create MIDI file data from a chord progression
   * @param {Array<string>} chords - Array of chord names
   * @param {number} tempo - BPM
   * @param {number} beatsPerChord - Number of beats per chord
   * @returns {Uint8Array} - Binary MIDI file data
   */
  generateMidiFile(chords, tempo, beatsPerChord) {
    // Create MIDI data structure
    const midiData = this.createMidiData(chords, tempo, beatsPerChord);
    
    // Convert to MIDI file format
    return this.createMidiFileFromData(midiData);
  }
  
  /**
   * Create a structured data representation of the MIDI file
   * @param {Array<string>} chords - Array of chord names
   * @param {number} tempo - BPM
   * @param {number} beatsPerChord - Number of beats per chord
   * @returns {Object} - Structured MIDI data
   */
  createMidiData(chords, tempo, beatsPerChord) {
    const ticksPerQuarter = 480;
    const ticksPerChord = ticksPerQuarter * beatsPerChord;
    
    // Create MIDI events
    const events = [];
    let currentTick = 0;
    
    // Add tempo event
    const microsecondsPerQuarter = Math.round(60000000 / tempo);
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'setTempo',
      microsecondsPerQuarter: microsecondsPerQuarter
    });
    
    // Add time signature event
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'timeSignature',
      numerator: 4,
      denominator: 4,
      metronome: 24,
      thirtyseconds: 8
    });
    
    // Add chord events
    chords.forEach((chord, index) => {
      const midiNotes = this.chordToMidiNotes(chord);
      const chordStartTick = index * ticksPerChord;
      const chordEndTick = (index + 1) * ticksPerChord;
      
      // Note on events
      midiNotes.forEach((note, noteIndex) => {
        events.push({
          deltaTime: noteIndex === 0 ? (chordStartTick - currentTick) : 0,
          type: 'channel',
          subtype: 'noteOn',
          channel: 0,
          noteNumber: note,
          velocity: 80
        });
        if (noteIndex === 0) currentTick = chordStartTick;
      });
      
      // Note off events
      midiNotes.forEach((note, noteIndex) => {
        events.push({
          deltaTime: noteIndex === 0 ? (chordEndTick - currentTick) : 0,
          type: 'channel',
          subtype: 'noteOff',
          channel: 0,
          noteNumber: note,
          velocity: 0
        });
        if (noteIndex === 0) currentTick = chordEndTick;
      });
    });
    
    // Add end of track
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'endOfTrack'
    });
    
    return {
      ticksPerQuarter: ticksPerQuarter,
      events: events
    };
  }
  
  /**
   * Create MIDI file data from a chord progression with custom beats per chord
   * @param {Array<string>} chords - Array of chord names
   * @param {number} tempo - BPM
   * @param {Array<number>} beatsPerChord - Array of beats for each chord
   * @returns {Uint8Array} - Binary MIDI file data
   */
  generateMidiFileWithCustomBeats(chords, tempo, beatsPerChord) {
    // Create MIDI data structure with custom beats
    const midiData = this.createMidiDataWithCustomBeats(chords, tempo, beatsPerChord);
    
    // Convert to MIDI file format
    return this.createMidiFileFromData(midiData);
  }
  
  /**
   * Create a structured data representation of the MIDI file with custom beats
   * @param {Array<string>} chords - Array of chord names
   * @param {number} tempo - BPM
   * @param {Array<number>} beatsPerChord - Array of beats for each chord
   * @returns {Object} - Structured MIDI data
   */
  createMidiDataWithCustomBeats(chords, tempo, beatsPerChord) {
    const ticksPerQuarter = 480;
    
    // Create MIDI events
    const events = [];
    let currentTick = 0;
    
    // Add tempo event
    const microsecondsPerQuarter = Math.round(60000000 / tempo);
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'setTempo',
      microsecondsPerQuarter: microsecondsPerQuarter
    });
    
    // Add time signature event
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'timeSignature',
      numerator: 4,
      denominator: 4,
      metronome: 24,
      thirtyseconds: 8
    });
    
    // Add chord events with individual beat lengths
    chords.forEach((chord, index) => {
      const beats = beatsPerChord[index] || 2; // Default to 2 beats if not specified
      const ticksForThisChord = ticksPerQuarter * beats;
      const midiNotes = this.chordToMidiNotes(chord);
      
      // Note on events
      midiNotes.forEach((note, noteIndex) => {
        events.push({
          deltaTime: noteIndex === 0 ? 0 : 0,
          type: 'channel',
          subtype: 'noteOn',
          channel: 0,
          noteNumber: note,
          velocity: 80
        });
      });
      
      // Note off events - set after the specified number of beats
      midiNotes.forEach((note, noteIndex) => {
        events.push({
          deltaTime: noteIndex === 0 ? ticksForThisChord : 0, // Only add delta time for first note
          type: 'channel',
          subtype: 'noteOff',
          channel: 0,
          noteNumber: note,
          velocity: 0
        });
      });
      
      currentTick += ticksForThisChord;
    });
    
    // Add end of track
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'endOfTrack'
    });
    
    return {
      ticksPerQuarter: ticksPerQuarter,
      events: events
    };
  }
  
  /**
   * Create a binary MIDI file from structured data
   * @param {Object} midiData - Structured MIDI data
   * @returns {Uint8Array} - Binary MIDI file data
   */
  createMidiFileFromData(midiData) {
    // Simple MIDI file creation (Type 0, single track)
    const header = new Uint8Array([
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length
      0x00, 0x00,             // Type 0
      0x00, 0x01,             // 1 track
      0x01, 0xE0              // Ticks per quarter note (480)
    ]);
    
    // Convert events to MIDI track data
    const trackData = this.eventsToMidiTrackData(midiData.events);
    
    // Create track header
    const trackHeader = new Uint8Array([
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      ...this.numberToBytes(trackData.length, 4) // Track length
    ]);
    
    // Combine all parts
    const midiFile = new Uint8Array(header.length + trackHeader.length + trackData.length);
    midiFile.set(header, 0);
    midiFile.set(trackHeader, header.length);
    midiFile.set(trackData, header.length + trackHeader.length);
    
    return midiFile;
  }
  
  /**
   * Convert MIDI events to binary track data
   * @param {Array<Object>} events - MIDI events
   * @returns {Uint8Array} - Binary track data
   */
  eventsToMidiTrackData(events) {
    const trackBytes = [];
    
    events.forEach(event => {
      // Add delta time
      trackBytes.push(...this.numberToVariableLength(event.deltaTime));
      
      if (event.type === 'meta') {
        trackBytes.push(0xFF, this.getMetaTypeNumber(event.subtype));
        
        if (event.subtype === 'setTempo') {
          trackBytes.push(0x03); // Length
          trackBytes.push(...this.numberToBytes(event.microsecondsPerQuarter, 3));
        } else if (event.subtype === 'timeSignature') {
          trackBytes.push(0x04); // Length
          trackBytes.push(event.numerator, Math.log2(event.denominator), event.metronome, event.thirtyseconds);
        } else if (event.subtype === 'endOfTrack') {
          trackBytes.push(0x00); // Length
        }
      } else if (event.type === 'channel') {
        const statusByte = (event.subtype === 'noteOn' ? 0x90 : 0x80) | event.channel;
        trackBytes.push(statusByte, event.noteNumber, event.velocity);
      }
    });
    
    return new Uint8Array(trackBytes);
  }
  
  /**
   * Get the MIDI meta event type number
   * @param {string} subtype - Meta event subtype
   * @returns {number} - Type number
   */
  getMetaTypeNumber(subtype) {
    const metaTypes = {
      'setTempo': 0x51,
      'timeSignature': 0x58,
      'endOfTrack': 0x2F
    };
    return metaTypes[subtype] || 0x00;
  }
  
  /**
   * Convert a number to variable-length format
   * @param {number} value - Number to convert
   * @returns {Array<number>} - Array of bytes
   */
  numberToVariableLength(value) {
    const bytes = [];
    bytes.unshift(value & 0x7F);
    value >>= 7;
    
    while (value > 0) {
      bytes.unshift((value & 0x7F) | 0x80);
      value >>= 7;
    }
    
    return bytes;
  }
  
  /**
   * Convert a number to a fixed number of bytes
   * @param {number} value - Number to convert
   * @param {number} byteCount - Number of bytes to generate
   * @returns {Array<number>} - Array of bytes
   */
  numberToBytes(value, byteCount) {
    const bytes = [];
    for (let i = byteCount - 1; i >= 0; i--) {
      bytes.push((value >> (i * 8)) & 0xFF);
    }
    return bytes;
  }
  
  /**
   * Download a MIDI file
   * @param {Uint8Array} midiFile - Binary MIDI file data
   * @param {string} key - The key of the progression
   * @param {string} progression - The chord progression
   * @param {number} tempo - BPM
   */
  downloadMidiFile(midiFile, key, progression, tempo) {
    const blob = new Blob([midiFile], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chord-progression-${key}-${progression}-${tempo}bpm.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }  
  // Melody MIDI Generation Methods
  
  /**
   * Convert a melody note (pitch + octave) to MIDI note number
   * @param {string} pitch - The note pitch (C, D, E, F, G, A, B)
   * @param {number|string} octave - The octave number (2, 3, 4, 5, 6)
   * @returns {number} - MIDI note number (0-127)
   */
  noteToMidiNumber(pitch, octave) {
    const noteNumbers = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    const noteNumber = noteNumbers[pitch];
    if (noteNumber === undefined) {
      console.warn(`Unknown pitch: ${pitch}, defaulting to C`);
      return 60; // Default to Middle C
    }
    
    const octaveNum = parseInt(octave);
    if (octaveNum < 0 || octaveNum > 10) {
      console.warn(`Invalid octave: ${octave}, defaulting to 4`);
      return 60; // Default to Middle C
    }
      // MIDI note calculation: (octave + 1) * 12 + noteNumber
    // +1 because MIDI octave -1 = notes 0-11, octave 0 = notes 12-23, etc.
    return (octaveNum + 1) * 12 + noteNumber;
  }
  
  /**
   * Generate MIDI file from melody notes
   * @param {Array<Object>} notes - Array of note objects {pitch, octave}
   * @param {Object} settings - Settings object {tempo, numberOfBars, noteDuration}
   * @returns {Uint8Array} - Binary MIDI file data
   */
  generateMelodyMidiFile(notes, settings) {
    const midiData = this.createMelodyMidiData(notes, settings);
    return this.createMidiFileFromData(midiData);
  }
  
  /**
   * Create structured MIDI data from melody notes
   * @param {Array<Object>} notes - Array of note objects {pitch, octave}
   * @param {Object} settings - Settings object {tempo, numberOfBars, noteDuration}
   * @returns {Object} - Structured MIDI data
   */
  createMelodyMidiData(notes, settings) {
    const ticksPerQuarter = 480;
    const ticksPerNote = ticksPerQuarter * settings.noteDuration;
    const events = [];
    let currentTick = 0;
      // Add tempo event
    const microsecondsPerQuarter = Math.round(60000000 / settings.tempo);
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'setTempo',
      microsecondsPerQuarter: microsecondsPerQuarter
    });
    
    // Add time signature event
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'timeSignature',
      numerator: 4,
      denominator: 4,
      metronome: 24,
      thirtyseconds: 8
    });    // Determine melody generation strategy
    const useExactNotes = notes.length < 4; // Simple heuristic: few notes = use exactly
    
    let totalNotesToGenerate;
    if (useExactNotes) {
      totalNotesToGenerate = notes.length;
    } else {
      // Calculate notes needed to fill target bars
      const notesPerBar = 4 / settings.noteDuration; // 4/4 time signature
      totalNotesToGenerate = settings.numberOfBars * notesPerBar;
    }// Generate melody events
    for (let i = 0; i < totalNotesToGenerate; i++) {
      const noteIndex = i % notes.length; // Cycle through the melody pattern
      const note = notes[noteIndex];
      const midiNoteNumber = this.noteToMidiNumber(note.pitch, note.octave);
      
      const noteStartTick = i * ticksPerNote;
      const noteEndTick = (i + 1) * ticksPerNote;
      
      // Note on event
      events.push({
        deltaTime: noteStartTick - currentTick,
        type: 'channel',
        subtype: 'noteOn',
        channel: 0,
        noteNumber: midiNoteNumber,
        velocity: 80
      });
      currentTick = noteStartTick;
      
      // Note off event
      events.push({
        deltaTime: noteEndTick - currentTick,
        type: 'channel',
        subtype: 'noteOff',
        channel: 0,
        noteNumber: midiNoteNumber,
        velocity: 0
      });
      currentTick = noteEndTick;
    }
    
    // Add end of track
    events.push({
      deltaTime: 0,
      type: 'meta',
      subtype: 'endOfTrack'
    });
    
    return {
      ticksPerQuarter: ticksPerQuarter,
      events: events
    };
  }
  /**
   * Download melody MIDI file
   * @param {Uint8Array} midiFile - Binary MIDI file data
   * @param {string} instrument - Selected instrument (piano/guitar)
   * @param {number} tempo - BPM
   * @param {number} numberOfBars - Number of bars
   */
  downloadMelodyMidiFile(midiFile, instrument, tempo, numberOfBars) {
    const blob = new Blob([midiFile], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `melody-${instrument}-${tempo}bpm-${numberOfBars}bars-${timestamp}.mid`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
