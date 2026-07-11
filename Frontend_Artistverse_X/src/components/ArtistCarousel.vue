<template>
  <div class="background">
    <div class="container">
      <h1 class="title">INCLUDE ARTIST</h1>
      <div class="slider-wrapper" ref="sliderWrapper">
        <button @click="switchNationality" class="switch-button comic-button">
          {{ switchButtonLabel }}
        </button>

        <ul
          class="image-list"
          :class="{ 'animate__animated animate__fadeInDown animate__delay-1s': section2InView }"
          ref="sliderImageList"
        >
          <li
            v-for="(image, index) in filteredImages"
            :key="index"
            class="image-item"
            @mouseover="showPopup(index)"
          >
            <img
              :src="image.src"
              :alt="'img-' + (index + 1)"
              class="hover-image"
              @mouseleave="hidePopup(index)"
            />
            <div class="popup" :class="{ active: image.showPopup }">{{ image.description }}</div>
          </li>
        </ul>
      </div>
      <div
        class="slider-scrollbar"
        :class="{ 'animate__animated animate__fadeInDown animate__delay-1s': section2InView }"
        ref="sliderScrollbar"
      >
        <div class="scrollbar-track">
          <div class="scrollbar-thumb" ref="scrollbarThumb"></div>
        </div>
      </div>
      <h1
        class="title2"
        :class="{ 'animate__animated animate__fadeInUp animate__delay-2s': section2InView }"
      >
        Those, who bring art to people
      </h1>
      <h1
        class="title3"
        :class="{ 'animate__animated animate__fadeInUp animate__delay-3s': section2InView }"
      >
        with open eyes and open ears
      </h1>
    </div>
  </div>
</template>

<script>
import 'animate.css'

