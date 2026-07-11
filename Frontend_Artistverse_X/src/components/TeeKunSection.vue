<template>
  <div id="studio" class="studio-section">
    <div class="marquee">
      <div class="marquee-content">
        <span>Artist</span>
        <img src="../assets/star3.png" width="70" />
        <span>style</span>
        <img src="../assets/star3.png" width="70" />

        <span>genre</span>
        <img src="../assets/star3.png" width="70" />
      </div>
      <div class="marquee-content">
        <span>Emotion</span>
        <img src="../assets/star3.png" width="70" />

        <span>Feeling</span>
        <img src="../assets/star3.png" width="70" />

        <span>Artist</span>
        <img src="../assets/star3.png" width="70" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-section {
  background-color: #161515;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  padding-top: 6rem;
}

.marquee {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  border-bottom: 1px solid white;
  border-top: 1px solid white;
}

.marquee-content {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  align-items: center;
  color: white;
  font-family:'Times New Roman', Times, serif;
  font-size: 4rem;
  text-transform: uppercase;
  -webkit-text-stroke: 1.5px;
  -webkit-text-fill-color: transparent;
  width: 100vw;
  flex-shrink: 0;
  animation: marquee 10s linear infinite;
}
.marquee-content img {
  filter: invert(1);
}
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

@media screen and (max-width: 1024px) {
  .marquee-content {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  align-items: center;
  color: white;
  font-family:'Times New Roman', Times, serif;
  font-size: 2.5rem;
  text-transform: uppercase;
  -webkit-text-stroke: 1.5px;
  -webkit-text-fill-color: transparent;
  width: 100vw;
  flex-shrink: 0;
  animation: marquee 10s linear infinite;
}
}
@media screen and (max-width: 500px) {
  .marquee-content {
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
  align-items: center;
  color: white;
  font-family:'Times New Roman', Times, serif;
  font-size: 1.5rem;
  text-transform: uppercase;
  -webkit-text-stroke: 1px;
  -webkit-text-fill-color: transparent;
  width: 100vw;
  flex-shrink: 0;
  animation: marquee 10s linear infinite;
  margin-left: 40px;
}
img{
}
}
</style>
