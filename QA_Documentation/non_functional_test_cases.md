# Non-Functional Test Case Specification (NFT)

**Target Application:** Artistverse X Live Deployment  
**URL:** `https://artiverse.camt.cmu.ac.th/`  
**QA Category:** Non-Functional Testing (Performance, Security, Usability, Compatibility, Reliability)

---

## 1. NFT Specification Table

| Test Case ID | Pillar / Category | Description & Test Objective | Test Procedure / Tools | Target Benchmark / Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **NFT-PERF-01** | Performance | Measure initial page Time to First Byte (TTFB) | HTTP request measurement via curl/PowerShell | TTFB $\le 500\text{ ms}$ |
| **NFT-PERF-02** | Performance | Measure total page load duration for static HTML & assets | Browser performance navigation timing API | Total load $\le 2500\text{ ms}$ |
| **NFT-PERF-03** | Performance | Verify asset compression (Gzip / Brotli) on JS and CSS bundles | Inspect `Content-Encoding` header of `/assets/*.js` and `/assets/*.css` | `Content-Encoding` header equals `gzip` or `br` |
| **NFT-SEC-01** | Security | Verify HTTPS / SSL Certificate validity & encryption grade | TLS handshake inspection | Valid TLS 1.2/1.3 certificate without security warnings |
| **NFT-SEC-02** | Security | Audit Security HTTP Headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`) | Response header scan on `https://artiverse.camt.cmu.ac.th/` | Recommended security headers present to prevent clickjacking/XSS |
| **NFT-SEC-03** | Security | Server software version disclosure check | Inspect `Server` header in HTTP response | Server header omits exact Nginx/OS patch version to prevent targeting |
| **NFT-COMP-01** | Compatibility | Desktop Responsive Layout ($1920 \times 1080$) | Browser subagent rendering | Navigation bar, grid layout, and card components aligned without overflow |
| **NFT-COMP-02** | Compatibility | Tablet Responsive Layout ($768 \times 1024$) | Browser subagent mobile viewport | Layout rearranges cleanly into 2-column or single-column responsive grid |
| **NFT-COMP-03** | Compatibility | Mobile Responsive Layout ($375 \times 812$) | Browser subagent mobile viewport | Touch target buttons $\ge 44\text{px}$, no horizontal scrollbar, text readable |
| **NFT-USAB-01** | Usability | External Google Fonts & Asset Loading Verification | Asset request status check | Fonts (`Tac One`, `Outfit`, `Bungee Spice`) load without CORS/404 errors |
| **NFT-USAB-02** | Usability | Visual feedback & loading spinners during async actions | User action simulation | Loading spinners displayed during async fetch operations |
| **NFT-RELI-01** | Reliability | Invalid URL / Non-existent Route Handling | Navigate to `https://artiverse.camt.cmu.ac.th/non-existent-page-xyz` | Vue SPA history fallback routes user gracefully to app without server 500 crash |
