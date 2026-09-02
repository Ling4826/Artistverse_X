<template>
  <div class="background">

    <div class="layout">
      <h1
        class="text-4xl md:text-5xl mt-8 animate__animated animate__fadeInDown animate__delay-1s"
        style="animation-duration: 2s"
      >
        Lyrics Generator by "Genre"
      </h1>
      <div
        class="nav mt-5 animate__animated animate__fadeInDown animate__delay-1s"
        style="animation-duration: 2s"
      >
        <router-link to="/generate-lyrics-genre">
          <button class="btn-23 mr-2 md:mr-4">
            <span class="text">Genre</span>
            <span aria-hidden="" class="marquee">Genre</span>
          </button>
        </router-link>
        <router-link to="/generate-lyrics-mood">
          <button class="btn-23 mr-2 md:mr-4">
            <span class="text">Mood</span>
            <span aria-hidden="" class="marquee">Mood</span>
          </button>
        </router-link>
        <router-link to="/generate-lyrics-artist">
          <button class="btn-23">
            <span class="text">Artist</span>
            <span aria-hidden="" class="marquee">Artist</span>
          </button>
        </router-link>
      </div>
    </div>
    <div class="container1 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mt-5 md:mt-4">
      <div
        class="box1 animate__animated animate__fadeIn animate__delay-2s"
        style="animation-duration: 2s"
      >
        <h1 class="header text-4xl mb-3" >Lyrics Generator</h1>
        <div class="form-control mb-5">
          <input
            v-model="prompt"
            class="input input-alt"
            placeholder="Your Lyrics Topic"
            required=""
            type="text"
          />
          <span class="input-border input-border-alt"></span>
        </div>
        <div v-if="errors.prompt" class="error-message">{{ errors.prompt }}</div>
        <div class="dropdown mt-10">
          <h2 class="text-xl">Genre:</h2>
          <select v-model="genre" class="ml-5 mr-5">
            <option value="">Select a genre</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Indie">Indie</option>
            <option value="Jazz">Jazz</option>
            <option value="Country">Country</option>
            <option value="R&B">R&B</option>
            <option value="Hip-Hop">Hip-Hop</option>
            <option value="Folk">Folk</option>
            <option value="Electronic jazz">Electronic jazz</option>
            <option value="Blues reggae">Blues reggae</option>
            <option value="Classical">Classical</option>
            <option value="Alternative">Alternative</option>
            <option value="Gospel">Gospel</option>
            <option value="Punk">Punk</option>
            <option value="Rap">Rap</option>
          </select>
          <div v-if="errors.genre" class="error-message">{{ errors.genre }}</div>
          <h2 class="text-xl">Language:</h2>
          <select v-model="language" class="ml-5">
            <option value="">Select a language</option>
            <option value="Thai">Thai</option>
            <option value="English">English</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
          </select>
          <div v-if="errors.language" class="error-message">{{ errors.language }}</div>
        </div>
        <button class="btn" type="button" @click="generateLyrics">
          <strong>Generate</strong>
          <div id="container-stars">
            <div id="stars"></div>
          </div>
          <div id="glow">
            <div class="circle"></div>
            <div class="circle"></div>
          </div>
        </button>
      </div>
      <div
        class="box2 mb-5 animate__animated animate__fadeIn animate__delay-2s"
        style="animation-duration: 2s"
      >
        <!-- <h1 v-if="text" class="text-left" >Result</h1> -->
         
        <div v-if="loading" class="loader"></div>        <div v-else>
          <pre v-if="lyrics" class="lyrics-container animate__animated animate__fadeIn">{{
            lyrics
          }}</pre>
          <EditAndSaveLyricsButton :lyrics="lyrics" filename="GenreLyrics.txt" @regenerate="generateLyrics" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import EditAndSaveLyricsButton from '@/components/EditAndSaveLyricsButton.vue';

