<template>
  <div class="body">
    <div class="wrapper" ref="wrapper">
      <div class="items" ref="items">
        <div
          class="item animate__animated animate__fadeInRight animate__delay-1s"
          v-for="(image, index) in images"
          :key="index"
          ref="item"
        >
          <img :src="image.url" :alt="image.alt" />
        </div>
      </div>
      <div class="overlay" ref="overlay">
        <h1>Lyrics</h1>
        <h2 style="margin-right: 30px">Generate</h2>
        <router-link to="/generate-lyrics-genre">
        <button class="animated-button">
          <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
            ></path>
          </svg>
          <span class="text">Let's Generate!</span>
          <span class="circle"></span>
          <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
            ></path>
          </svg>
        </button>
      </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
  data() {
    return {
      images: [
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        },
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        },
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/ba/12/f2/ba12f220a7cc38eda60cbc16dd484bea.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/54/46/2a/54462ae8636a3cd868a670c53d112a10.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/16/55/21/165521c8dc4f3771c0a5e583a2e8900b.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/34/34/6d/34346d79a9e5026390bed8645a91e441.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/34/34/6d/34346d79a9e5026390bed8645a91e441.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/6e/92/b4/6e92b48f80aa608923750047c33d72a2.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/a9/f5/3a/a9f53af65250f92bf12c2cab73374926.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/9d/1c/a4/9d1ca46a842524e873859e14700c0b1b.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/18/74/51/187451a1c4fb67d8f2dae890c77be3d8.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/95/78/3b/95783b344b83a9e297ebdce64f0b6273.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/7d/75/64/7d75649a9124c1ced76f5720ac4d137a.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/a3/7f/84/a37f841c6c09effd650a7db4d68659c5.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/85/49/f4/8549f49ef4897d3632d30c7c9e16ddb4.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/736x/78/e4/90/78e4903166c4dd3b5dda7020c40b415a.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/61/b3/6e/61b36eeb497875b8f7397c4419f27764.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/7b/4d/55/7b4d557f1e64b55c3231b4c517aedebf.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/c4/cb/7c/c4cb7c9c00b14e869529261d4beca02b.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/7a/a0/f8/7aa0f86e2a939f9f79a9607c83669146.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/d4/72/0b/d4720b553fe8654862a013586db7a032.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/c9/78/34/c978349fa15ed32b13a8a4c631b7ff2f.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/e6/d4/f0/e6d4f018ba5630916a96a4fb41b3a9ff.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/e5/a2/96/e5a29652238211d8ee54dab35e843922.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/5b/4c/ed/5b4ced22923bd1c1353d28213bffad03.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/67/10/6f/67106f719c51166b41d59286546d122e.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/bd/64/dc/bd64dc5f122cd0c44b980bbeab5be872.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/72/fd/99/72fd99d9ffa40ae04b3aeec55ad62d5f.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i.pinimg.com/564x/91/75/eb/9175eb646cd45db0dea6b4b29f5a0a40.jpg',
          alt: 'Image 1'
        },
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        },
        {
          url: 'https://i0.wp.com/www.printmag.com/wp-content/uploads/2021/06/fdcd5a_d8dd6d540bd84e4e9df8cbcfa376ce0dmv2.jpg?resize=1000%2C1000&quality=89&ssl=1',
          alt: 'Image 1'
        }

        // Add more image URLs as needed
      ],
      tl: null
    }
  },
  mounted() {
    this.initGSAP()
  },
  methods: {
    initGSAP() {
      gsap.registerPlugin(ScrollTrigger)
      this.tl = gsap.timeline()

      this.tl.to(this.$refs.items.querySelectorAll('.item img'), { scale: 1 }, 0)
      this.tl.to(this.$refs.items, { scale: 2, rotate: 0 }, 0)
      this.tl.to(this.$refs.overlay, { height: '100%' }, 0.2)
      this.tl.to(this.$refs.overlay.querySelector('h1'), { scale: 1 }, 0.6)
      this.tl.to(this.$refs.overlay.querySelector('h2'), { scale: 1 }, 0.6)
      this.tl.to(this.$refs.items, { scale: 0.8, opacity: 0.2 }, 0.6)

      ScrollTrigger.create({
        trigger: this.$refs.wrapper,
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
        pin: true,
        animation: this.tl
      })
    }
  }
}
</script>
<style scoped>
.body {
  background: black;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.items {
  width: 130%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}

.item {
  width: 300px;
  height: 400px;
  margin: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.item:hover {
  transform: scale(1.05);
}

.item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.4);
}

.overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  backdrop-filter: blur(3px);
  background-color: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 0vh;
  flex-wrap: wrap;
  /* height: 100vh; */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Open Sans', sans-serif;
  font-weight: 300;
  font-size: clamp(3rem, 8vw, 10rem);
  overflow: hidden;
}
.overlay h1 {
  transform: scale(0);
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 500;

  font-style: normal;
  letter-spacing: 2px;
  z-index: auto;
}
.overlay h2 {
  transform: scale(0);
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 500;
  font-style: normal;
  letter-spacing: 2px;
  margin-left: 20px;
  color: rgb(239, 247, 130);
}
.animated-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 36px;
  border: 4px solid;
  border-color: transparent;
  font-size: 16px;
  background-color: inherit;
  border-radius: 100px;
  font-weight: 600;
  color: rgb(255, 255, 255);
  box-shadow: 0 0 0 2px rgb(255, 255, 255);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  margin-top: 20px;
}

.animated-button svg {
  position: absolute;
  width: 24px;
  fill: rgb(255, 255, 255);
  z-index: 9;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .arr-1 {
  right: 16px;
}

.animated-button .arr-2 {
  left: -25%;
}

.animated-button .circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: rgb(255, 255, 255);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button .text {
  position: relative;
  z-index: 1;
  transform: translateX(-12px);
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.animated-button:hover {
  box-shadow: 0 0 0 12px transparent;
  color: #212121;
  border-radius: 12px;
}

.animated-button:hover .arr-1 {
  right: -25%;
}

.animated-button:hover .arr-2 {
  left: 16px;
}

.animated-button:hover .text {
  transform: translateX(12px);
}

.animated-button:hover svg {
  fill: #212121;
}

.animated-button:active {
  scale: 0.95;
  box-shadow: 0 0 0 4px rgb(255, 255, 255);
}

.animated-button:hover .circle {
  width: 220px;
  height: 220px;
  opacity: 1;
}

@media (max-width: 500px) {
  h1,h2{
    position: relative;
    left: 20px;
  }
}
</style>
