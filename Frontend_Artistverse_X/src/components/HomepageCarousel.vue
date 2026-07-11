<script>
import 'animate.css'

export default {
  data() {
    return {
      activeIndex: 0,
      items: [
        {
          head: 'WE ARE',
          videoSrc: '/videos/2.mp4',
          title: 'ARTISTVERSE X',
          description:
            'Artistverse X streamlines songwriting with customizable lyrics, genre and mood selection, and chord progression recommendations. Mimic your favorite artists, get emotional song suggestions through facial recognition, and enjoy an engaging, efficient music creation experience. Embrace the future of music with Artistverse X.',
          image:
            'https://png.pngtree.com/thumb_back/fw800/background/20220709/pngtree-abstract-lowpoly-data-visualization-on-dark-background-ai-contemporary-cell-photo-image_37843356.jpg'
        },
        {
          head: 'Together,',
          videoSrc: '/videos/1.mp4',
          title: 'Lets Rock!!!',
          description: 'We can created the rock lyrics for you. but not just the rock genre but also Create personalized lyrics from various moods and genres, compose in multiple languages, and mimic your favorite artists.Just Input prompts, and our system crafts unique lyrics tailored to your preferences.',
          image:
            'https://lafransatravellers.com/wp-content/uploads/2019/03/actuacion-actuacion-en-vivo-artistas-1763075.jpg'
        },
        {
          head: 'Feeling',
          videoSrc: '/videos/3.mp4',
          title: 'Emotion',
          description: 'Experience music that resonates with your emotions. Our mood detection camera analyzes your facial expressions to determine your current mood and recommends curated Spotify playlists to match. Enjoy a personalized listening experience, find inspiration for your own music',
          image: 'https://i1.sndcdn.com/artworks-000542021190-mf72zi-t500x500.jpg'
        },
        {
          head: 'Chord',
          videoSrc: '/videos/4.mp4',
          title: 'Progression',
          description: 'Unleash your inner composer with our Chord Progression feature. Choose your key, select a progression, and witness the system craft harmonies like never before. Visualize chords, hear their sound, and turn your musical dreams into reality',
          image: 'https://i.pinimg.com/564x/bb/d9/51/bbd9514ebd85ab44b11e022bf7d1a321.jpg'
        },
        {
          head: 'Ai',
          videoSrc: '/videos/5.mp4',
          title: 'Analysis',
          description: 'Dive deeper into your lyrics with our AI Lyrics Analysis feature. Simply input your lyrics, and watch as the system unveils a treasure trove of musical insights. From chord suggestions to tempo recommendations, and even key identification, let your creativity soar with precision-guided assistance.',
          image: 'https://i.pinimg.com/564x/f1/ef/2d/f1ef2ddd07e4fab9c75f262ae5526245.jpg'
        }
      ],
      intervalId: null
    }
  },
  mounted() {
    this.startAutoRun();
  },
  methods: {
    setActive(index) {
      this.activeIndex = index
    },
    nextSlider() {
      this.activeIndex = (this.activeIndex + 1) % this.items.length
    },
    prevSlider() {
      this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length
    },
    startAutoRun() {
      this.intervalId = setInterval(() => {
        this.nextSlider()
      }, 10000)
    },
    stopAutoRun() {
      if (this.intervalId !== null) {
        clearInterval(this.intervalId)
      }
    }
  },
  beforeUnmount() {
    this.stopAutoRun()
  }
}
</script>

<template>
  <div class="slider">
    <div class="list">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="item"
        :class="{ active: index === activeIndex }"
      >
        <video :src="item.videoSrc" muted autoplay loop></video>
        <div class="content">
          <p>{{ item.head }}</p>
          <h2>{{ item.title }}</h2>
          <p>{{ item.description }}</p>
          
        </div>
      </div>
    </div>
  </div>

  <!-- Remain unchanged -->
  <div class="arrows">
    <button @click="prevSlider">&#60;</button>
    <button @click="nextSlider">&#62;</button>
  </div>

  <div class="thumbnail animate__animated animate__fadeInUp">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="item"
      :class="{ active: index === activeIndex }"
      @click="setActive(index)"
    >
      <!-- Change image to video -->
      <img :src="item.image" />
      <div class="content">{{ item.title }}</div>
    </div>
  </div>
</template>
<style scoped>
.fancy {
  background-color: white;
  border: 1px solid #000;
  border-radius: 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0;
  outline: none;
  overflow: visible;
  padding: 1.25em 2em;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-transform: none;
  transition: all 0.3s ease-in-out;
  user-select: none;
  font-size: 13px;
  margin-top: 50px;
}

.fancy::before {
  content: ' ';
  width: 1.5625rem;
  height: 2px;
  background: black;
  top: 50%;
  left: 1.5em;
  position: absolute;
  transform: translateY(-50%);
  transform-origin: center;
  transition:
    background 0.3s linear,
    width 0.3s linear;
}

