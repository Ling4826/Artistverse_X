<template>
  <div class="layout">
    <div class="section1">
      <GsapGenerator></GsapGenerator>
    </div>
    <div class="section2">
      <ArtistCarousel></ArtistCarousel>
    </div>
    <TeeKunSection></TeeKunSection>

    <!-- <div class="section3">
      <ThaiArtistCarousel></ThaiArtistCarousel>
    </div> -->
  </div>
</template>

<script>
import ArtistCarousel from '../components/ArtistCarousel.vue'
import GsapGenerator from '@/components/GsapGenerator.vue'
// import ThaiArtistCarousel from '@/components/ThaiArtistCarousel.vue'
import TeeKunSection from '@/components/TeeKunSection.vue'
export default {
  name: 'LayoutView',
  components: {
    ArtistCarousel,
    GsapGenerator,
    // ThaiArtistCarousel
    // EmotionSection
    TeeKunSection,
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}

.section1,
.section2 {
  flex: 1;
}
</style>
