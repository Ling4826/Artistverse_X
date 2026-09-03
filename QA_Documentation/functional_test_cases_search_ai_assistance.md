# QA Functional Test Specification: Search & AI Assistance

## 1. Module Overview
This module handles database search queries by song name, artist, or genre (`useSearchStore.js`, `SearchView.vue`), result sorting/filtering, search history persistence, and AI-driven songwriting assistance analysis (`AssisatanceView.vue`).

---

## 2. Functional Test Cases Specification Table

### Component: `useSearchStore.js`, `SearchView.vue`, and `AssisatanceView.vue`

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-SEARCH-01** | Positive | Perform query search by song name & store history | Page loaded | 1. Set `query` = "Shape of You", `field` = "name"<br>2. Call `performSearch()` | 1. `searchService.search()` called<br>2. Results populated into `results` array<br>3. Search entry added to `searchHistory` and `localStorage` |
| **FTC-SEARCH-02** | Positive | Sort search results by Name or Relevance | Search results populated | 1. Call `setSortBy('name', 'asc')`<br>2. Check `sortedResults` computed property | 1. Results dynamically sorted alphabetically A-Z<br>2. `sortDirection` set to `'asc'` |
| **FTC-SEARCH-03** | Positive | Select item to view detail modal & clear selection | Search results visible | 1. Call `selectItem(songObject)`<br>2. Call `closeModal()` | 1. `selectedItem` populated $\rightarrow$ detail modal opens<br>2. `closeModal()` clears `selectedItem` to `null` |
| **FTC-SEARCH-04** | Negative | Clear search history via `clearHistory()` | `searchHistory` contains entries | 1. Call `searchStore.clearHistory()` | 1. `searchHistory` array emptied (`[]`)<br>2. Key `'searchHistory'` removed from `localStorage` |
| **FTC-AI-01** | Positive | Send valid lyrics for AI producer analysis | Online state (`navigator.onLine` = `true`) | 1. Input `userInput` = "Lost in the night..."<br>2. Click "Analyze" (`sendMessage()`) | 1. User message appended to `userMessages`<br>2. POST `/api/ai-assistance` executed<br>3. AI response appended to `aiMessages` |
| **FTC-AI-02** | Negative | Submit empty lyrics input in AI assistance | Page loaded | 1. Set `userInput` = "   "<br>2. Click "Analyze" (`sendMessage()`) | 1. Request prevented<br>2. `errorMessage` set to "The lyrics field cannot be empty. Enter your lyrics to proceed." |
| **FTC-AI-03** | Edge Case | Offline connectivity check when sending message or saving | `navigator.onLine` = `false` | 1. Disconnect network (`navigator.onLine` = `false`)<br>2. Click "Analyze" or "Save Producer Notes" | 1. SweetAlert2 modal triggered with title "Internet no connection"<br>2. API call prevented |
| **FTC-AI-04** | Edge Case | Save analyzed producer notes when no notes exist | `aiMessages` empty | 1. Click "Save Producer Notes" (`saveAnalyzedLyrics()`) | 1. SweetAlert2 modal triggered with title "No Analyzed Lyrics"<br>2. File download prevented |
