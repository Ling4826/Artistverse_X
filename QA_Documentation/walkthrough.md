# QA Master Walkthrough & Educational Guide: Artistverse X

## 1. QA Testing Methodology: Functional vs. Non-Functional Testing

As part of the Quality Assurance and Testing team for **Artistverse X**, we evaluated the application across two foundational dimensions of software engineering:

```mermaid
flowchart TD
    A["Artistverse X QA Strategy"] --> B["1. Functional Testing (WHAT it does)"]
    A --> C["2. Non-Functional Testing (HOW WELL it performs)"]
    A --> D["3. Docker Containerization (REPRODUCIBILITY)"]
    
    B --> B1["Positive Testing (Happy Path)"]
    B --> B2["Negative Testing (Validation Errors)"]
    B --> B3["Edge Case Testing (Exceptions & Network Drop)"]
    
    C --> C1["Performance & Load Latency (TTFB = 126ms)"]
    C --> C2["Security & HTTP Headers Audit (HSTS, CSP, X-Frame)"]
    C --> C3["Cross-Device Responsiveness (Desktop/Tablet/Mobile)"]
    C --> C4["Usability & SPA 404 Route Resilience"]

    D --> D1["Frontend Nginx Container (Port 80/8080)"]
    D --> D2["Backend Flask WSGI Container (Port 5005)"]
```

---

## 2. Docker & Docker Compose Containerization Architecture

Artistverse X is fully containerized using Docker and Docker Compose:

- **Backend Container (`artistverse-backend`)**:
  - Python 3.10-slim base image with Gunicorn WSGI server.
  - Automatically loads Environment Keys (`.env`) for Groq Cloud and Spotify OAuth.
- **Frontend Container (`artistverse-frontend`)**:
  - Multi-stage build (`node:20-alpine` build $\rightarrow$ `nginx:alpine` production).
  - Nginx Reverse Proxy handles SPA HTML5 history route fallback and forwards `/api/` requests to `http://backend:5005/`.

### Docker Deployment Command:
```bash
docker-compose up -d --build
```

---

## 3. Deliverables Master Index

### 📄 1. Test Specifications & Reports
1. **Lyrics Generator Functional Spec**: [functional_test_cases_lyrics_generator.md](file:///d:/Artistverse_X/QA_Documentation/functional_test_cases_lyrics_generator.md)
2. **Spotify Auth Functional Spec**: [functional_test_cases_spotify_auth.md](file:///d:/Artistverse_X/QA_Documentation/functional_test_cases_spotify_auth.md)
3. **Chord Progression & MIDI Spec**: [functional_test_cases_chord_progression.md](file:///d:/Artistverse_X/QA_Documentation/functional_test_cases_chord_progression.md)
4. **Song Recommender Spec**: [functional_test_cases_song_recommendation.md](file:///d:/Artistverse_X/QA_Documentation/functional_test_cases_song_recommendation.md)
5. **Search & AI Assistance Spec**: [functional_test_cases_search_ai_assistance.md](file:///d:/Artistverse_X/QA_Documentation/functional_test_cases_search_ai_assistance.md)
6. **Final Functional Test Report**: [final_functional_test_report.md](file:///d:/Artistverse_X/QA_Documentation/final_functional_test_report.md)
7. **Non-Functional Test Cases Spec**: [non_functional_test_cases.md](file:///d:/Artistverse_X/QA_Documentation/non_functional_test_cases.md)
8. **Non-Functional Testing Report (Live Site)**: [non_functional_test_report.md](file:///d:/Artistverse_X/QA_Documentation/non_functional_test_report.md)

### 🎬 2. Live Browser Session Recording
- **Non-Functional Live Site Test Recording**:  
  ![Browser Test Video Session](/C:/Users/ACER/.gemini/antigravity-ide/brain/ea211497-29df-463b-b9df-13fcb9d7d1fc/artiverse_nft_inspection_1788437561772.webp)

---

## 4. Summary of Results

### 🧪 Functional Testing Results (113/113 Passed)
```bash
 Test Files  27 passed (27)
      Tests  113 passed (113)
   Duration  4.38s
```

### ⚡ Non-Functional Testing Results (`https://artiverse.camt.cmu.ac.th/`)
- **Time to First Byte (TTFB)**: `126.6 ms` (Target Benchmark $\le 500\text{ ms}$) $\rightarrow$ **EXCELLENT**
- **Total Load Duration**: `126.7 ms` (Target Benchmark $\le 2500\text{ ms}$) $\rightarrow$ **EXCELLENT**
- **Asset Caching**: 30-day immutable client caching (`max-age=2592000`)
- **Cross-Device Responsiveness**: Verified across Desktop ($1920\times1080$), Tablet ($768\times1024$), and Mobile ($375\times812$)
