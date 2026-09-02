# Artistverse X

Artistverse X is a web application featuring a Vue 3 frontend and a Python Flask backend. It allows users to authenticate via Spotify, analyze music, and generate AI-driven lyrics using Groq.

##  Architecture
- **Frontend**: Vue 3 (Vite) + Nginx (Dockerized)
- **Backend**: Python 3.10 + Flask + Gunicorn (Dockerized)
- **Database**: MariaDB 10.11

---

##  Getting Started (Local Development)

### Prerequisites
- Docker and Docker Compose installed on your local machine.
- A `.env` file containing your secret keys.

### Environment Variables (`.env`)
You MUST create a `.env` file in the root folder (`Artistverse_X`) before starting the project. 
**DO NOT commit the `.env` file to version control. It is explicitly ignored in `.dockerignore` to prevent leakage.**

```env
# Database Credentials
DB_NAME=ArtistverseX
DB_ROOT_PASSWORD=your_secure_db_password

# External APIs
GROQ_API_KEY=gsk_your_groq_api_key
SPOTIPY_CLIENT_ID=your_spotify_client_id
SPOTIPY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://localhost:10690/api/auth/spotify/callback
```

### Running the App Locally
1. Ensure your `.env` file is ready.
2. Run the following command in the terminal:
   ```bash
   docker-compose up -d --build
   ```
3. Access the application:
   - **Frontend**: `http://localhost:10690`
   - **phpMyAdmin**: `http://localhost:10692`

---

##  Production Deployment (Docker Swarm / Portainer)

###  IMPORTANT: Docker Swarm Caching Issue
When updating the stack on Portainer, Docker Swarm aggressively caches images with the `:latest` tag. If you simply press "Update the service", it will likely reuse the old image stored on the server's hard drive instead of pulling your new code.

**How to correctly deploy updates:**
1. Whenever you push new code, **use a new version tag** instead of `latest` (e.g., `v2`, `v3`). You can use the included `build-and-push.ps1` script to easily build and tag your images.
2. Go to Portainer > Stacks > `artistverse` > **Editor**.
3. Change the image tags in the `docker-compose.yml` to match your new version (e.g., `image: lingth/artistverse_x-backend:v2`).
4. Click **Update the stack**. The server will be forced to download the new version because it doesn't exist locally!

### Port Routing Notice
The backend container is **NOT** exposed directly to the outside world. All external traffic hits the Frontend (Nginx) on port `10690`, which then proxies API requests (starting with `/api/`) internally to the Backend on port `5000`.

---

##  Critical Code Details

### 1. Nginx Proxy Configuration (`nginx.conf`)
Inside the Frontend, Nginx acts as a reverse proxy for the Python backend. 
- **Resolver Workaround**: We use `resolver 127.0.0.11 valid=30s;` and a variable (`$backend_upstream`) instead of a direct `proxy_pass http://backend:5000/`. This is **crucial**. If we don't do this, Nginx will crash completely on startup if the Python backend takes too long to connect to the database.
- **URI Rewrite**: Because we use a variable in `proxy_pass`, Nginx forgets to strip the `/api/` prefix. We added a `rewrite ^/api/(.*) /$1 break;` rule to fix this. **Do not remove these lines!**

### 2. Security & `.env` Leaks
Your `.env` file is safe. The `Backend_Artistverse_X/.dockerignore` file contains `.env`, which guarantees that your secret API keys are **never** baked into the public Docker image on Docker Hub. The `.env` file is only read at runtime by the `docker-compose.yml` on your server.
