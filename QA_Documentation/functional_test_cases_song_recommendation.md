# QA Functional Test Specification: Song Recommendation Engine

## 1. Module Overview
This module detects user facial emotion via camera feed (`navigator.mediaDevices.getUserMedia`), sends image frame data to backend model `/api/detect-emotion`, and parses Spotify song recommendation items (`RecommendSongView.vue`).

---

## 2. Functional Test Cases Specification Table

### Component: `RecommendSongView.vue`

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-REC-01** | Positive | Camera permission granted on component mount | Page loaded at `/recommend` | 1. Browser prompts user for camera access<br>2. User clicks "Allow" (`getUserMedia` resolves Stream) | 1. `hasCameraPermission` set to `true`<br>2. `srcObject` attached to video feed element |
| **FTC-REC-02** | Positive | Capture emotion & render parsed song recommendation list | Camera active | 1. Trigger `captureEmotion()`<br>2. POST `/api/detect-emotion` returns `{emotion: "Happy", songs: '[{"Name":"Sunny Day","Artist":"Band","Album":"Summer","Image":"img.jpg","Spotify_link":"http"}]'}` | 1. `emotion` state set to `"Happy"`<br>2. `data` parsed into song list array<br>3. Cards rendered with image, title, artist, and Spotify link |
| **FTC-REC-03** | Positive | Reset recommendation state and timer | Detection completed | 1. Click "Reset" button (`reset()`) | 1. `data` emptied (`[]`)<br>2. `emotion`, `countDown`, `errorMessage` cleared to `null`<br>3. `showResetButton` set to `false` |
| **FTC-REC-04** | Negative | Camera permission denied by user | Page loaded | 1. Browser prompts for camera access<br>2. User rejects permission (`getUserMedia` rejects Error) | 1. `hasCameraPermission` set to `false`<br>2. Red warning message rendered: "*Camera access is required to detect your mood..." |
| **FTC-REC-05** | Negative | Emotion could not be detected from captured frame | Camera active | 1. Trigger `captureEmotion()`<br>2. POST `/api/detect-emotion` returns `{error: "No face detected"}` | 1. `errorMessage` set to "No face detected"<br>2. Recommendation card rendering halted |
| **FTC-REC-06** | Edge Case | Capture emotion when video element is null/unready | Video ref missing | 1. Call `captureEmotion()` when `$refs.videoElement` is undefined | 1. Method returns early<br>2. `errorMessage` set to "Camera not ready" |
| **FTC-REC-07** | Edge Case | Clean up active media tracks on component unmount | Stream actively playing | 1. Unmount `RecommendSongView` component | 1. `beforeUnmount` hook retrieves active stream tracks<br>2. Calls `track.stop()` for all video tracks |
