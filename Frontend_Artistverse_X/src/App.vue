<template>
  <section id="Navbar" class="fixed top-0 w-full z-50">
    <div class="navbar bg-gradient">
      <div class="navbar-start text-neutral-content">
        <router-link to="/">
          <a class="btn btn-ghost text-2xl">ARTISTVERSE X</a>
        </router-link>        
        <span class="page-name ml-4 text-xl font-semibold">{{ $route.meta.title }}</span>
      </div>
      <div class="navbar-end">
        <!-- Search Button -->
        <button class="btn btn-ghost btn-circle" @click="toggleSearch" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#ffffff"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>        <!-- User Profile Button -->
        <div class="dropdown dropdown-end">
          <button 
            class="btn btn-ghost btn-circle hover:bg-base-200/50" 
            @click="toggleUserMenu" 
            aria-label="User Profile"
            tabindex="0"
          >
            <div v-if="authStore.isAuthenticated && authStore.user" class="avatar">
              <div class="w-10 h-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                <img 
                  v-if="authStore.user.images && authStore.user.images.length > 0" 
                  :src="authStore.user.images[0].url" 
                  :alt="authStore.user.display_name"
                  class="w-full h-full object-cover rounded-full"
                />
                <div v-else class="bg-gradient-to-br from-primary to-secondary text-white rounded-full w-full h-full flex items-center justify-center font-bold text-sm">
                  {{ authStore.user.display_name ? authStore.user.display_name.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
            </div>
            <div v-else class="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-7 w-7 text-white hover:text-primary transition-colors duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />          
              </svg>
              <!-- Login indicator -->
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-pulse"></div>
            </div>
          </button>
            <!-- User Dropdown Menu -->
          <div v-if="showUserDropdown" class="dropdown-content mt-3 z-[60] shadow-xl bg-base-100 rounded-xl w-64 overflow-hidden">
            <!-- Not Authenticated State -->
            <div v-if="!authStore.isAuthenticated" class="p-6 text-center">
              <div class="mb-4">
                <div class="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.54-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-lg text-base-content">Welcome to Artistverse X</h3>
                <p class="text-sm text-base-content/70 mt-1">Connect with Spotify to unlock personalized features</p>
              </div>
              <button @click="loginWithSpotify" :disabled="authStore.isLoading" 
                class="btn btn-primary w-full bg-gradient-to-r from-green-500 to-green-600 border-none text-white font-medium">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.54-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                {{ authStore.isLoading ? 'Connecting...' : 'Connect with Spotify' }}
              </button>
            </div>            <!-- Authenticated State -->
            <div v-else class="p-6">
              <!-- Profile Section -->
              <div class="flex items-center space-x-4 mb-6">
                <div class="avatar">
                  <div class="w-12 h-12 rounded-full ring-2 ring-primary/20">
                    <img 
                      v-if="authStore.user.images && authStore.user.images.length > 0" 
                      :src="authStore.user.images[0].url" 
                      :alt="authStore.user.display_name"
                      class="w-full h-full object-cover rounded-full"
                    />
                    <div v-else class="bg-gradient-to-br from-primary to-secondary w-full h-full flex items-center justify-center text-white text-lg font-bold rounded-full">
                      {{ authStore.user.display_name ? authStore.user.display_name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-base text-base-content truncate">
                    {{ authStore.user.display_name || 'Spotify User' }}
                  </h3>
                  <p class="text-sm text-base-content/70 truncate">{{ authStore.user.email }}</p>
                </div>
              </div>

              <!-- Sign Out Button -->
              <button @click="logout" 
                class="flex items-center justify-center w-full px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors border border-error/20 hover:border-error/40">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <button 
            tabindex="0" 
            class="btn btn-ghost btn-circle"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#ffffff"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>            <ul class="menu menu-lg dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-70">            <router-link to="/"
              ><li><a>Homepage</a></li></router-link
            >            <router-link to="/layoutview"
              ><li><a>Lyrics Generate</a></li></router-link
            >
            <router-link to="/recommend"
              ><li><a>Camera Mood</a></li></router-link
            >
            <router-link to="/progressiondetail"
              ><li><a>Chord Progression</a></li></router-link
            >
            <router-link to="/ai-assistance"
              ><li><a>AI Analysis</a></li></router-link
            >
          </ul>
        </div>
      </div>
    </div>
  </section>
  <RouterView></RouterView>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const showUserDropdown = ref(false)

    onMounted(async () => {
      // Initialize auth from localStorage
      authStore.initializeAuth()
      
      // Check if we're returning from Spotify callback
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      
      if (error) {
        console.error('Spotify auth error:', error)
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
      
      if (authStore.accessToken) {
        // Ensure token is valid and refresh if needed
        await authStore.ensureValidToken()
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        const dropdown = document.querySelector('.dropdown-end')
        if (dropdown && !dropdown.contains(event.target)) {
          showUserDropdown.value = false
        }
      })
    })

    return {
      authStore,
      showUserDropdown
    }
  },
  methods: {
    toggleSearch() {
      // Navigate to search page
      this.$router.push('/search');
    },
    toggleUserMenu() {
      // Toggle user dropdown
      this.showUserDropdown = !this.showUserDropdown
    },
    async loginWithSpotify() {
      try {
        await this.authStore.login()
      } catch (error) {
        console.error('Login failed:', error)
        // You could show a toast notification here
      }
    },
    logout() {
      this.authStore.logout()
      this.showUserDropdown = false
      // Redirect to homepage after logout
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0));
}

.navbar-start .btn-ghost {
  color: white;
  font-weight: bold;
  letter-spacing: 1px;
}

.navbar-start .btn-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-name {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.navbar-end .btn-ghost {
  color: white;
  transition: all 0.3s ease;
}

.navbar-end .btn-ghost:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.navbar-end .btn-ghost:active {
  transform: scale(0.95);
}

/* User Profile Dropdown Styles */
.dropdown-content {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  animation: slideDown 0.3s ease-out;
  transform-origin: top right;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Profile stats styling */
.stat-item {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* Button hover effects */
.dropdown-content button {
  transition: all 0.2s ease;
}

.dropdown-content button:hover {
  transform: translateX(4px);
}

/* Badge animation */
.badge-success {
  animation: pulse-success 2s infinite;
}

@keyframes pulse-success {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  }
}

/* Avatar ring animation */
.avatar .ring-2 {
  transition: all 0.3s ease;
}

.avatar:hover .ring-2 {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Login indicator animation */
@keyframes pulse-error {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse-error 1.5s ease-in-out infinite;
}

.dropdown-content a {
  color: #333;
  transition: all 0.3s ease;
}

.dropdown-content a:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000;
}

/* Animation for buttons */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.btn-circle:focus {
  animation: pulse 0.3s ease-in-out;
}

/* Make sure icons are properly aligned */
.btn-circle svg {
  display: block;
  margin: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-name {
    display: none;
  }
  
  .navbar-start .btn-ghost {
    font-size: 1.2rem;
  }

  .dropdown-content {
    width: 280px !important;
    right: 0;
  }
}
</style>
