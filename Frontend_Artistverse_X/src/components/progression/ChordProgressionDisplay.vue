<script>
export default {
  props: {
    selectedKey: String,
    selectedProgression: String,
    chordBarsDisplay: Array,
    isPlaying: Boolean,
    playingBarIndex: Number,
    playingChordInBarIndex: Number,
    playingSingleChord: Boolean,
    beatsPerChord: Number,
    isGeneratingMidi: Boolean
  },
  computed: {
    // Group bars into pairs (2 bars per row)
    barPairs() {
      const pairs = [];
      for (let i = 0; i < this.chordBarsDisplay.length; i += 2) {
        const pair = [this.chordBarsDisplay[i]];
        if (i + 1 < this.chordBarsDisplay.length) {
          pair.push(this.chordBarsDisplay[i + 1]);
        }
        pairs.push(pair);
      }
      return pairs;
    }
  },
  methods: {
    getChordImage(chord) {
      return new URL(`../../assets/guitarchord/${chord}.png`, import.meta.url).href;
    },
    playChord(chord, barIndex, chordIndex) {
      if (!this.isPlaying && !this.playingSingleChord) {
        this.$emit('play-chord', chord, barIndex, chordIndex);
      }
    },
    isChordPlaying(barIndex, chordIndex) {
      return this.playingBarIndex === barIndex && this.playingChordInBarIndex === chordIndex;
    },
    togglePlay() {
      this.$emit('toggle-play');
    },
    generateMidi() {
      this.$emit('generate-midi');
    }
  }
}
</script>