export default {
  components: {
    EditAndSaveLyricsButton
  },
  data() {
    return {
      prompt: '',
      genre: '',
      language: '',
      lyrics: '',
      loading: false,
      text: true,
      errors: {}
    }
  },
// Lifecycle hook
  mounted() {
    const edited = localStorage.getItem('lyrics_after_edit');
    if (edited) {
      this.lyrics = edited;
      localStorage.removeItem('lyrics_after_edit');
    }
  },
  
  methods: {
    validateForm() {
      this.errors = {};

      if (!this.prompt) {
        this.errors.prompt = "Please input a lyric topic.";
      }
      if (!this.genre) {
        this.errors.genre = "Please select a genre.";
      }
      if (!this.language) {
        this.errors.language = "Please select a language.";
      }

      return Object.keys(this.errors).length === 0;
    },
    async generateLyrics() {
      if (!this.validateForm()) {
        return;
      }

      try {
        this.loading = true
        const response = await fetch('/api/generate-lyrics-genre', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: this.prompt, genre: this.genre, language: this.language })
        })

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json()
        this.lyrics = data.lyrics
      } catch (error) {
        console.error('Error:', error)
        if (error.message === 'Failed to fetch') {
          Swal.fire({
            icon: "error",
            title: "Internet no connection",
            text: "Unable to compose lyrics",
            customClass: {
              popup: 'swal2-top-center',
            },
            position: 'top',
          });
        }      } finally {
        this.loading = false;
        this.text = false;
      }
    }
  }
}
</script>

<style scoped>
.error-message {
  color: red;
  font-size: 0.9em;
  position: relative;
}   
.btn-save{
  font-weight: 600;
  color:rgb(0, 0, 0);
  background-color: white;
  position: relative;
  padding: 3px;
  padding-left: 30px;
  padding-right: 30px;
  border-radius: 5px;

}
.lyrics-container {
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
}
.loader {
  width: 8px;
  height: 40px;
  border-radius: 4px;
  display: block;
  background-color: currentColor;
  margin: 20px auto;
  position: relative;
  color: #f2f2f2;
  animation: animloader 0.3s 0.3s linear infinite alternate;
}

.loader::after,
.loader::before {
  content: '';
  width: 8px;
  height: 40px;
  border-radius: 4px;
  background: currentColor;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
  animation: animloader 0.3s 0.45s linear infinite alternate;
}

.loader::before {
  left: -20px;
  animation-delay: 0s;
}

@keyframes animloader {
  0% {
    height: 48px;
  }

  100% {
    height: 4px;
  }
}
.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  overflow: hidden;
  height: 3rem;
  background-size: 300% 300%;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
  animation: gradient_301 5s ease infinite;
  border: double 4px transparent;
  background-image: linear-gradient(#212121, #212121),
    linear-gradient(137.48deg, #171717 10%, #0b0b0b 45%, #040404 67%, #1f1f20 87%);
  background-origin: border-box;
  background-clip: content-box, border-box;
  position: relative;
  top: 80px;
}

#container-stars {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: 0.5s;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
}

strong {
  z-index: 2;
  font-family: 'Avalors Personal Use';
  font-size: 16px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
}

#glow {
  position: absolute;
  display: flex;
  width: 12rem;
}

.circle {
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse_3011 4s infinite;
  z-index: -1;
}

.circle:nth-of-type(1) {
  background: rgba(254, 83, 186, 0.636);
}

.circle:nth-of-type(2) {
  background: rgba(142, 81, 234, 0.704);
}

.btn:hover #container-stars {
  z-index: 1;
  background-color: #212121;
}

.btn:hover {
  transform: scale(1);
}

.btn:active {
  background-origin: border-box;
  background-clip: content-box, border-box;
  animation: none;
}

.btn:active .circle {
  background: #040404;
}

#stars {
  position: relative;
  background: transparent;
  width: 200rem;
  height: 200rem;
}

#stars::after {
  content: '';
  position: absolute;
  top: -10rem;
  left: -100rem;
  width: 100%;
  height: 100%;
  animation: animStarRotate 90s linear infinite;
}

#stars::after {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
}

#stars::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 170%;
  height: 500%;
  animation: animStar 60s linear infinite;
}

#stars::before {
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
  opacity: 0.5;
}

@keyframes animStar {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-135rem);
  }
}

@keyframes animStarRotate {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0);
  }
}

