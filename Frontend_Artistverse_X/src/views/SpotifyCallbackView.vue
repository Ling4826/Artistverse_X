<template>
  <div class="callback-page">
    <div class="callback-container">
      <div class="loading-spinner" v-if="isLoading">
        <div class="spinner"></div>
        <h2>Connecting to Spotify...</h2>
        <p>Please wait while we complete your login</p>
      </div>
      
      <div class="error-message" v-else-if="error">
        <div class="error-icon">❌</div>
        <h2>Login Failed</h2>
        <p>{{ error }}</p>
        <button @click="goHome" class="retry-btn">Go to Homepage</button>
      </div>
      
      <div class="success-message" v-else-if="success">
        <div class="success-icon">✅</div>
        <h2>Login Successful!</h2>
        <p>Welcome {{ authStore.user?.display_name }}! Redirecting...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SpotifyCallbackView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isLoading = ref(true)
    const error = ref(null)
    const success = ref(false)

    onMounted(async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const errorParam = urlParams.get('error')

        if (errorParam) {
          error.value = `Spotify authorization error: ${errorParam}`
          isLoading.value = false
          return
        }

        if (!code) {
          error.value = 'No authorization code received from Spotify'
          isLoading.value = false
          return
        }

        // Handle callback
        await authStore.handleCallback(code)
        // ลบ code ออกจาก URL ทันทีหลังแลก token
        window.history.replaceState({}, document.title, window.location.pathname)
        success.value = true
        isLoading.value = false

        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)

      } catch (err) {
        console.error('Callback error:', err)
        error.value = err.message || 'Failed to complete login'
        isLoading.value = false
      }
    })

    const goHome = () => {
      router.push('/')
    }

    return {
      authStore,
      isLoading,
      error,
      success,
      goHome
    }
  }
}
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1b1b1b 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.callback-container {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  backdrop-filter: blur(15px);
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message,
.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error-icon,
.success-icon {
  font-size: 3rem;
}

h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

p {
  font-size: 1.1rem;
  color: #cccccc;
  margin: 0;
  line-height: 1.6;
}

.retry-btn {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
  background: linear-gradient(135deg, #1ed760 0%, #1db954 100%);
}

@media (max-width: 480px) {
  .callback-container {
    padding: 40px 20px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  p {
    font-size: 1rem;
  }
}
</style>
