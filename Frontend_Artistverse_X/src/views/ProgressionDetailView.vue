<template>
  <div class="background">
    <div class="body">
      <router-link to="/progression">
        <button class="boton-elegante">Click here to see Chord Progression Chart</button>
      </router-link>
      <div class="container">
        <div class="slide">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="item"
            :style="{ backgroundImage: 'url(' + item.imageUrl + ')' }"
          >
            <div class="content">
              <div class="name">{{ item.name }}</div>
              <div class="des">{{ item.description }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="button">
          <button class="prev" @click="prevSlide">
            &#60;
          </button>
          <button class="next" @click="nextSlide">
            &#62;
          </button>
        </div>

        <!-- Page indicators -->
        <div class="page-indicators">
          <span
            v-for="(item, index) in items"
            :key="'dot-' + index"
            :class="{ 'active': index === currentIndex }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [

        {
          name: '2-5-1-6 Progression',
          description: 'The 2-5-1-6 progression is smooth and often used in jazz. It gives a sense of movement and resolution, starting on the subdominant, moving to the dominant, and resolving to the tonic, before unexpectedly moving to the 6th chord. This creates a feeling of surprise and adds a touch of melancholy or introspection.',
          imageUrl: 'https://i.pinimg.com/564x/e9/51/71/e9517147827c0a9e2c560902be1adbd1.jpg'
        },
        {
          name: 'What is a Chord Progression?',
          description: 'A chord progression is a sequence of chords played in succession. Chords are groups of notes played simultaneously, and when these chords are arranged in a specific order, they create a progression that forms the harmonic backbone of a piece of music. Chord progressions are fundamental in creating a sense of movement, tension, and resolution in music.',
          imageUrl: 'https://i.pinimg.com/564x/13/d5/c3/13d5c310fbe255336e317263fa17052a.jpg'
        },
        {
          name: '1-6-2-5 Progression',
          description: 'The 1-6-2-5 progression is a classic sequence often found in pop and jazz music. It begins on a strong tonic chord, then moves to the relative minor, creating a warm and nostalgic feeling. The progression continues with a subdominant and dominant chord, creating a satisfying resolution.',
          imageUrl: 'https://i.pinimg.com/564x/cc/2b/48/cc2b48461e1924a24dfd7b188597df95.jpg'
        },
        {
          name: '1-5-6-4 Progression',
          description: 'The 1-5-6-4 progression is one of the most popular in modern music, often heard in ballads and anthems. It starts with a strong tonic, followed by a dominant, then moves to the relative minor, and resolves with the subdominant. This progression is uplifting and emotional, often conveying a sense of triumph or longing.',
          imageUrl: 'https://i.pinimg.com/564x/bb/49/56/bb49562cd0a2c8702ec28ae622e4ce46.jpg'
        },
        {
          name: '1-6-4-5 Progression',
          description: 'The 1-6-4-5 progression is similar to the 1-5-6-4 but with a slightly different order that shifts the emotional focus. It starts with a sense of stability, moves to a more melancholic minor chord, and then to the subdominant, before creating tension with the dominant chord. This sequence is often used to build anticipation and resolution.',
          imageUrl: 'https://i.pinimg.com/564x/76/1e/3b/761e3b634d2e7a25e0d54f2f32d9dea4.jpg'
        },
        {
          name: '1-4-5-1 Progression',
          description: 'The 1-4-5-1 progression is a simple and traditional sequence that creates a feeling of resolution and completeness. It is often used in folk, blues, and rock music, offering a straightforward and confident emotional impact. The return to the tonic at the end reinforces a sense of stability and closure.',
          imageUrl: 'https://i.pinimg.com/564x/bc/99/46/bc9946f7b387a0d65af01bbd08eb5a81.jpg'
        },
        {
          name: '1-4-6-5 Progression',
          description: 'The 1-4-6-5 progression is similar to 1-6-4-5 but starts with the subdominant. This sequence provides a sense of movement and slight tension, making it ideal for creating a more complex emotional landscape, often used in pop and rock to convey feelings of longing or introspection.',
          imageUrl: 'https://i.pinimg.com/564x/b0/81/98/b081989c27c89d47e9c529958ab443c0.jpg'
        },
        {
          name: '1-6-2-6 Progression',
          description: 'The 1-6-2-6 progression combines a mix of stability and melancholy, starting and returning to the relative minor. This sequence can evoke a sense of circularity or unresolved emotion, often used in more contemplative or introspective songs.',
          imageUrl: 'https://i.pinimg.com/736x/91/ee/b9/91eeb94e240fefb8384a8098e8c04bd5.jpg'
        },
        {
          name: '6-4-3-2 Progression',
          description: 'The 6-4-3-2 progression is less common and creates a more unique and haunting emotional effect. It starts with the minor sixth, leading through a descending sequence that can evoke feelings of tension, mystery, or melancholy. This progression is often used to create an unresolved or introspective mood.',
          imageUrl: 'https://i.pinimg.com/564x/31/70/a7/3170a72fcfebfda139f47f850445c6f9.jpg'
        }
      ],
    };
  },
  methods: {
    nextSlide() {
      this.items.push(this.items.shift());
    },
    prevSlide() {
      this.items.unshift(this.items.pop());
    }
  }
};
</script>

