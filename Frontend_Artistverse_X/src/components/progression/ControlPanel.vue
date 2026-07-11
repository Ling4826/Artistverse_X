<script>
export default {
  props: {
    selectedBars: {
      type: Number,
      default: 4
    },
    tempo: {
      type: Number,
      default: 120
    },
    beatsPerChord: {
      type: Number,
      default: 2
    }
  },
  emits: ['update:selectedBars', 'update:tempo', 'open-custom-modal'],
  methods: {
    updateSelectedBars(value) {
      let newValue = parseInt(value);
      if (newValue < 1) newValue = 1;
      if (newValue > 32) newValue = 32;
      this.$emit('update:selectedBars', newValue);
    },
    updateTempo(value) {
      this.$emit('update:tempo', parseInt(value));
    },
    openCustomModal() {
      this.$emit('open-custom-modal');
    }
  },
  computed: {
    msPerChord() {
      return Math.round((60000 / this.tempo) * this.beatsPerChord);
    },
    chordsPerBar() {
      return Math.round(4 / this.beatsPerChord);
    },
    isFastTempo() {
      return this.msPerChord < 1000;
    }
  }
}
</script>

<template>
  <div class="controls-section animate__animated animate__fadeInUp animate__delay-1s">
    <div class="control-group">
      <h3>Number of bars (1-32)</h3>
      <input
        type="number"
        :value="selectedBars"
        @input="updateSelectedBars($event.target.value)"
        min="1"
        max="32"
        class="bars-input"
      />
      <p class="selection-text">You selected {{ selectedBars }} bars</p>
    </div>

    <div class="control-group">
      <h3>Set Tempo (BPM)</h3>
      <h4>40-240</h4>
      <div class="tempo-container">
        <input
          type="range"
          :value="tempo"
          @input="updateTempo($event.target.value)"
          min="40"
          max="240"
          step="1"
          class="tempo-slider"
        />
        <p class="tempo-text">Tempo: {{ tempo }} BPM</p>
      </div>
    </div>

    <div class="control-group">
      <button class="custom-button" @click="openCustomModal">Custom chord and Beat</button>
    </div>
  </div>
</template>

<style scoped>
.controls-section {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 40px auto;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 10px;
  width: 90%;
  max-width: 900px;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-group h3 {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: bold;
}

.control-group h4 {
  color: #ccc;
  font-size: 14px;
  margin: 0;
}

.bars-input {
  padding: 8px 15px;
  background-color: #444;
  color: #fff;
  border: 2px solid #666;
  border-radius: 5px;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.bars-input:focus {
  outline: none;
  border-color: #ff8c00;
}

.selection-text {
  color: #ccc;
  font-size: 12px;
  margin: 0;
}

.tempo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tempo-slider {
  width: 200px;
  height: 6px;
  background: #444;
  outline: none;
  border-radius: 5px;
  cursor: pointer;
}

.tempo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ff8c00;
  border-radius: 50%;
  cursor: pointer;
}

.tempo-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #ff8c00;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.tempo-text {
  color: #fff;
  font-size: 14px;
  margin: 0;
}

.tempo-info {
  color: #aaa;
  font-size: 12px;
  margin: 0;
  font-style: italic;
}

.tempo-detail {
  color: #ccc;
  font-size: 11px;
  margin: 0;
  font-weight: bold;
}

.tempo-note {
  color: #ff6b6b;
  font-size: 10px;
  margin: 0;
  font-style: italic;
}

.custom-button {
  padding: 12px 25px;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-button:hover {
  background-color: #ff8c00;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 140, 0, 0.3);
}

@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    gap: 20px;
    width: 95%;
    padding: 15px;
  }
}
</style>
