<script>
export default {
  props: {
    notes: Array,
    keyChords: Object,
    progressions: Array,
    selectedKey: String,
    selectedProgression: String,
    highlightedChords: Array
  },
  methods: {
    selectProgression(progression, key) {
      this.$emit('select-progression', progression, key);
    },
    isChordHighlighted(key, chordIndex) {
      if (this.selectedKey !== key) {
        return false;
      }
      return this.highlightedChords.includes(chordIndex + 1);
    },
    isProgressionActive(progression) {
      return this.selectedProgression === progression;
    },
    playChord(chord) {
      this.$emit('play-chord', chord);
    }
  }
}
</script>

<template>
  <div>
    <h2 class="animate__animated animate__fadeInDown animate__delay-1s">
      Major Keys Chord Table
    </h2>
    <table class="animate__animated animate__fadeInUp animate__delay-1s">
      <thead>
        <tr>
          <th>Key</th>
          <th>Progression</th>
          <th v-for="(num, index) in 7" :key="index">{{ index + 1 }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="key in Object.keys(keyChords)" :key="key">
          <td :class="{ highlighted: key === selectedKey }">{{ key }}</td>
          <td>
            <div class="progression-buttons">
              <button
                v-for="(progression, index) in progressions"
                :key="index"
                :class="{ 'active-progression': isProgressionActive(progression) && key === selectedKey }"
                @click="selectProgression(progression, key)"
              >
                {{ progression }}
              </button>
            </div>
          </td>
          <td
            v-for="(chord, chordIndex) in keyChords[key]"
            :key="chord"
            :class="{ highlighted: isChordHighlighted(key, chordIndex), clickable: true }"
            @click="playChord(chord)"
          >
            {{ chord }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
h2 {
  padding-top: 3%;
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  position: relative;
}

table {
  border-collapse: collapse;
  margin-top: 20px;
  color: #fff;
}

th,
td {
  border: 2px solid #fff;
  padding: 10px;
  text-align: center;
}

th {
  background-color: #ef6b6b;
  color: black;
}

tr:nth-child(even) {
  background-color: #2c2c2c;
}

.highlighted {
  background-color: rgb(244, 244, 115);
  color: #000;
  border-radius: 20%;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.progression-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.progression-buttons button {
  padding: 5px 10px;
  background-color: #444;
  color: #fff;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.progression-buttons button:hover {
  background-color: #666;
}

.active-progression {
  background-color: #ff8c00;
  color: #000;
  font-weight: bold;
  border: 2px solid #ff4500;
  transform: scale(1.1);
  box-shadow: 0 0 10px #ff4500;
}
</style>
