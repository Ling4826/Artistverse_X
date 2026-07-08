<template>
  <div v-if="lyrics" class="flex flex-col sm:flex-row gap-2 justify-center items-center">
    <button class="btn-save" @click="saveLyrics">Save Lyrics</button>
    <button class="btn-save" @click="goToEditLyrics">Edit Lyrics</button>
    <button class="btn-regenerate" @click="regenerateLyrics">Regenerate</button>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'EditAndSaveLyricsButton',
  props: {
    lyrics: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      default: 'Lyrics.txt'
    }
  },
  methods: {
    saveLyrics() {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "No internet connection.",
          text: "Unable to save lyrics",
          customClass: {
            popup: 'swal2-top-center',
          },
          position: 'top',
        });
        return;
      }

      const blob = new Blob([this.lyrics], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    goToEditLyrics() {
      if (!this.lyrics) return;

      // Save current lyrics in localStorage
      localStorage.setItem('lyrics_before_edit', this.lyrics);

      this.$router.push({
        name: 'EditLyrics',
      });
    },
    regenerateLyrics() {
      this.$emit('regenerate');
    }
  }
}
</script>

<style scoped>
.btn-save {
  font-weight: 600;
  color: rgb(0, 0, 0);
  background-color: white;
  position: relative;
  padding: 3px;
  padding-left: 30px;
  padding-right: 30px;
  border-radius: 5px;
}

.btn-regenerate {
  font-weight: 600;
  color: white;
  background-color: #3b82f6;
  position: relative;
  padding: 3px;
  padding-left: 30px;
  padding-right: 30px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-regenerate:hover {
  background-color: #2563eb;
}
</style>