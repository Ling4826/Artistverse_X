<template>
    <div class="body">
      <div class="content">
        <h1
          class="text-4xl md:text-5xl mt-8 animate__animated animate__fadeInDown"
          style="animation-duration: 2s"
        >
          Chord Progression
        </h1>
      </div>
      <div
        class="box1 animate__animated animate__fadeIn animate__delay-1s"
        style="animation-duration: 2s"
      >
        <div id="app">
          <h1 class="title">Chord Progression Generator</h1>
          <div class="form-group">
            <label for="key">Key:</label>
            <select id="key" v-model="selectedKey" class="select">
              <option v-for="key in keys" :value="key">{{ key }}</option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="progression">Progression:</label>
            <select id="progression" v-model="selectedProgression" class="select">
              <option v-for="(progression, index) in progressions" :value="index">
                {{ progression.name }}
              </option>
            </select>
          </div>
          <button @click="generateProgression" class="button">Generate Progression</button>
  
          <div v-if="loading" class="loader-container">
            <div class="loader">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </div>
          </div>
  
          <div v-if="progression.length > 0 && !loading" class="progression-container">
            <h2 class="subtitle">Chord Progression:</h2>
            <ul class="chord-list">
              <li v-for="(chord, index) in progression" :key="index" class="chord-item">{{ chord }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="radiobtn" style="color: white">
              <router-link to="/guitarchord">
                <button
                  style="
                    background-color: white;
                    color: black;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 5px;
                  "
                >
                  Guitar
                </button>
              </router-link>
              <router-link to="/pianochord">
                <button
                  style="background-color: white; color: black; border-radius: 5px; padding: 20px"
                >
                  Piano
                </button>
              </router-link>
              <router-link to="/chordprogression">
                <button
                  style="
                    background-color: grey;
                    color: white;
                    border-radius: 5px;
                    padding: 20px;
                    margin: 5px;
                  "
                >
                  Chord Progression
                </button>
              </router-link>
            </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        keys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        selectedKey: 'C',
        selectedType: 'major',
        progressions: [
          { name: '2-5-1-6', value: '2516' },
          { name: '1-6-2-5', value: '1625' },
          { name: '1-5-6-4', value: '1564' },
          { name: '1-6-4-5', value: '1645' },
          { name: '1-4-5-1', value: '1451' },
          { name: '1-4-6-5', value: '1465' },
          { name: '6-4-3-2', value: '6432' }
        ],
        selectedProgression: 0,
        progression: [],
        loading: false
      };
    },
    methods: {
      generateProgression() {
        this.loading = true;
        setTimeout(() => {
          this.progression = this.generateChordProgression(
            this.selectedKey,
            this.selectedType,
            this.progressions[this.selectedProgression].value
          );
          this.loading = false;
        }, 2000);
      },
      generateChordProgression(key, type, progression) {
        const chordMap = {
          major: {
            C: {
              2516: ['Dm', 'G', 'C', 'Am'],
              1625: ['C', 'Am', 'Dm', 'G'],
              1564: ['C', 'G', 'Am', 'F'],
              1645: ['C', 'F', 'G', 'Am'],
              1451: ['C', 'G', 'Am', 'Em'],
              1465: ['C', 'G', 'Am', 'F'],
              1626: ['C', 'Am', 'Dm', 'Bdim'],
              6432: ['F', 'G', 'Am', 'Em']
            },
            D: {
              2516: ['Em', 'A', 'D', 'Bm'],
              1625: ['D', 'Bm', 'Em', 'A'],
              1564: ['D', 'A', 'Bm', 'G'],
              1645: ['D', 'G', 'A', 'Bm'],
              1451: ['D', 'A', 'Bm', 'F#m'],
              1465: ['D', 'A', 'Bm', 'G'],
              1626: ['D', 'Bm', 'Em', 'C#dim'],
              6432: ['G', 'A', 'Bm', 'F#m']
            },
            E: {
              2516: ['F#m', 'B', 'E', 'C#m'],
              1625: ['E', 'C#m', 'F#m', 'B'],
              1564: ['E', 'B', 'C#m', 'A'],
              1645: ['E', 'A', 'B', 'C#m'],
              1451: ['E', 'B', 'C#m', 'G#m'],
              1465: ['E', 'B', 'C#m', 'A'],
              1626: ['E', 'C#m', 'F#m', 'D#dim'],
              6432: ['A', 'B', 'C#m', 'G#m']
            },
            F: {
              2516: ['Gm', 'C', 'F', 'Dm'],
              1625: ['F', 'Dm', 'Gm', 'C'],
              1564: ['F', 'C', 'Dm', 'Bb'],
              1645: ['F', 'Bb', 'C', 'Dm'],
              1451: ['F', 'C', 'Dm', 'Am'],
              1465: ['F', 'C', 'Dm', 'Bb'],
              1626: ['F', 'Dm', 'Gm', 'Edim'],
              6432: ['Bb', 'C', 'Dm', 'Am']
            },
            G: {
              2516: ['Am', 'D', 'G', 'Em'],
              1625: ['G', 'Em', 'Am', 'D'],
              1564: ['G', 'D', 'Em', 'C'],
              1645: ['G', 'C', 'D', 'Em'],
              1451: ['G', 'D', 'Em', 'Bm'],
              1465: ['G', 'D', 'Em', 'C'],
              1626: ['G', 'Em', 'Am', 'F#dim'],
              6432: ['C', 'D', 'Em', 'Bm']
            },
            A: {
              2516: ['Bm', 'E', 'A', 'F#m'],
              1625: ['A', 'F#m', 'Bm', 'E'],
              1564: ['A', 'E', 'F#m', 'D'],
              1645: ['A', 'D', 'E', 'F#m'],
              1451: ['A', 'E', 'F#m', 'C#m'],
              1465: ['A', 'E', 'F#m', 'D'],
              1626: ['A', 'F#m', 'Bm', 'G#dim'],
              6432: ['D', 'E', 'F#m', 'C#m']
            },
            B: {
              2516: ['C#m', 'F#', 'B', 'G#m'],
              1625: ['B', 'G#m', 'C#m', 'F#'],
              1564: ['B', 'F#', 'G#m', 'E'],
              1645: ['B', 'E', 'F#', 'G#m'],
              1451: ['B', 'F#', 'G#m', 'D#m'],
              1465: ['B', 'F#', 'G#m', 'E'],
              1626: ['B', 'G#m', 'C#m', 'A#dim'],
              6432: ['E', 'F#', 'G#m', 'D#m']
            }
          }
        };
        return chordMap[type][key][progression] || [];
      }
    }
  };
  </script>
  
  <style scoped>
  .radiobtn {
    position: absolute;
    bottom: 26px;
    left:35px;
    font-family: 'ICA Rubrik';

  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .body {
    text-align: center;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #1b1b1b;
  }
  h1 {
    font-family: 'Avalors Personal Use';
    font-size: 40px;
    letter-spacing: 5px;
    color: #ffffff;
    text-shadow: 0 0 4px white;
    position: relative;
    padding-top: 50px;
    padding-bottom: 50px;
  }
  .container {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .box1 {
    width: 100%;
    max-width: 600px;
    margin: auto;
    padding: 20px;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 20px;
    background-color: #ffffff;
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  }
  .title {
    font-size: 24px;
    color: #333;
  }
  .form-group {
    margin-bottom: 20px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    color: #666;
  }
  .select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  .button {
    cursor: pointer;
    font-size: large;
    font-family: inherit;
    font-weight: bold;
    color: #0011ff;
    background-color: #f8f8fd;
    padding: 0.8em 2.2em;
    border-radius: 50em;
    border: 6px solid #8b93f8;
    box-shadow: 0px 8px #1f35ff;
  }
  .button:active {
    position: relative;
    top: 8px;
    border: 6px solid #646fff;
    box-shadow: 0px 0px;
  }
  .progression-container {
    margin-top: 20px;
  }
  .subtitle {
    font-size: 20px;
    margin-bottom: 10px;
    color: #333;
  }
  .chord-list {
    list-style-type: none;
    padding: 0;
  }
  .chord-item {
    display: inline-block;
    padding: 5px 10px;
    margin: 5px;
    background-color: #007bff;
    color: #fff;
    border-radius: 5px;
  }
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  .loader {
    display: flex;
    align-items: center;
  }
  .bar {
    display: inline-block;
    width: 3px;
    height: 20px;
    background-color: rgba(33, 33, 33, 0.5);
    border-radius: 10px;
    animation: scale-up4 1s linear infinite;
  }
  .bar:nth-child(2) {
    height: 35px;
    margin: 0 5px;
    animation-delay: .25s;
  }
  .bar:nth-child(3) {
    animation-delay: .5s;
  }
  @keyframes scale-up4 {
    20% {
      background-color: #434242;
      transform: scaleY(1.5);
    }
    40% {
      transform: scaleY(1);
    }
  }
  </style>
  