 <template>
    <div class="body">
      <div class="banner">
        <div class="slider" style="--quantity: 7">
          <div
            class="item animate__animated animate__fadeIn animate__delay-1s"
            style="--position: 1"
            @click="openModal(0)"
          >
            <img src="../assets/pianochord/A.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-2s"
            style="--position: 2"
            @click="openModal(1)"
          >
            <img src="../assets/pianochord/B.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-3s"
            style="--position: 3"
            @click="openModal(2)"
          >
            <img src="../assets/pianochord/C.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-4s"
            style="--position: 4"
            @click="openModal(3)"
          >
            <img src="../assets/pianochord/D.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-5s"
            style="--position: 5"
            @click="openModal(4)"
          >
            <img src="../assets/pianochord/E.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-6s"
            style="--position: 6"
            @click="openModal(5)"
          >
            <img src="../assets/pianochord/F.png" alt="" />
          </div>
          <div
            class="item animate__animated animate__fadeIn animate__delay-7s"
            style="--position: 7"
            @click="openModal(6)"
          >
            <img src="../assets/pianochord/G.png" alt="" />
          </div>
        </div>
        <div class="content">
          <h1 data-content="Piano Chords">Piano Chords</h1>
          <div class="author">
            <h2 style="color: grey">Please Select</h2>
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
                  style="background-color: grey; color: white; border-radius: 5px; padding: 20px"
                >
                  Piano
                </button>
              </router-link>
              <router-link to="/chordprogression">
                <button
                  style="
                    background-color: white;
                    color: black;
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
          <div class="model animate__animated animate__fadeInDown"></div>
        </div>
      </div>
      <dialog id="my_modal_2" class="modal">
        <div class="modal-box">
          <h3 style="font-size: 30px" class="text-lg; font-bold text-center">
            {{ modalData.title }}
          </h3>
          <img  style="height: auto; width: auto; margin-left: 60px" :src="modalData.imageSrc" alt="Image" />
          <button type="button" class="btn btn-neutral btn-lg btn-block mt-4" @click="playSound">
            Listen Sound
          </button>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        modalData: {
          imageSrc: '',
          title: '',
          soundSrc: ''
        },
        images: [
          {
            src: 'https://www.pianochord.org/images/a.png',
            title: 'A Chord',
            soundSrc: 'src/assets/pianosound/A Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/b.png',
            title: 'B Chord',
            soundSrc: 'src/assets/pianosound/B Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/c.png',
            title: 'C Chord',
            soundSrc: 'src/assets/pianosound/C Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/d.png',
            title: 'D Chord',
            soundSrc: 'src/assets/pianosound/D Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/e.png',
            title: 'E Chord',
            soundSrc: 'src/assets/pianosound/E Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/f.png',
            title: 'F Chord',
            soundSrc: 'src/assets/pianosound/F Major (Key).mp3'
          },
          {
            src: 'https://www.pianochord.org/images/g.png',
            title: 'G Chord',
            soundSrc: 'src/assets/pianosound/G Major (Key).mp3'
          }
        ]
      }
    },
    methods: {
      openModal(index) {
        const chord = this.images[index]
        this.modalData = {
          imageSrc: chord.src,
          title: chord.title,
          soundSrc: chord.soundSrc
        }
        this.$nextTick(() => {
          document.getElementById('my_modal_2').showModal()
        })
      },
      playSound() {
        if (this.modalData.soundSrc) {
          const audio = new Audio(this.modalData.soundSrc)
          audio.play()
        }
      },
      closeModal() {
        document.getElementById('my_modal_2').close()
      }
    }
  }
  </script>
  
  <style scoped>
  .radiobtn {
    position: absolute;
    z-index: 3;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .body {
    background-color: #1b1a1a;
    background-image: repeating-linear-gradient(to right, transparent 0 100px, #3a3b3c22 100px 101px),
      repeating-linear-gradient(to bottom, transparent 0 100px, #25283b22 100px 101px);
  }
  
  .body::before {
    position: absolute;
    width: min(1400px, 90vw);
    top: 10%;
    left: 50%;
    height: 90%;
    transform: translateX(-50%);
    content: '';
    background-image: url(../assets/bg.png);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: top center;
    pointer-events: none;
  }
  
  .banner {
    width: 100%;
    height: 100vh;
    text-align: center;
    overflow: hidden;
    position: relative;
  }
  .banner .slider {
    position: absolute;
    width: 200px;
    height: 250px;
    top: 10%;
    left: calc(50% - 100px);
    transform-style: preserve-3d;
    transform: perspective(1000px);
    animation: autoRun 20s linear infinite;
    z-index: 2;
  }
  @keyframes autoRun {
    from {
      transform: perspective(1000px) rotateX(-16deg) rotateY(0deg);
    }
    to {
      transform: perspective(1000px) rotateX(-16deg) rotateY(360deg);
    }
  }
  
  .banner .slider .item {
    position: absolute;
    inset: 0 0 0 0;
    transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(550px);
  }
  .banner .slider .item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .banner .content {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(1400px, 100vw);
    height: max-content;
    padding-bottom: 100px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
  }
  .banner .content h1 {
    font-family: 'ICA Rubrik';
    font-size: 16em;
    line-height: 1em;
    color: #e0e0e1;
    position: relative;
  }
  .banner .content h1::after {
    position: absolute;
    inset: 0 0 0 0;
    content: attr(data-content);
    z-index: 2;
    -webkit-text-stroke: 2px #d2d2d2;
    color: transparent;
  }
  .banner .content .author {
    font-family: Poppins;
    text-align: left;
    max-width: 200px;
  }
  .banner .content h2 {
    font-size: 3em;
  }
  .banner .content .model {
    background-image: url(../assets/model1.png);
    width: 100%;
    height: 85vh;
    position: absolute;
    bottom: 0;
    left: 0;
    background-size: auto 100%;
    background-repeat: no-repeat;
    background-position: top center;
    z-index: 1;
  }
  @media screen and (max-width: 1023px) {
    .banner .slider {
      width: 160px;
      height: 200px;
      left: calc(50% - 80px);
    }
    .banner .slider .item {
      transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg))
        translateZ(300px);
    }
    .banner .content h1 {
      text-align: center;
      width: 100%;
      text-shadow: 0 10px 20px #000;
      font-size: 7em;
    }
    .banner .content .author {
      color: #fff;
      padding: 20px;
      text-shadow: 0 10px 20px #000;
      z-index: 2;
      max-width: unset;
      width: 100%;
      text-align: center;
      padding: 0 30px;
    }
  }
  @media screen and (max-width: 767px) {
    .banner .slider {
      width: 100px;
      height: 150px;
      left: calc(50% - 50px);
    }
    .banner .slider .item {
      transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg))
        translateZ(180px);
    }
    .banner .content h1 {
      font-size: 5em;
    }
  }
  </style>
  