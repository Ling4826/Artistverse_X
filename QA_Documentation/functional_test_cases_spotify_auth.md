# QA Functional Test Specification: Spotify Authentication & OAuth Callback

## 1. Module Overview
This module handles Spotify OAuth 2.0 user authentication flow, authorization code exchange, access token refresh, profile loading, and local state persistence via Pinia Store (`auth.js`) and Callback View (`SpotifyCallbackView.vue`).

> **Note:** The Spotify login button has been removed from the UI, and song recommendations now load without user login. The auth store, callback view and their unit tests are unchanged and still pass.

---

## 2. Functional Test Cases Specification Table

### Component: `SpotifyCallbackView.vue` & `auth` Store

| Test ID | Category | Scenario / Description | Pre-conditions | Test Steps & Input Data | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FTC-AUTH-01** | Positive | Successful OAuth callback code exchange & login redirect | Spotify redirects user back to `/callback?code=VALID_CODE` | 1. Mount `SpotifyCallbackView`<br>2. Read `code` parameter from URL<br>3. Call `authStore.handleCallback("VALID_CODE")` | 1. API GET `/api/auth/spotify/callback?code=VALID_CODE` executed<br>2. `setAuth()` populates user & tokens in state and `localStorage`<br>3. `success` state set to `true`<br>4. URL query params cleared via `replaceState`<br>5. Router redirects to `/` after 2 seconds |
| **FTC-AUTH-02** | Negative | Spotify authorization error in query parameters | User cancels Spotify prompt $\rightarrow$ `/callback?error=access_denied` | 1. Mount `SpotifyCallbackView`<br>2. Read `error` parameter from URL | 1. `isLoading` set to `false`<br>2. `error` state displays "Spotify authorization error: access_denied"<br>3. Error container rendered with "Go to Homepage" button |
| **FTC-AUTH-03** | Negative | Missing authorization code in callback URL | Direct navigation to `/callback` without parameters | 1. Mount `SpotifyCallbackView`<br>2. URL search params empty | 1. `error` state displays "No authorization code received from Spotify"<br>2. `isLoading` set to `false`<br>3. Callback request prevented |
| **FTC-AUTH-04** | Negative | Backend API failure during code exchange | Backend returns `{success: false, error: "Invalid code"}` | 1. URL contains `?code=INVALID_CODE`<br>2. API returns failure payload | 1. `handleCallback()` throws Error<br>2. `error` state set to "Invalid code"<br>3. User UI shows "Login Failed" |
| **FTC-AUTH-05** | Edge Case | Access Token expiration calculation (`isTokenExpired`) | `expiresAt` stored in state | 1. Set `expiresAt` = past timestamp (e.g. current time - 100s)<br>2. Check `isTokenExpired` getter | 1. `isTokenExpired` evaluates to `true`<br>2. `ensureValidToken()` automatically triggers `refreshAccessToken()` |
| **FTC-AUTH-06** | Edge Case | Refresh token process when refresh token is missing | `refreshToken` state is `null` | 1. Execute `refreshAccessToken()` with `refreshToken` = `null` | 1. Function returns `false`<br>2. `clearAuth()` cleans all tokens and user data from `localStorage` |
| **FTC-AUTH-07** | Edge Case | Restore corrupted user state from `localStorage` | `localStorage.getItem('spotify_user')` contains invalid JSON `"{broken_json"` | 1. Call `initializeAuth()` | 1. JSON parse exception caught<br>2. `clearAuth()` cleans up invalid storage cleanly without app crash |