<template>
  <div v-if="chordBarsDisplay.length > 0" class="chords-display">
    <h2 class="head2">
      Selected Chord Progression:
      <span style="color: yellow; font-weight: bold">{{ selectedProgression }}</span> in Key
      <span style="color: yellow; font-weight: bold">{{ selectedKey }}</span>
    </h2>

    <div class="bars-display-section">
      <h3 class="bars-title">
        Chord Progression in {{ chordBarsDisplay.length }} Bars
      </h3>
      
      <!-- Display bars in pairs (2 bars per row) -->
      <div class="bars-container">
        <div v-for="(pair, pairIndex) in barPairs" :key="pairIndex" class="bar-pair">
          <div 
            v-for="(bar, indexInPair) in pair" 
            :key="`bar-${bar.barNumber}`" 
            class="bar-item"
          >
            <div class="bar-header">Bar {{ bar.barNumber }}</div>
            <div class="bar-content">
              <div 
                v-for="(chordData, chordIndex) in bar.chords" 
                :key="`chord-${chordIndex}`" 
                class="chord-beat"
              >
                <div class="chord-display">
                  <div class="chord-name">{{ chordData.chord }}</div>
                  <img 
                    :src="getChordImage(chordData.chord)" 
                    :alt="chordData.chord + ' chord diagram'"
                    :class="{ 
                      'chord-diagram': true, 
                      'chord-playing': isChordPlaying(bar.barNumber-1, chordIndex),
                      'clickable': !isPlaying && !playingSingleChord
                    }"
                    @click="playChord(chordData.chord, bar.barNumber-1, chordIndex)"
                  />
                </div>
                <div class="beat-indicators">
                  <span v-for="beat in chordData.beats" :key="beat" class="beat-dot"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sound-button-container">
      <div class="button-group">
        <button 
          class="sound" 
          :disabled="playingSingleChord" 
          @click="togglePlay"
        >
        </button>
        <p class="sound-text">{{ isPlaying ? 'Stop' : 'Play Progression' }}</p>
      </div>
      
      <div class="button-group">
        <button 
          class="midi-download" 
          :disabled="isGeneratingMidi || isPlaying"
          @click="generateMidi"
        >
        </button>
        <p class="sound-text">{{ isGeneratingMidi ? 'Generating...' : 'Download MIDI' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chords-display {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.head2 {
  font-family: 'Avalors Personal Use';
  font-size: 30px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  position: relative;
  text-align: center;
}

.bars-display-section {
  margin: 30px auto;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 10px;
  width: 95%;
  max-width: 1000px;
}

.bars-title {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Avalors Personal Use';
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.bar-pair {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.bar-item {
  background-color: #444;
  border-radius: 8px;
  padding: 15px;
  border: 2px solid #666;
  flex: 1;
  max-width: calc(50% - 10px);
}

.bar-header {
  color: #ff8c00;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid #666;
  padding-bottom: 8px;
}

.bar-content {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  gap: 10px;
}

.chord-beat {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chord-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.chord-name {
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}

.chord-diagram {
  width: 140px;
  height: 160px;
  object-fit: contain;
  border-radius: 5px;
  border: 2px solid #666;
  background-color: #fff;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  padding: 4px;
}

.chord-diagram:hover {
  transform: scale(1.1);
  border-color: #ff8c00;
}

.chord-diagram.clickable {
  cursor: pointer;
}

.chord-diagram.clickable:hover {
  transform: scale(1.15);
  border-color: #ff8c00;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
}

.chord-diagram.chord-playing {
  transform: scale(1.2);
  border-color: #ff4500;
  box-shadow: 0 0 20px 5px #ff4500;
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1.25);
  }
}

.beat-indicators {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: 5px;
}

.beat-dot {
  width: 8px;
  height: 8px;
  background-color: #ff8c00;
  border-radius: 50%;
  display: inline-block;
}

.sound-button-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 30px auto;
  gap: 40px;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.sound {
  padding: 5px;
  border-radius: 100%;
  box-shadow: 0px 0px 10px 5px #e9eaeb73;
  background-color: #151b22;
  color: white;
  font-size: 17px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  position: relative;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
}

.sound::before {
  content: 'fac';
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNzUycHQiIGhlaWdodD0iNzUycHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1MiA3NTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8cGF0aCBkPSJtNTQ4Ljg2IDM4Mi4xNmMwIDM1LjUyLTMuMzE2NCA3MC4wOS05LjQ3MjcgMTAzLjI0LTAuOTQ1MzEgNC43MzQ0LTQuNzM0NCA3LjU3ODEtOS40NzI3IDcuNTc4MWgtMS44OTQ1Yy01LjIxMDktMC45NDUzMS04LjUyMzQtNi4xNTYyLTcuNTc4MS0xMC44OTEgNi4xNTYyLTMyLjIwMyA5LjQ3MjctNjUuODI4IDkuNDcyNy05OS45MjZzLTMuMzE2NC02OC42NjgtOS40NzI3LTEwMi43N2MtMC45NDUzMS01LjIxMDkgMi4zNjcyLTkuOTQ1MyA3LjU3ODEtMTAuODkxIDUuMjEwOS0wLjk0NTMxIDkuOTQ1MyAyLjM2NzIgMTAuODkxIDcuNTc4MSA2LjYzMjggMzUuMDM5IDkuOTQ5MiA3MC41NTkgOS45NDkyIDEwNi4wN3ptLTE0NC45Mi0xMzguNzZjMTAuODkxIDQ1LjkzOCAxNi41NzQgOTIuMzQ4IDE2LjU3NCAxMzguMjkgMCA0NS40NjUtNS4yMTA5IDg5Ljk4LTE2LjEwMiAxMzIuMTMtMC45NDUzMSAzLjMxNjQtMi4zNjcyIDYuMTU2Mi00LjI2MTcgOC41MjM0LTMuNzg5MSA1LjIxMDktOS40NzI3IDguMDUwOC0xNS42MjkgOC45OTYxaC0yLjgzOThjLTUuMjEwOSAwLTEwLjQxOC0xLjg5NDUtMTQuMjA3LTQuNzM0NGwtNzIuOTMtNTUuNDA2Yy0wLjk0NTMxLTAuNDcyNjYtMS44OTQ1LTAuOTQ1MzEtMi44Mzk4LTAuOTQ1MzFoLTUyLjA5NGMtOC41MjM0IDAtMTYuMTAyLTQuNzM0NC0yMC4zNjMtMTEuODQtMTIuMzEyLTIwLjgzNi0xOC40NjktNDYuODgzLTE4LjQ2OS03Ni4yNDYgMC0yOS44MzYgNi4xNTYyLTU3LjMwNSAxOC40NjktODEuOTMgMy43ODkxLTguMDUwOCAxMi4zMTItMTMuMjYyIDIxLjMxMi0xMy4yNjJoNTEuNjIxYzAuOTQ1MzEgMCAxLjg5NDUtMC40NzI2NiAyLjgzOTgtMC45NDUzMWw3MS41MDgtNTUuODg3YzIuODM5OC0xLjg5NDUgNS42ODM2LTMuMzE2NCA4Ljk5NjEtNC4yNjE3IDYuMTU2Mi0xLjQyMTkgMTIuMzEyLTAuNDcyNjYgMTcuOTk2IDIuODM5OCA1LjIxMDkgMy4zMTY0IDkgOC41MjczIDEwLjQxOCAxNC42ODR6bS0yLjgzOTggMTM4Ljc2YzAtNDQuNTE2LTUuMjEwOS04OS41MDgtMTUuNjI5LTEzNC4wMi0wLjQ3MjY2LTEuODk0NS0xLjQyMTktMi4zNjcyLTEuODk0NS0yLjgzOTgtMC40NzI2Ni0wLjQ3MjY2LTEuODk0NS0wLjk0NTMxLTMuNzg5MS0wLjQ3MjY2LTAuNDcyNjYgMC0xLjQyMTkgMC40NzI2Ni0xLjg5NDUgMC45NDUzMWwtNzEuNTA4IDU0LjkzOGMtNC4yNjE3IDMuMzE2NC05LjQ3MjcgNC43MzQ0LTE0LjY4IDQuNzM0NGgtNTEuMTQ4Yy0xLjg5NDUgMC0zLjMxNjQgMC45NDUzMS00LjI2MTcgMi44Mzk4LTEwLjg5MSAyMi4yNTgtMTYuNTc0IDQ2Ljg4My0xNi41NzQgNzMuODc5IDAgMjYuMDQ3IDUuMjEwOSA0OC43NzcgMTUuNjI5IDY2Ljc3MyAwLjk0NTMxIDEuNDIxOSAyLjM2NzIgMi4zNjcyIDQuMjYxNyAyLjM2NzJoNTIuMDk0YzUuMjEwOSAwIDEwLjQxOCAxLjg5NDUgMTQuNjggNC43MzQ0bDcxLjk4NCA1NS44ODNjMS40MjE5IDAuOTQ1MzEgMi44Mzk4IDAuOTQ1MzEgMy4zMTY0IDAuOTQ1MzEgMC45NDUzMSAwIDEuODk0NS0wLjQ3MjY2IDMuMzE2NC0xLjg5NDUgMC4wNzI2Ni0wLjQ3MjY2IDAuNDcyNjYtMC45NDUzMSAwLjk0NTMxLTEuODk0NSA5Ljk0MTQtNDAuMjQ2IDE1LjE1Mi04My4zNDQgMTUuMTUyLTEyNi45MXptODIuODc1LTc5LjA4NmMtNS4yMTA5IDAuNDcyNjYtOC45OTYxIDUuMjEwOS04LjA1MDggMTAuNDE4IDIuODM5OCAyMi43MyA0LjI2MTcgNDUuOTM4IDQuMjYxNyA2OC42NjhzLTEuNDIxOSA0NS40NjUtNC4yNjE3IDY3LjI1Yy0wLjQ3MjY2IDUuMjEwOSAyLjgzOTggOS45NDUzIDguMDUwOCAxMC40MThoMS40MjE5YzQuNzM0NCAwIDguOTk2MS0zLjMxNjQgOS40NzI3LTguNTIzNCAyLjgzOTgtMjIuNzMgNC4yNjE3LTQ1LjkzOCA0LjI2MTctNjkuNjE3IDAtMjMuNjgtMS40MjE5LTQ3LjM1OS00LjI2MTctNzAuNTYyLTAuOTQ5MjItNS4yMTA5LTUuNjgzNi05LTEwLjg5NS04LjA1MDh6IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=');
  background-size: 60%;
  background-position: center;
  background-repeat: no-repeat;
  color: transparent;
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
}

.sound:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0px 0px 15px 10px #ebdf70;
  background-color: #ebdf70;
}

.sound:active:not(:disabled) {
  border-radius: 100%;
  box-shadow: inset 0px 0px 10px 0px rgb(240, 237, 237);
}

.sound:hover:not(:disabled)::before {
  background-size: 65%;
  transition: background-size 0.3s ease;
}

.sound:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sound-text {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  text-align: center;
}

.midi-download {
  padding: 5px;
  border-radius: 100%;
  box-shadow: 0px 0px 10px 5px #e9eaeb73;
  background-color: #151b22;
  color: white;
  font-size: 17px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  position: relative;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
}

.midi-download::before {
  content: '';
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDNMMjAgN1YxN0wxMiAyMUw0IDE3VjdMMTIgM1oiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xMiAxMlYyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTE3IDE0LjVMMTIgMTIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik07IDE0LjVMMTIgMTIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMCA3TDEyIDEyTDQgN0wxMiAyTDIwIDdaIiBmaWxsPSIjNzBkNGViIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=');
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
  color: transparent;
  position: relative;
  width: 100%;
  height: 100%;
  display: block;
}

.midi-download:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0px 0px 15px 10px #70d4eb;
  background-color: #70d4eb;
}

.midi-download:active:not(:disabled) {
  border-radius: 100%;
  box-shadow: inset 0px 0px 10px 0px rgb(240, 237, 237);
}

.midi-download:hover:not(:disabled)::before {
  background-size: 75%;
  transition: background-size 0.3s ease;
}

.midi-download:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