<style scoped>
.boton-elegante {
  padding: 15px 30px;
  border: 2px solid #2c2c2c;
  background-color: #e1f281;
  color: #000000;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.4s ease;
  outline: none;
  position: absolute;
  top: 9%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 5px 30px #dbdbdb;
  font-family: 'Avalors Personal Use';
    text-transform: uppercase;
    font-weight: bold;
    text-shadow: 0 0 4px white;

}

.boton-elegante::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: scale(0);
  transition: transform 0.5s ease;
}

.boton-elegante:hover::after {
  transform: scale(1);
}

.boton-elegante:hover {
  border-color: #666666;
  background: #292929;
  color: white;
}


.background{
  text-align: center;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-width: 100px;
    background-color: #1b1b1b;}
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.body{
    background: #eaeaea;
    overflow: hidden;
    background-color: #1b1b1b;
}

.container{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1000px;
    height: 600px;
    background: #f5f5f5;
    box-shadow: 0 30px 50px #dbdbdb;
}

.container .slide .item{
    width: 200px;
    height: 300px;
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    border-radius: 20px;
    box-shadow: 0 30px 50px #505050;
    background-position: 50% 50%;
    background-size: cover;
    display: inline-block;
    transition: 0.5s;
}

.slide .item:nth-child(1),
.slide .item:nth-child(2){
    top: 0;
    left: 0;
    transform: translate(0, 0);
    border-radius: 0;
    width: 100%;
    height: 100%;
}


.slide .item:nth-child(3){
    left: 50%;
}
.slide .item:nth-child(4){
    left: calc(50% + 220px);
}
.slide .item:nth-child(5){
    left: calc(50% + 440px);
}

.slide .item:nth-child(n + 6){
    left: calc(50% + 660px);
    opacity: 0;
}



.item .content{
    position: absolute;
    top: 50%;
    left: 100px;
    width: 300px;
    text-align: left;
    color: #eee;
    transform: translate(0, -50%);
    font-family: system-ui;
    display: none;
}


.slide .item:nth-child(2) .content{
    display: block;
}


.content .name{
    font-size: 40px;
    font-family: 'Avalors Personal Use';
    text-transform: uppercase;
    font-weight: bold;
    text-shadow: 0 0 4px white;
    opacity: 0;
    animation: animate 1s ease-in-out 1 forwards;
}

.content .des{
    margin-top: 10px;
    margin-bottom: 20px;
    opacity: 0;
    animation: animate 1s ease-in-out 0.3s 1 forwards;
}

.content button{
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    opacity: 0;
    animation: animate 1s ease-in-out 0.6s 1 forwards;
}


@keyframes animate {
    from{
        opacity: 0;
        transform: translate(0, 100px);
        filter: blur(33px);
    }

    to{
        opacity: 1;
        transform: translate(0);
        filter: blur(0);
    }
}



.button{
    width: 100%;
    text-align: center;
    position: absolute;
    bottom: 20px;
    color: white;
    
}

.button button{
    width: 40px;
    height: 35px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    margin: 0 5px;
    border: 1px solid #fbf7f7;
    transition: 0.3s;
}

.button button:hover{
    background: #ababab;
    color: #fff;
}
</style>