# QA Functional Test Specification: Lyrics Generator Module

## 1. QA Concepts & Test Design Strategy

In Software Testing & QA, functional testing ensures that the application behaves strictly according to the specified requirements. We categorize functional test cases into three primary types:

| Test Category | Description & Objective | Example in Lyrics Generator |
| :--- | :--- | :--- |
| **Positive Test (Happy Path)** | Testing with valid inputs under normal operating conditions to verify that the system produces expected output. | Filling valid topic "Love", selecting Genre "Pop" and Language "English", clicking Generate $\rightarrow$ API returns lyrics. |
| **Negative Test** | Testing with invalid inputs, missing fields, or system failures to verify that the application handles errors gracefully without crashing. | Submitting form without selecting Genre $\rightarrow$ system blocks API request and displays validation error "Please select a genre." |
| **Edge Case Test** | Testing at the extreme boundaries or unusual combinations of operational parameters. | Submitting whitespace-only input ("   "), network disconnection ("Failed to fetch"), or switching views with pre-saved localStorage lyrics. |

---

## 2. Functional Test Cases Suite

### Module 1: Lyrics Generator by Genre (`LyricsGeneratorGenreView`)

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-GEN-01** | Positive | Generate lyrics with valid topic, genre, and language | Page loaded at `/generate-lyrics-genre` | 1. Input prompt = "Summer Beach"<br>2. Select Genre = "Pop"<br>3. Select Language = "English"<br>4. Click "Generate" | 1. `loading` state set to `true`<br>2. POST `/api/generate-lyrics-genre` sent with payload `{prompt: "Summer Beach", genre: "Pop", language: "English"}`<br>3. Returned lyrics displayed in result container |
| **FTC-GEN-02** | Negative | Submit form with empty topic (Prompt validation) | Page loaded | 1. Leave Prompt empty ("")<br>2. Select Genre = "Pop", Language = "Thai"<br>3. Click "Generate" | 1. Validation fails (`validateForm()` = `false`)<br>2. `errors.prompt` displays "Please input a lyric topic."<br>3. API request is NOT executed |
| **FTC-GEN-03** | Negative | Submit form with empty Genre selection | Page loaded | 1. Input prompt = "Heartbreak"<br>2. Select Genre = ""<br>3. Select Language = "English"<br>4. Click "Generate" | 1. `errors.genre` displays "Please select a genre."<br>2. API request is NOT executed |
| **FTC-GEN-04** | Negative | Submit form with empty Language selection | Page loaded | 1. Input prompt = "Freedom"<br>2. Select Genre = "Rock"<br>3. Select Language = ""<br>4. Click "Generate" | 1. `errors.language` displays "Please select a language."<br>2. API request is NOT executed |
| **FTC-GEN-05** | Edge Case | Network failure / Internet disconnected during generation | Backend server unreachable | 1. Input prompt = "Rainy Day", Genre = "Indie", Language = "Thai"<br>2. Click "Generate"<br>3. Fetch throws `Failed to fetch` error | 1. Catch block handles error<br>2. SweetAlert2 error modal displayed with title "Internet no connection"<br>3. `loading` state reset to `false` |
| **FTC-GEN-06** | Edge Case | Load view with pre-edited lyrics in `localStorage` | `localStorage.getItem('lyrics_after_edit')` contains text | 1. Open `/generate-lyrics-genre`<br>2. Check initial `lyrics` state | 1. `lyrics` initialized with text from `localStorage`<br>2. `lyrics_after_edit` item removed from `localStorage` |

---

### Module 2: Lyrics Generator by Mood (`LyricsGeneratorMood`)

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-MOOD-01** | Positive | Generate lyrics with valid topic, mood, and language | Page loaded at `/generate-lyrics-mood` | 1. Input prompt = "Midnight Drive"<br>2. Select Mood = "chill"<br>3. Select Language = "English"<br>4. Click "Generate" | 1. POST `/api/generate-lyrics-mood` sent with payload `{prompt: "Midnight Drive", mood: "chill", language: "English"}`<br>2. Returned lyrics rendered in result element |
| **FTC-MOOD-02** | Negative | Submit form without selecting Mood | Page loaded | 1. Input prompt = "Night Sky"<br>2. Select Mood = ""<br>3. Select Language = "Thai"<br>4. Click "Generate" | 1. `errors.mood` displays "Please select a mood."<br>2. Form submission halted |
| **FTC-MOOD-03** | Edge Case | Generate lyrics with special characters in topic | Page loaded | 1. Input prompt = "Cyberpunk 2077! #@$%^&*()"<br>2. Select Mood = "mysterious", Language = "English"<br>3. Click "Generate" | 1. Payload cleanly JSON-encoded<br>2. API handles input without UI crash |

---

### Module 3: Lyrics Generator by Artist (`LyricsGeneratorArtistView`)

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-ART-01** | Positive | Generate lyrics in the style of a specific artist | Page loaded at `/generate-lyrics-artist` | 1. Input prompt = "Acoustic Sunset"<br>2. Select Artist = "Ed Sheeran"<br>3. Select Language = "English"<br>4. Click "Generate" | 1. POST `/api/generate-lyrics-artist` sent with payload `{prompt: "Acoustic Sunset", artist: "Ed Sheeran", language: "English"}`<br>2. Returned lyrics displayed |
| **FTC-ART-02** | Negative | Submit form without selecting Artist | Page loaded | 1. Input prompt = "Song about space"<br>2. Select Artist = ""<br>3. Select Language = "English"<br>4. Click "Generate" | 1. `errors.artist` displays error message<br>2. API call prevented |
| **FTC-ART-03** | Edge Case | Server returns 500 internal server error | Backend API fails | 1. Valid inputs provided<br>2. Click "Generate"<br>3. API returns HTTP 500 response | 1. System checks `!response.ok`<br>2. Graceful error handling without crashing UI state |
