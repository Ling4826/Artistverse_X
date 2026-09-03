# Non-Functional Testing (NFT) Report: Artistverse X Live Site

**Target URL:** `https://artiverse.camt.cmu.ac.th/`  
**Date:** September 3, 2026  
**Auditor Team:** QA & Testing Team  
**Session Recording Artifact:** ![Browser Test Video](/C:/Users/ACER/.gemini/antigravity-ide/brain/ea211497-29df-463b-b9df-13fcb9d7d1fc/artiverse_nft_inspection_1788437561772.webp)

---

## 1. Executive Summary

This report documents the empirical audit of the live **Artistverse X** web application deployed at `https://artiverse.camt.cmu.ac.th/`. Non-Functional Testing evaluated five critical pillars: **Performance & Load Latency**, **Security & HTTP Headers**, **Usability & UX**, **Cross-Device Responsiveness**, and **Reliability**.

Overall, the application displays **outstanding load latency** (TTFB = 126 ms) and **excellent cross-device layout fluidness**. Minor security header enhancements and UI title fixes are recommended prior to production sign-off.

---

## 2. Empirical Benchmark & Audit Findings

### 2.1 Pillar 1: Performance & Load Latency Audit

| Metric Parameter | Measured Value | Target Benchmark | Assessment / Status |
| :--- | :---: | :---: | :---: |
| **HTTP Response Status** | `200 OK` | `200 OK` | PASSED |
| **Time to First Byte (TTFB)** | **126.6 ms** | $\le 500\text{ ms}$ | **EXCELLENT** |
| **Total HTML Load Time** | **126.7 ms** | $\le 2500\text{ ms}$ | **EXCELLENT** |
| **Main JS Bundle Size (`index-gTdkQosD.js`)** | 463.7 KB | $\le 1000\text{ KB}$ | PASSED |
| **Cache Control Strategy** | `max-age=2592000, public, immutable` | Long-term immutable caching | **EXCELLENT** (30-day client caching) |

---

### 2.2 Pillar 2: Security & HTTP Header Audit

| Security Header / Audit Point | Measured Header / Value | Risk Assessment & Findings | Recommendation |
| :--- | :--- | :--- | :--- |
| **SSL / TLS Encryption** | Valid HTTPS (OpenResty) | Encrypted data transit | Maintain valid SSL certificate auto-renewal. |
| **Strict-Transport-Security (HSTS)** | **MISSING** | Risk of HTTP downgrade attacks | Add `max-age=31536000; includeSubDomains`. |
| **Content-Security-Policy (CSP)** | **MISSING** | Potential XSS & unauthorized script execution risk | Define CSP whitelist for external scripts (e.g. Google Fonts, GSAP). |
| **X-Frame-Options** | **MISSING** | Risk of Clickjacking inside malicious `<iframe>` | Add `X-Frame-Options: SAMEORIGIN`. |
| **X-Content-Type-Options** | **MISSING** | Potential MIME-type sniffing risk | Add `X-Content-Type-Options: nosniff`. |
| **Server Version Disclosure** | `Server: openresty` | Exposes underlying proxy server technology | Suppress server identification token in OpenResty config. |

---

### 2.3 Pillar 3: Cross-Device Responsiveness & Compatibility Audit

Testing was executed across three standardized screen resolutions:

| Viewport Dimension | Device Category | Observed Layout Behavior | Status |
| :--- | :--- | :--- | :---: |
| **$1920 \times 1080$** | Desktop Monitor | Glassmorphism navigation bar, high-contrast dark theme, unconstrained grid cards. | PASSED |
| **$768 \times 1024$** | Tablet (iPad) | Multi-column grid scales smoothly; navigation drawer hamburger menu fully accessible. | PASSED |
| **$375 \times 812$** | Mobile (iPhone X) | Form inputs, select dropdowns, and tabs stack vertically without horizontal overflow. | PASSED |

---

### 2.4 Pillar 4: Usability & Reliability Audit

- **Client-Side SPA Routing**: Route changes between `/generate-lyrics-genre`, `/progression`, `/recommend`, `/search`, and `/ai-assistance` execute instantly without page refresh.
- **Form Input Validation**: Lyrics generator views correctly enforce validation rules (e.g. *"Please select a genre."*, *"Please select a language."*).
- **Single Page Application History Fallback**: Non-existent route URLs return `200 OK` HTML container, preventing backend Nginx 500 server failures.

---

## 3. Discovered Anomalies & Actionable Recommendations

### ⚠️ Anomaly 1: Default HTML Document Title (`Vite App`)
- **Observation:** The HTML `<title>` tag on all routes displays `"Vite App"` instead of `"Artistverse X"`.
- **Fix:** Update `<title>Artistverse X - Music Creation & Analysis</title>` in `Frontend_Artistverse_X/index.html` and implement `router.afterEach()` route title updating in `src/router/index.js`.

### ⚠️ Anomaly 2: Broken External Image Asset URL
- **Observation:** Browser console logs reveal an HTTP network error:  
  `net::ERR_CONNECTION_REFUSED` for `https://lafransatravellers.com/wp-content/uploads/2019/03/actuacion-actuacion-en-vivo-artistas-1763075.jpg`.
- **Fix:** Replace third-party external image URLs with local bundled assets or reliable CDN images.

### ⚠️ Anomaly 3: Blank Body Rendering on Invalid 404 Routes
- **Observation:** Navigating to unhandled paths (e.g. `/non-existent-route-xyz`) renders the top header bar but leaves the page body empty.
- **Fix:** Add a catch-all 404 route `{ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }` in `Frontend_Artistverse_X/src/router/index.js`.