export default {
  data() {
    return {
      section2InView: false,
      images: [
        {
          src: 'https://i.pinimg.com/564x/d5/6f/3d/d56f3d970062d683cfb8eef06512ae56.jpg',
          description: 'Taylor Swift',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/4b/36/34/4b3634bbbd4ac6986f101a66efdfa505.jpg',
          description: 'Billie Eilish',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/736x/a1/33/db/a133db3be3edf41ead3bad133e64fd2a.jpg',
          description: 'Ed Sheeran',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/d0/c6/da/d0c6da4df1632679bd5417f12cfbaa3a.jpg',
          description: 'Justin Bieber',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/9a/56/03/9a560395d8cfd33f77f7bfffefe3d76c.jpg',
          description: 'the weeknd',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/c7/90/c7/c790c72932a5ecd0fb332f5a1ca07aca.jpg',
          description: 'Maroon5',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/d0/f7/7e/d0f77e65f531c152153e2ed252b92eac.jpg',
          description: 'Olivia Rodrigo',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/85/49/f4/8549f49ef4897d3632d30c7c9e16ddb4.jpg',
          description: 'The 1975',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/76/d5/45/76d545a1eb6a2e99f49356fae649e137.jpg',
          description: 'Joji',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.pinimg.com/564x/cf/c0/f4/cfc0f4d181ee983afa77d025517a4943.jpg',
          description: 'Keshi',
          nationality: 'non-thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eb9519facbd1d177323004b0cd',
          description: 'Phum Viphurit',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab67616d0000b273c59299444114c933134870d0',
          description: 'Potato',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eb7603d3db96028d5714b73b4f',
          description: 'Palmy',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eb5280b964a9bc960525efa4c0',
          description: 'Big Ass',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eba2003715ca56bdee004fdaae',
          description: 'Lula',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://www.thaiticketmajor.com/variety/img_content/imgeditor/S__77496389.jpg',
          description: 'Lipta',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5ebd7279f0c9b4a9bea32fdcd2c',
          description: 'Scrubb',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eba1b43fe7d797b91ad41a313b',
          description: 'Stamp Apiwat',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eb98467826d8be702757c2e465',
          description: 'Getsunova',
          nationality: 'thai',
          showPopup: false
        },
        {
          src: 'https://i.scdn.co/image/ab6761610000e5eb2fa98cdea9623246b4472232',
          description: 'Da Endorphine',
          nationality: 'thai',
          showPopup: false
        }
      ],
      nationality: 'non-thai',
      switchButtonLabel: 'Show Thai Artists',
      maxScrollLeft: 0
    }
  },
  computed: {
    filteredImages() {
      return this.images.filter((image) => image.nationality === this.nationality)
    }
  },
  mounted() {
    this.sliderImageList = this.$refs.sliderImageList
    this.sliderScrollbar = this.$refs.sliderScrollbar
    this.scrollbarThumb = this.$refs.scrollbarThumb

    this.initSlider()
    this.observeSection2()
    this.sliderImageList.addEventListener('scroll', () => {
      this.updateScrollThumbPosition()
      this.handleSlideButtons()
      this.updateSwitchButtonLabel()
    })
  },
  methods: {
    initSlider() {
      const imageList = this.$refs.sliderImageList
      const slideButtons = document.querySelectorAll('.slider-wrapper .slide-button')
      const sliderScrollbar = document.querySelector('.container .slider-scrollbar')
      const scrollbarThumb = this.$refs.scrollbarThumb
      this.maxScrollLeft = imageList.scrollWidth - imageList.clientWidth

      scrollbarThumb.addEventListener('mousedown', (e) => {
        const startX = e.clientX
        const thumbPosition = scrollbarThumb.offsetLeft
        const maxThumbPosition =
          sliderScrollbar.getBoundingClientRect().width - scrollbarThumb.offsetWidth

        const handleMouseMove = (e) => {
          const deltaX = e.clientX - startX
          const newThumbPosition = thumbPosition + deltaX

          const boundedPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition))
          const scrollPosition = (boundedPosition / maxThumbPosition) * this.maxScrollLeft

          scrollbarThumb.style.left = `${boundedPosition}px`
          imageList.scrollLeft = scrollPosition
        }

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      })

      slideButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.id === 'prev-slide' ? -1 : 1
          const scrollAmount = imageList.clientWidth * direction
          imageList.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        })
      })

      const handleSlideButtons = () => {
        slideButtons[0].style.display = imageList.scrollLeft <= 0 ? 'none' : 'flex'
        slideButtons[1].style.display = imageList.scrollLeft >= this.maxScrollLeft ? 'none' : 'flex'
      }

      const updateScrollThumbPosition = () => {
        const scrollPosition = imageList.scrollLeft
        const thumbPosition =
          (scrollPosition / this.maxScrollLeft) *
          (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth)
        scrollbarThumb.style.left = `${thumbPosition}px`
      }

      imageList.addEventListener('scroll', () => {
        updateScrollThumbPosition()
        handleSlideButtons()
      })
    },
    showPopup(index) {
      this.images.forEach((image) => {
        image.showPopup = false
      })
      this.images[index].showPopup = true
    },
    hidePopup(index) {
      this.images[index].showPopup = false
    },
    switchNationality() {
      this.nationality = this.nationality === 'non-thai' ? 'thai' : 'non-thai'
      this.switchButtonLabel =
        this.nationality === 'non-thai' ? 'Show Thai Artists' : 'Show Non-Thai Artists'
    },
    observeSection2() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.section2InView = true
              observer.unobserve(this.$el)
            }
          })
        },
        { threshold: 0.1 }
      )
      observer.observe(this.$el)
    },
    updateSwitchButtonLabel() {
      this.switchButtonLabel =
        this.nationality === 'non-thai' ? 'Show Thai Artists' : 'Show Non-Thai Artists'
    }
  }
}
</script>

<style scoped>
.switch-button {
  position: absolute;
  top: -27%;
  left: 75%;
}
.comic-button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  color: #fff;
  background-color: #1d1b1b;
  border: 2px solid #ffffff;
  border-radius: 10px;
  box-shadow: 5px 5px 0px #000;
  transition: all 0.3s ease;
  cursor: pointer;
}

.comic-button:hover {
  background-color: #fff;
  color: #000000;
  border: 2px solid #000000;
  box-shadow: 5px 5px 0px #060606;
}

.comic-button:active {
  background-color: #ffffff;
  box-shadow: none;
  transform: translateY(4px);
}

.popup {
  text-align: center;
  margin-top: 10px;
  border-radius: 30px;
  padding: 15px;
  position: relative;
  background-color: rgba(21, 22, 22, 0.8);
  color: #fff;
  font-size: 1.2rem;
  font-family: 'Outfit', sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
  letter-spacing: 3px;
  visibility: hidden;
  opacity: 0;
  transition:
    visibility 0s,
    opacity 0.5s linear,
    transform 0.8s ease;
  max-width: 100%;
  white-space: normal;
  bottom: -60px;
  z-index: 1;
  transform: translateY(20px);
}

