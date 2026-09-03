# Software Quality Assurance & Functional Test Report

**Project Title:** Artistverse X - Web Application  
**Course:** Software Testing and Quality Assurance  
**Testing Framework:** Vitest v3.2.4 with `@vue/test-utils` and JSDOM  
**Date:** September 3, 2026  
**Author:** QA & Testing Team  

---

## 1. Executive Summary

This report presents the functional testing results for **Artistverse X**, a Vue 3 web application integrated with a Python Flask backend. The objective of this testing phase was to verify that all major features function correctly according to business requirements, handle invalid user input gracefully, and maintain stability under edge-case conditions.

A total of **27 test suites** containing **113 individual test cases** were executed automatically using Vitest. All test cases passed with a **100% success rate**.

---

## 2. Test Environment & Setup

- **Frontend Framework:** Vue 3 (Vite build tool), Pinia Store, Vue Router
- **Test Runner:** Vitest (`npx vitest run`)
- **DOM Simulation:** JSDOM
- **Mocking Library:** Vitest Spies & Mocks (`vi.fn()`, `vi.mock()`, `vi.spyOn()`)
- **Assertion Style:** BDD style (`expect(...).toBe(...)`, `expect(...).toEqual(...)`)

---

## 3. Test Design Methodology

Our team categorized functional test cases into three primary types:

1. **Positive Testing (Happy Path):**  
   Validates normal application workflows with valid inputs to confirm expected behavior (e.g., submitting valid prompt/genre to generate lyrics, successful Spotify OAuth code exchange, generating valid binary MIDI files).

2. **Negative Testing (Validation & Error Handling):**  
   Validates system behavior when users provide incomplete or invalid data (e.g., submitting blank forms, missing OAuth codes, camera permission denied by user).

3. **Edge Case Testing (Boundary & System Exceptions):**  
   Evaluates application resilience in unusual scenarios (e.g., offline network status `navigator.onLine = false`, malformed JSON stored in `localStorage`, out-of-range tempo/bar values).

---

## 4. Test Results by Module

### 4.1 Module 1: Lyrics Generator (`LyricsGenerator*.vue`)
- **Test File:** `src/tests/UTC-29.test.js` (8 tests)
- **Status:** PASSED (8/8)
- **Key Validation Points:**
  - Form validation blocks API calls if Topic, Genre, or Language is missing.
  - Successful API response populates the result lyrics container.
  - SweetAlert modal is triggered on network fetch error (`Failed to fetch`).
  - Pre-edited lyrics are restored from `localStorage` on component mount.

### 4.2 Module 2: Spotify Authentication & OAuth Callback (`SpotifyCallbackView.vue`, `auth.js`)
- **Test File:** `src/tests/UTC-30.test.js` (9 tests)
- **Status:** PASSED (9/9)
- **Key Validation Points:**
  - URL parameter `code` exchange triggers `authStore.handleCallback()` and stores user tokens.
  - URL parameter `error=access_denied` correctly displays "Login Failed" message.
  - `isTokenExpired` computed getter correctly detects expired timestamps.
  - Malformed JSON in `localStorage` is caught gracefully without breaking the store.

### 4.3 Module 3: Chord Progression & MIDI Engine (`ProgressionView.vue`, `MidiService.js`)
- **Test File:** `src/tests/UTC-31.test.js` (9 tests)
- **Status:** PASSED (9/9)
- **Key Validation Points:**
  - Key transposition (`selectProgression("1-5-6-4", "C")`) outputs correct chords `["C", "G", "Am", "F"]`.
  - Custom beat pattern mapping updates `chordBarsDisplay` dynamically.
  - MIDI generator creates valid `Uint8Array` binary files starting with the standard `MThd` header.
  - Watcher clamps `selectedBars` inputs to the valid range ($1 \le \text{bars} \le 32$).

### 4.4 Module 4: Emotion Song Recommender Engine (`RecommendSongView.vue`)
- **Test File:** `src/tests/UTC-32.test.js` (7 tests)
- **Status:** PASSED (7/7)
- **Key Validation Points:**
  - Handles camera permission states (`getUserMedia` granted vs. denied).
  - Encodes video frame to Base64 image and parses Spotify recommendation JSON response.
  - `reset()` method cleanly restores all component state variables to default values.

### 4.5 Module 5: Search Engine & AI Assistance (`SearchView.vue`, `useSearchStore.js`, `AssisatanceView.vue`)
- **Test File:** `src/tests/UTC-33.test.js` (8 tests)
- **Status:** PASSED (8/8)
- **Key Validation Points:**
  - Multi-field search (`name`, `artists`, `genres`) and dynamic sorting (`sortedResults`).
  - Search history array management and `clearHistory()` persistence.
  - Empty lyrics input validation message in AI Producer Assistant.
  - Offline network detection (`navigator.onLine = false`) triggers connection error warning.

### 4.6 Existing Core Unit Tests (`UTC-01` to `UTC-28`)
- **Test Files:** `src/tests/UTC-01.test.js` through `UTC-28.test.js` (72 tests)
- **Status:** PASSED (72/72)
- **Key Validation Points:**
  - All existing components, audio playback routines, and relative API routes (`/api/auth/spotify/...`) pass without assertion failures.

---

## 5. Overall Execution Summary

| Test Suite File | Tested Component / Store | Total Cases | Passed | Failed | Pass Rate |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `UTC-01` - `UTC-15` | Core Components & Audio Helpers | 44 | 44 | 0 | 100% |
| `UTC-21` - `UTC-24` | Auth Store & Token Refresher | 18 | 18 | 0 | 100% |
| `UTC-27` - `UTC-28` | Helper UI Components | 10 | 10 | 0 | 100% |
| `UTC-29.test.js` | Lyrics Generator Views | 8 | 8 | 0 | 100% |
| `UTC-30.test.js` | Spotify OAuth Callback Flow | 9 | 9 | 0 | 100% |
| `UTC-31.test.js` | Chord Progression & MIDI Service | 9 | 9 | 0 | 100% |
| `UTC-32.test.js` | Emotion Song Recommender | 7 | 7 | 0 | 100% |
| `UTC-33.test.js` | Search Engine & AI Assistance | 8 | 8 | 0 | 100% |
| **TOTAL** | **Entire Application Suite** | **113** | **113** | **0** | **100%** |

- **Execution Duration:** 4.38 seconds
- **Overall Result:** SUCCESS (0 Errors / 0 Failures)

---

## 6. Conclusion & Recommendations

The automated test suite confirms that the **Artistverse X** application meets all specified functional requirements. The UI handles input validation cleanly, manages state persistence reliably across sessions, and gracefully handles network failure cases.

**Recommendations for Future Enhancements:**
1. Integrate End-to-End (E2E) browser automation tests using Cypress or Playwright for full user journey verification.
2. Add automated continuous integration (CI) pipeline execution via GitHub Actions on every pull request.
