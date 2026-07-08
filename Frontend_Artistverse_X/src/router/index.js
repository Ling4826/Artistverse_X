import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../views/HomepageView.vue'
import LyricsGeneratorGenreView from '../views/LyricsGeneratorGenreView.vue'
import LyricsGeneratorMoodView from '@/views/LyricsGeneratorMood.vue'
import LyricsGeneratorArtistView from '@/views/LyricsGeneratorArtistView.vue'
import LayoutView from '../views/LayoutView.vue'
import RecommendSongView from '@/views/RecommendSongView.vue'
// import GuitarChordView from '@/views/GuitarChordView.vue'
// import PianoChordView from '@/views/PianoChordView.vue'
// import ChordProgressionView from'@/views/ChordProgressionView.vue'
import ProgressionView from '@/views/ProgressionView.vue'
import ProgressionDetailView from '@/views/ProgressionDetailView.vue'
import AssisatanceView from '@/views/AssisatanceView.vue'
import MelodyView from '../views/MelodyView.vue'
import SearchView from '../views/SearchView.vue'
import SpotifyCallbackView from '../views/SpotifyCallbackView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Homepage',
      component: Homepage
    },
    {
      path: '/generate-lyrics-genre',
      name: 'generate-lyrics-genre',
      component: LyricsGeneratorGenreView
    },
    {
      path: '/generate-lyrics-mood',
      name: 'generate-lyrics-mood',
      component: LyricsGeneratorMoodView
    },
    {
      path: '/generate-lyrics-artist',
      name: 'generate-lyrics-artist',
      component: LyricsGeneratorArtistView
    },
    {
      path: '/layoutview',
      name: 'layoutview',
      component: LayoutView
    },

    {
      path: '/ai-assistance',
      name: 'ai-assistance',
      component: AssisatanceView
    },    {
      path: '/recommend',
      name: 'recommend',
      component: RecommendSongView
    },
    // {
    //   path: '/guitarchord',
    //   name: 'guitarchord',
    //   component: GuitarChordView
    // },
    // {
    //   path: '/pianochord',
    //   name: 'pianochord',
    //   component: PianoChordView
    // },
    // {
    //   path: '/chordprogression',
    //   name: 'chordprogression',
    //   component: ChordProgressionView
    // },
    {
      path: '/progression',
      name: 'progression',
      component: ProgressionView
    },
    {
      path: '/progressiondetail',
      name: 'progressiondetail',
      component: ProgressionDetailView
    },
    {
      path: '/melody',
      name: 'melody',
      component: MelodyView
    },    {
      path: '/edit-lyrics',
      name: 'EditLyrics',
      component: () => import('@/views/EditLyricsView.vue'),
    },    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/callback',
      name: 'spotify-callback',
      component: SpotifyCallbackView
    },  ]
  
})

export default router