@keyframes gradient_301 {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
.background {
  min-height: 100vh;
  background-color: #1b1b1b;
  padding-left: 30px;
  padding-right: 30px;
}
.dropdown {
  display: flex;
  justify-content: center;
}

select {
  position: relative;
  width: 100%;
  max-width: 200px;
  margin-bottom: 15px;
}

select {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  appearance: none;
}

select::after {
  content: '\25BC';
  font-size: 1.2em;
  color: #000;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  position: absolute;
  pointer-events: none;
}

.input {
  color: #000000;
  font-size: 0.9rem;
  background-color: transparent;
  width: 100%;
  height: 30%;
  box-sizing: border-box;
  padding-inline: 0.5em;
  padding-block: 0.7em;
  border: none;
  border-bottom: var(--border-height) solid var(--border-before-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-border {
  position: absolute;
  background: var(--border-after-color);
  width: 0%;
  height: 2px;
  bottom: 0;
  left: 0;
  transition: width 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.alert-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
}
.input:focus {
  outline: none;
}

.input:focus + .input-border {
  width: 100%;
}

.form-control {
  position: relative;
  --width-of-input: 300px;
}

.input-alt {
  font-size: 1.2rem;
  padding-inline: 1em;
  padding-block: 0.8em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.input-border-alt {
  height: 3px;
  background: linear-gradient(90deg, #ff6464 0%, #ffbf59 50%, #47c9ff 100%);
  transition: width 0.4s cubic-bezier(0.42, 0, 0.58, 1);
}

.input-alt:focus + .input-border-alt {
  width: 100%;
}
.header {
  color: #000;
}

.layout {
  padding: 20px;
  text-align: center;
}

.box1 {
  width: 100%;
  height: 400px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 20px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.box2 {
  width: 100%;
  height: 400px;
  padding: 20px;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 20px;
  background-color: rgb(6, 6, 6);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  color: white;
}

h1 {
  z-index: 2;
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
}

.btn-23,
.btn-23 *,
.btn-23 :after,
.btn-23 :before,
.btn-23:after,
.btn-23:before {
  border: 0 solid;
  box-sizing: border-box;
}

.btn-23 {
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: button;
  background-color: #000;
  background-image: none;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  font-family: 'Avalors Personal Use';
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 4px white;
  font-size: 100%;
  font-weight: 900;
  line-height: 1.5;
  margin: 0;
  -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
  padding: 0;
  text-transform: uppercase;
}

.btn-23:disabled {
  cursor: default;
}

.btn-23:-moz-focusring {
  outline: auto;
}

.btn-23 svg {
  display: block;
  vertical-align: middle;
}

.btn-23 [hidden] {
  display: none;
}

.btn-23 {
  border-radius: 20px;
  border-width: 2px;
  overflow: hidden;
  padding: 2rem 3rem;
  margin: 10px;
  position: relative;
}

.btn-23 span {
  display: grid;
  inset: 0;
  place-items: center;
  position: absolute;
  transition: opacity 0.2s ease;
}

.btn-23 .marquee {
  --spacing: 5em;
  --start: 0em;
  --end: 5em;
  -webkit-animation: marquee 1s linear infinite;
  animation: marquee 1s linear infinite;
  -webkit-animation-play-state: paused;
  animation-play-state: paused;
  opacity: 0;
  position: relative;
  text-shadow:
    #fff var(--spacing) 0,
    #fff calc(var(--spacing) * -1) 0,
    #fff calc(var(--spacing) * -2) 0;
}

.btn-23:hover .marquee {
  -webkit-animation-play-state: running;
  animation-play-state: running;
  opacity: 1;
}

.btn-23:hover .text {
  opacity: 0;
}

.btn-23:hover {
  background-color: rgb(20, 20, 20);
}

@-webkit-keyframes marquee {
  0% {
    transform: translateX(var(--start));
  }

  to {
    transform: translateX(var(--end));
  }
}

@keyframes marquee {
  0% {
    transform: translateX(var(--start));
  }

  to {
    transform: translateX(var(--end));
  }
}

@media (max-width: 768px) {
  .btn-23 {
    padding: 1.5rem 2rem;
    font-size: 90%;
  }
}

@media (max-width: 640px) {
  .btn-23 {
    padding: 1rem 1.5rem;
    font-size: 80%;
  }
}

@media (max-width: 500px) {
  .btn-23 {
    font-size: 90%;
  }
  .h1 {
    margin-top: 20px;
  }
  .btn {
    position: relative;
    top: 70px;
  }
}
</style>
