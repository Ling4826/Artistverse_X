<template>
  <div class="body">
    <div class="center-container">
      <div class="topic animate__animated animate__fadeInDown animate__delay-1s">
        <h1>Welcome to AI Assistance</h1>
        <p>This interface provides music suggestions based on lyrics you provide.</p>
        <p>You must put only lyrics of your lyrics in here</p>
      </div>

      <div class="chat-container animate__animated animate__fadeInDown animate__delay-1s">
        <div class="user-block">
          <h2>Your Lyrics</h2>
          <div class="chat-messages">
            <div
              v-for="message in userMessages"
              :key="message.id"
              class="message user-message"
            >
              {{ message.content }}
            </div>
          </div>
        </div>

        <div class="ai-block">
          <h2>Suggestion</h2>
          <div class="chat-messages">
            <div
              v-for="message in aiMessages"
              :key="message.id"
              class="message ai-message"
            >
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="chat-input-container">
        <div class="chat-input animate__animated animate__fadeInUp animate__delay-2s">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type a message..."
            class="input-field"
          />
          <button @click="sendMessage" class="send-button">Send</button>
        </div>
      </div>

      <div class="save-button-container animate__animated animate__fadeInUp animate__delay-2s">
        <button @click="saveAnalyzedLyrics" class="save-button">Save Analyzed Lyrics</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2"; 

export default {
  data() {
    return {
      messages: [],
      userInput: '',
      errorMessage: '' 
    };
  },
  computed: {
    userMessages() {
      return this.messages.filter(message => message.role === 'user');
    },
    aiMessages() {
      return this.messages.filter(message => message.role === 'ai');
    }
  },
  methods: {
    sendMessage() {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Internet no connection",
          text: "Unable to analyze lyrics",
          customClass: {
            popup: 'swal2-top-center',
          },
          position: 'top'
        });
        return;
      }

      if (this.userInput.trim() === '') {
        this.errorMessage = 'The lyrics field cannot be empty. Enter your lyrics to proceed.';
        return;
      }

      this.errorMessage = '';

      this.messages.push({ id: Date.now(), role: 'user', content: this.userInput });

      this.sendUserMessageToServer();

      this.userInput = '';
    },
    sendUserMessageToServer() {
      fetch('/api/ai-assistance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lyrics: this.userInput })
      })
        .then((response) => response.json())
        .then((data) => {
          this.messages.push({ id: Date.now(), role: 'ai', content: data.analysis });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    },
    saveAnalyzedLyrics() {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Internet no connection",
          text: "Unable to save analyze lyrics",
          customClass: {
            popup: 'swal2-top-center',
          },
          position: 'top'
        });
        return;
      }

      const analyzedLyrics = this.aiMessages.map(message => message.content).join('\n\n');

      if (analyzedLyrics.trim() === '') {
        Swal.fire({
          icon: "error",
          title: "No Analyzed Lyrics",
          text: "No analyzed lyrics to save.",
          customClass: {
            popup: 'swal2-top-center',
          },
          position: 'top'
        });
        return;
      }

      const blob = new Blob([analyzedLyrics], { type: 'text/plain' });
      
      const link = document.createElement('a');
      
      link.download = 'analyzed_lyrics.txt';
      
      link.href = window.URL.createObjectURL(blob);
      
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Avalors Personal Use';
  font-size: 40px;
  letter-spacing: 5px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  position: relative;
}

.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1b1b1b;
}

.topic {
  text-align: center;
  max-width: 600px;
  margin-bottom: 20px;
}

.topic h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.topic p {
  font-size: 1.2rem;
  color: #666;
}

.chat-container {
  display: flex; 
  width: 80%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px;
  height: 50vh; 
}

.user-block, .ai-block {
  flex: 1;
  padding: 10px;
  overflow-y: auto; 
  max-height: 100%; 
  font-family: 'Avalors Personal Use';
  letter-spacing: 2px;
  color: #020202;
  text-shadow: 0 0 4px white;
  position: relative;
}

.user-block {
  border-right: 1px solid #eee;
}

h2 {
  text-align: center;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.chat-messages {
  max-height: 50vh;
  overflow-y: auto; 
  padding: 10px;
  word-wrap: break-word; 
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  word-break: break-word; 
}

.user-message {
  background-color: #dff2fc;
  align-self: flex-end;
}

.ai-message {
  background-color: #f0f0f0;
  align-self: flex-start;
}

.chat-input-container {
  width: 80%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.chat-input {
  display: flex;
  align-items: center;
  width: 100%;
}

.input-field {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px; 
}

.send-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}

.save-button-container {
  width: 80%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.save-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