.image-item:hover .popup {
  visibility: visible;
  opacity: 1;
  bottom: 0;
  transform: translateY(0);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.title {
  text-align: center;
  color: #fff;
  font-size: 5rem;
  margin-bottom: 20px;
  font-family: 'Tac One', sans-serif;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 2px;
  animation-duration: 2s; /* don't forget to set a duration! */
}
.title2 {
  position: relative;
  text-align: center;
  color: #797777;
  font-size: 1rem;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 2px;
  margin-top: 2%;
  animation-duration: 2s; /* don't forget to set a duration! */
}

.title3 {
  position: relative;
  text-align: center;
  color: #797777;
  font-size: 1rem;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 2px;
  animation-duration: 2s; /* don't forget to set a duration! */
}

.background {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1b1b1b;
}

.container {
  max-width: 1200px;
  width: 100%;
  position: absolute;
  top: 250%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.slider-wrapper {
  position: relative;
  animation-duration: 2s; /* don't forget to set a duration! */
}

.slider-wrapper .slide-button {
  position: absolute;
  top: 41%;
  outline: none;
  border: none;
  height: 50px;
  width: 50px;
  z-index: 5;
  color: #fff;
  display: flex;
  cursor: pointer;
  font-size: 1.6rem;
  background: #000;
  justify-content: center;
  border-radius: 50%;
  transform: translateY(-50%);
}

.slider-wrapper .slide-button:hover {
  background: #404040;
}

.slider-wrapper .slide-button#prev-slide {
  left: -25px;
  display: none;
}

.slider-wrapper .slide-button#next-slide {
  right: -25px;
}

.slider-wrapper .image-list {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 18px;
  font-size: 0;
  list-style: none;
  margin-bottom: 30px;
  overflow-x: auto;
  animation-duration: 2s; /* don't forget to set a duration! */
  scrollbar-width: none;
}

.slider-wrapper .image-list::-webkit-scrollbar {
  display: none;
}

.slider-wrapper .image-list .image-item {
  width: 325px;
  height: 400px;
  object-fit: cover;
  overflow: hidden;
}
.hover-image {
  transition: border-radius 0.5s ease;
}

.hover-image:hover {
  border-radius: 50%;
  border: 1px solid rgb(104, 102, 102);
}

.container .slider-scrollbar {
  height: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  animation-duration: 2s; /* don't forget to set a duration! */
}

.slider-scrollbar .scrollbar-track {
  background: #ccc;
  width: 100%;
  height: 2px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  position: relative;
}

.slider-scrollbar:hover .scrollbar-track {
  height: 4px;
}

.slider-scrollbar .scrollbar-thumb {
  position: absolute;
  background: #d4ec4c;
  top: 0;
  bottom: 0;
  width: 30%;
  height: 100%;
  cursor: grab;
  border-radius: inherit;
}

.slider-scrollbar .scrollbar-thumb:active {
  cursor: grabbing;
  height: 8px;
  top: -2px;
}

.slider-scrollbar .scrollbar-thumb::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -10px;
  bottom: -10px;
} /* Styles for mobile and tablets */
@media only screen and (max-width: 1023px) {
  .slider-wrapper .slide-button {
    display: none !important;
  }

  .slider-wrapper .image-list {
    gap: 10px;
    margin-bottom: 15px;
    scroll-snap-type: x mandatory;
  }

  .slider-wrapper .image-list .image-item {
    width: 280px;
    height: 380px;
  }

  .slider-scrollbar .scrollbar-thumb {
    width: 15%;
  }
  .switch-button {
    position: absolute;
    top: 140%;
    left: 34%;
  }
}
@media only screen and (max-width: 500px) {
  .title {
  text-align: center;
  color: #fff;
  font-size: 3rem;
  margin-bottom: 20px;
  font-family: 'Tac One', sans-serif;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 2px;
  animation-duration: 2s; /* don't forget to set a duration! */
}
  .slider-wrapper .slide-button {
    display: none !important;
  }

  .slider-wrapper .image-list {
    gap: 10px;
    margin-bottom: 15px;
    scroll-snap-type: x mandatory;
  }

  .slider-wrapper .image-list .image-item {
    width: 280px;
    height: 380px;
  }

  .slider-scrollbar .scrollbar-thumb {
    width: 15%;
  }
  .switch-button {
    position: absolute;
    top: 138%;
    left: 28%;
  }
  .comic-button {
    display: inline-block;
    padding: 5px 20px;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
    text-decoration: none;
    color: #fff;
    background-color: #1d1b1b;
    border: 2px solid #ffffff;
    border-radius: 10px;
    box-shadow: 5px 5px 0px #000;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .comic-button:hover {
    background-color: #fff;
    color: #000000;
    border: 2px solid #000000;
    box-shadow: 5px 5px 0px #060606;
  }

  .comic-button:active {
    background-color: #ffffff;
    box-shadow: none;
    transform: translateY(4px);
  }
}
</style>