.fancy .text {
  font-size: 1.125em;
  line-height: 1.33333em;
  padding-left: 2em;
  display: block;
  text-align: left;
  transition: all 0.3s ease-in-out;
  text-transform: uppercase;
  text-decoration: none;
  color: black;
}

.fancy .top-key {
  height: 2px;
  width: 1.5625rem;
  top: -2px;
  left: 0.625rem;
  position: absolute;
  background: transparent;
  transition:
    width 0.5s ease-out,
    left 0.3s ease-out;
}

.fancy .bottom-key-1 {
  height: 2px;
  width: 1.5625rem;
  right: 1.875rem;
  bottom: -2px;
  position: absolute;
  background: transparent;
  transition:
    width 0.5s ease-out,
    right 0.3s ease-out;
}

.fancy .bottom-key-2 {
  height: 2px;
  width: 0.625rem;
  right: 0.625rem;
  bottom: -2px;
  position: absolute;
  background: transparent;
  transition:
    width 0.5s ease-out,
    right 0.3s ease-out;
}

.fancy:hover {
  color: white;
  background: black;
}

.fancy:hover::before {
  width: 0.9375rem;
  background: white;
}

.fancy:hover .text {
  color: white;
  padding-left: 1.5em;
}

.fancy:hover .top-key {
  left: -2px;
  width: 0px;
}

.fancy:hover .bottom-key-1,
.fancy:hover .bottom-key-2 {
  right: 0;
  width: 0;
}
.slider {
  height: 100vh;
  position: relative;
}

.slider .list .item {
  position: absolute;
  inset: 0 0 0 0;
  overflow: hidden;
  opacity: 0;
  transition: 0.5s;
}

.slider .list .item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slider .list .item::after {
  content: '';
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  background-image: linear-gradient(to top, #000 10%, transparent);
}

.slider .list .item .content {
  position: absolute;
  left: 10%;
  top: 20%;
  width: 500px;
  max-width: 80%;
  z-index: 1;
  color: white;
  font-weight: 500;
}

.slider .list .item .content p:nth-child(1) {
  text-transform: uppercase;
  letter-spacing: 5px;
}

.slider .list .item .content h2 {
  font-size: 90px;
  font-weight: 300;
  margin: 0;
  white-space: nowrap;
  font-family: 'Anton', sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  letter-spacing: 4px;
}
.slider .list .item.active {
  opacity: 1;
  z-index: 10;
}

@keyframes showContent {
  to {
    transform: translateY(0);
    filter: blur(0);
    opacity: 1;
  }
}

.slider .list .item.active p:nth-child(1),
.slider .list .item.active h2,
.slider .list .item.active p:nth-child(3),
.slider .list .item.active .fancy,
.animate__animated.animate__fadeInUp,
.arrows button {
  transform: translateY(30px);
  filter: blur(20px);
  opacity: 0;
  animation: showContent 0.8s 1.2s ease-in-out 1 forwards;
}

.slider .list .item.active h2 {
  animation-delay: 1s;
}
.slider .list .item.active p:nth-child(3) {
  animation-duration: 1.3s;
}

.arrows {
  position: absolute;
  top: 50%;
  right: 50px;
  z-index: 40;
}

.arrows button {
  background-color: #eee5;
  border: none;
  font-family: monospace;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  font-size: x-large;
  color: #eee;
  transition: 0.5s;
  margin-left: 10px;
}

.arrows button:hover {
  background-color: #eee;
  color: black;
}

.thumbnail {
  position: absolute;
  bottom: 50px;
  z-index: 11;
  display: flex;
  gap: 10px;
  width: 100%;
  height: 250px;
  padding: 0 50px;
  box-sizing: border-box;
  overflow: auto;
}

.thumbnail::-webkit-scrollbar {
  width: 0;
}

.thumbnail .item {
  width: 150px;
  height: 220px;
  filter: brightness(0.5);
  transition: 0.5s;
  flex-shrink: 0;
  border-radius: 10px;
}
.thumbnail .item:hover {
  border: rgb(255, 255, 255) 3px solid;
  border-radius: 10px;
}
.thumbnail .item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.thumbnail .item.active {
  filter: brightness(1.2);
}
.thumbnail .item .content {
  position: absolute;
  inset: auto 10px 10px 10px;
  color: white;
  font-weight: 700;
}

@media screen and (max-width: 678px) {
  .thumbnail {
    justify-content: start;
  }
  .slider .list .item .content h2 {
    font-size: 55px;
    font-weight: 700;
  }
  .arrows {
    top: 50%;
  }
}

  @media screen and (max-width: 500px) {
  .thumbnail {
    justify-content: start;
  }
  .slider .list .item .content p {
    font-size: 12px;
    font-weight: 600;
  }
  .arrows {
    top: 50%;
  }
}
</style>
