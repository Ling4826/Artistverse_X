<template>
    <div class="keyboard">
      <div 
        v-for="(key, index) in keys" 
        :key="index" 
        :class="{ 'key-white': key.type === 'white', 'key-black': key.type === 'black', 'active': key.active }"
        @mousedown="playSound(key.note)"
        @touchstart="playSound(key.note)"
        @mouseup="stopSound(key.note)"
        @touchend="stopSound(key.note)"
      >
        {{ key.note }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        keys: [
          { note: 'C', type: 'white', active: false },
          { note: 'C#', type: 'black', active: false },
          { note: 'D', type: 'white', active: false },
          { note: 'D#', type: 'black', active: false },
          { note: 'E', type: 'white', active: false },
          { note: 'F', type: 'white', active: false },
          { note: 'F#', type: 'black', active: false },
          { note: 'G', type: 'white', active: false },
          { note: 'G#', type: 'black', active: false },
          { note: 'A', type: 'white', active: false },
          { note: 'A#', type: 'black', active: false },
          { note: 'B', type: 'white', active: false }
        ]
      };
    },
    methods: {
      playSound(note) {
        // Add code here to play sound for the given note
        console.log('Playing note:', note);
        // Example: You can use the Web Audio API to play sound
      },
      stopSound(note) {
        // Add code here to stop sound for the given note
        console.log('Stopping note:', note);
        // Example: You can use the Web Audio API to stop sound
      }
    }
  };
  </script>
  
  <style scoped>
  .keyboard {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 200px;
  }
  
  .key-white {
    width: 60px;
    height: 150px;
    background-color: white;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  
  .key-black {
    width: 40px;
    height: 100px;
    background-color: black;
    position: relative;
    z-index: 1;
    margin-left: -20px;
  }
  
  .active {
    background-color: yellow;
  }
  </style>
  