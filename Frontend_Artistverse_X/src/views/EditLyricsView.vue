<template>
  <div class="min-h-screen bg-black text-white p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2 text-center">Edit Lyrics</h1>
      <p class="text-gray-400 text-center">Compare and edit your lyrics</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Original Lyrics (Read-only) -->
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold mb-3 text-blue-400">Original Version</h2>
        <div class="bg-gray-800 border border-gray-600 rounded-md p-4 h-[400px] overflow-y-auto">
          <pre class="text-gray-300 whitespace-pre-wrap font-mono text-sm">{{ originalLyrics }}</pre>
        </div>
      </div>

      <!-- Editable Lyrics -->
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold mb-3 text-green-400">Edit Version</h2>
        <textarea
          v-model="editableLyrics"
          :maxlength="1000"
          class="w-full h-[400px] text-white bg-gray-900 border border-gray-600 p-4 rounded-md text-sm font-mono resize-none focus:outline-none focus:border-green-500"
          placeholder="Edit your lyrics here..."
        ></textarea>
        <div class="mt-2 text-sm text-gray-400">
          {{ editableLyrics.length }}/1000 characters
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <button
        @click="resetToOriginal"
        class="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors"
      >
        <i class="fas fa-undo mr-2"></i>
        Reset
      </button>
      <button
        @click="saveToState"
        class="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
        :disabled="!isValid"
      >
        <i class="fas fa-save mr-2"></i>
        Save Changes
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      originalLyrics: '',
      editableLyrics: '',
    };
  },
  computed: {
    isValid() {
      return this.editableLyrics.trim().length > 0 &&
        this.editableLyrics.length <= 1000;
    },
  },
  mounted() {
    // Load from localStorage
    const saved = localStorage.getItem('lyrics_before_edit');
    if (saved) {
      this.originalLyrics = saved;
      this.editableLyrics = saved;
    }
  },
  methods: {
    resetToOriginal() {
      this.editableLyrics = this.originalLyrics;
    },
    saveToState() {
      localStorage.setItem('lyrics_after_edit', this.editableLyrics);

      // Navigate back
      this.$router.push({
        name: 'generate-lyrics-genre'
      });
    }
  }
}
</script>
