<template>
  <div class="background">
    <h1 class="title">Emotion Music Recommender</h1>
    <div class="emotion-detector-container">
      <div class="emotion-detector">
        <h2 class="subtitle">Emotion Detector</h2>
        <div class="video-container">
          <video ref="videoElement" autoplay playsinline v-show="hasCameraPermission" class="video-feed"></video>
          <canvas ref="canvasElement" style="display: none;"></canvas>
          <div v-show="!hasCameraPermission" class="permission-message">
            <p style="color: red;">*Camera access is required to detect your mood. Please allow camera access.</p>
            <p style="color: red;">If you are allow already you can just reload this page</p>
          </div>
        </div>
        <div v-if="hasCameraPermission" class="container1">
          <button @click="startCountdown" :disabled="countingDown" class="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              viewBox="0 0 24 24"
              height="24"
              fill="none"
              class="svg-icon"
            >
              <g
                stroke-width="2"
                stroke-linecap="round"
                stroke="#fff"
                fill-rule="evenodd"
                clip-rule="evenodd"
              >
                <path
                  d="m4 9c0-1.10457.89543-2 2-2h2l.44721-.89443c.33879-.67757 1.03131-1.10557 1.78889-1.10557h3.5278c.7576 0 1.4501.428 1.7889 1.10557l.4472.89443h2c1.1046 0 2 .89543 2 2v8c0 1.1046-.8954 2-2 2h-12c-1.10457 0-2-.8954-2-2z"
                ></path>
                <path
                  d="m15 13c0 1.6569-1.3431 3-3 3s-3-1.3431-3-3 1.3431-3 3-3 3 1.3431 3 3z"
                ></path>
              </g>
            </svg>
          </button>
          <h3 v-if="countDown > 0" class="countdown">{{ countDown }}</h3>
          <button v-if="showResetButton" @click="reset" class="reset-button btn btn-neutral">Reset</button>
          <h3 v-if="emotion" class="detected-emotion">Your emotion is: "{{ emotion }}"</h3>
          <p v-if="errorMessage" class="error-message" style="color:red ; ">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    <div class="song-recommendations-container">
      <div class="song-recommendations">
        <h2 class="subtitle">Song Recommendations</h2>
        <div class="result-area grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(item, index) in data" :key="index" style="animation-duration: 2s" class="card w-90 bg-base-100 shadow-xl animate__animated animate__fadeInUp animate__delay-2s">
            <figure class="px-10 pt-10">
              <img :src="item.Image" :alt="item.Name" class="rounded-xl music-pic" />
            </figure>
            <div class="card-body items-center text-center">
              <h2 class="card-title">{{ item.Name }}</h2>
              <p>{{ item.Album }} by {{ item.Artist }}</p>
              <div class="card-actions">
                <a :href="item.Spotify_link" target="_blank" rel="noopener noreferrer">
                  <button class="btn btn-success">Listen on Spotify</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [],
      countingDown: false,
      emotion: null,
      countDown: 0,
      hasCameraPermission: false,
      showResetButton: false,
      errorMessage: null 
    }
  },
  methods: {
    requestCameraPermission() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.hasCameraPermission = true;
          if (this.$refs.videoElement) {
            this.$refs.videoElement.srcObject = stream;
          }
        })
        .catch((error) => {
          this.hasCameraPermission = false;
          console.error('Error accessing camera:', error);
        });
    },
    startCountdown() {
      this.countDown = 5
      this.countingDown = true
      this.showResetButton = true 
      const countdownInterval = setInterval(() => {
        if (this.countDown > 0) {
          this.countDown--
        } else {
          clearInterval(countdownInterval)
          this.captureEmotion()
          this.countingDown = false
        }
      }, 1000)
    },
    captureEmotion() {
      if (!this.$refs.videoElement) {
        this.errorMessage = "Camera not ready";
        return;
      }
      
      const video = this.$refs.videoElement;
      const canvas = this.$refs.canvasElement;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 encoded image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      fetch('/api/detect-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.emotion) {
            this.data = JSON.parse(data.songs);
            this.emotion = data.emotion;
            this.errorMessage = null; 
          } else {
            this.errorMessage = data.error || "Mood could not be detected, Try again";
          }
        })
        .catch((error) => {
          console.error('Error capturing emotion:', error);
          this.errorMessage = "Mood could not be detected, Try again"; 
        });
    },
    reset() {
      this.data = []
      this.emotion = null
      this.countDown = 0
      this.showResetButton = false 
      this.errorMessage = null 
    }
  },
  mounted() {
    this.requestCameraPermission();
  },
  beforeUnmount() {
    if (this.$refs.videoElement && this.$refs.videoElement.srcObject) {
      const stream = this.$refs.videoElement.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  }
}
</script>

<style scoped>
.background {
  min-height: 100vh;
  background-color: #1b1b1b;
  width: 100%;
  position: absolute;
  text-align: center;
}

.title {
  z-index: 2;
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  margin-top: 60px;
}

.subtitle {
  z-index: 2;
  font-family: 'Avalors Personal Use';
  font-size: 20px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  margin: 20px;
}

.emotion-detector-container {
  @apply md:col-span-6;
}

.emotion-detector {
  height: 100%;
  margin: auto;
  padding-bottom: 20px;
  text-align: center;
}

.video-container {
  text-align: center;
}

.video-feed {
  display: inline-block;
  width: 100%;
  max-width: 500px; 
  border: solid rgb(255, 255, 255) 10px;
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(231, 231, 231, 0.3);
}

.container1 {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.button {
  justify-content: center;
  align-items: center;
  padding-left: 28px;
  height: 60px;
  width: 80px;
  border: none;
  background: #ff2849;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  bottom: 35px;
}

.button:hover {
  background: #e52441;
}

.button:hover .svg-icon {
  animation: flickering 2s linear infinite;
}

@keyframes flickering {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  52% {
    opacity: 1;
  }
  54% {
    opacity: 0;
  }
  56% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  92% {
    opacity: 0;
  }
  94% {
    opacity: 1;
  }
  96% {
    opacity: 0;
  }
  98% {
    opacity: 1;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.countdown {
  color: #ff3300;
  font-size: 80px;
  position: relative;
  bottom: 420px;
}

.reset-button {
  position: relative;
  bottom: 20px;
}

.detected-emotion {
  color: #eb4f28;
  font-size: 20px;
}

.song-recommendations-container {
  @apply md:col-span-6;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.song-recommendations-container {
  text-align: center;
  justify-content: center;
  align-items: center;
}

.song-recommendations {
  height: 100%;
  margin: auto;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.result-area {
  padding: 15px;
  width: 100%;
  height: 100%;
  margin: auto;
  text-align: center;
  margin-bottom: 15px;
}

.table {
  margin: auto;
  width: 100%;
}


@media (max-width: 500px) {
  .countdown {
  color: #ff3300;
  font-size: 70px;
  position: relative;
  bottom: 340px;
}
}
</style>
