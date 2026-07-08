<template>
  <div>
    <HomepageCarousel></HomepageCarousel>
    <SongRecommendSection></SongRecommendSection>
  </div>
</template>

<script>
import HomepageCarousel from '@/components/HomepageCarousel.vue';
import SongRecommendSection from '@/components/SongRecommendSection.vue';
export default {
  name: 'HomepageView',
  components: {
    HomepageCarousel,
    SongRecommendSection,
  },
};
</script>


