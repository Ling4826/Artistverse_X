<template>
  <div id="body">
    <div class="container">
      <div class="bubbles">
        <span style="--i:11;"></span>
        <span style="--i:12;"></span>
        <span style="--i:24;"></span>
        <span style="--i:10;"></span>
        <span style="--i:14;"></span>
        <span style="--i:23;"></span>
        <span style="--i:18;"></span>
        <span style="--i:16;"></span>
        <span style="--i:19;"></span>
        <span style="--i:20;"></span>
        <span style="--i:22;"></span>
        <span style="--i:25;"></span>
        <span style="--i:18;"></span>
        <span style="--i:21;"></span>
        <span style="--i:15;"></span>
        <span style="--i:13;"></span>
        <span style="--i:26;"></span>
        <span style="--i:17;"></span>
        <span style="--i:13;"></span>
        <span style="--i:28;"></span>
        <span style="--i:11;"></span>
        <span style="--i:12;"></span>
        <span style="--i:24;"></span>
        <span style="--i:10;"></span>
        <span style="--i:14;"></span>
        <span style="--i:23;"></span>
        <span style="--i:18;"></span>
        <span style="--i:16;"></span>
        <span style="--i:19;"></span>
        <span style="--i:20;"></span>
        <span style="--i:22;"></span>
        <span style="--i:25;"></span>
        <span style="--i:18;"></span>
        <span style="--i:21;"></span>
        <span style="--i:15;"></span>
        <span style="--i:13;"></span>
        <span style="--i:26;"></span>
        <span style="--i:17;"></span>
        <span style="--i:13;"></span>
        <span style="--i:28;"></span>
      </div>
      <!-- <div class="container2">
      <div class="big-text">
        <h1>Fullfill your emotion</h1>
      </div>
    </div> -->
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#body {
  min-height: 100vh;
  background-color: #191818;
}

.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  
}
.container2{
    display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.bubbles {
  position: relative;
  display: flex;
}
.bubbles span {
  position: relative;
  width: 30px;
  height: 30px;
  background: rgb(255, 255, 255);
  margin: 0 4px;
  border-radius: 50%;
  box-shadow:
    0 0 0 10px #ffffff44,
    0 0 50px rgb(255, 255, 255),
    0 0 100px rgb(255, 255, 255);
  animation: animate 15s linear infinite;
  animation-duration: calc(125s / var(--i));
}

.bubbles span:nth-child(even){
    background: #000000;
    box-shadow:
    0 0 0 10px #3d3d3d44,
    0 0 50px #a9a5a544,
    0 0 100px white;
}
@keyframes animate
{
    0%{
        transform: translateY(100vh) scale(0);
    }
    100%{
        transform: translateY(-10vh) scale(1);
    }
}
</style>
