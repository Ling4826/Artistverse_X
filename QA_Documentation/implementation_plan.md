# QA Non-Functional Testing Plan: Live Site (https://artiverse.camt.cmu.ac.th/)

## Overview
This plan establishes the strategy to perform **Non-Functional Testing (NFT)** on the live deployment environment (`https://artiverse.camt.cmu.ac.th/`). While functional testing validated feature logic, non-functional testing evaluates performance, security headers, usability, responsive compatibility, and system reliability.

---

## 5 Non-Functional Testing Pillars

### Pillar 1: Performance & Load Latency Testing
- **Metrics**: Page Load Time, Time to First Byte (TTFB), Asset Bundle Sizes (`index-gTdkQosD.js`, `index-Dbmk-lcL.css`), Gzip/Brotli Compression, Asset Caching headers.
- **Target**: Ensure initial load $< 2.5\text{s}$ and TTFB $< 500\text{ms}$.

### Pillar 2: Security & HTTP Headers Audit
- **Security Scope**:
  - SSL/TLS Encryption & Certificate Validity.
  - Security Headers: `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
  - Server Information Exposure (Nginx version leakage in response headers).

### Pillar 3: Usability & UX Design Integrity
- **Evaluation Criteria**:
  - Typography readability (Google Fonts loading: Tac One, Outfit, Bungee Spice).
  - Navigation clarity & loading state indicators (spinners/loaders).
  - Visual layout glassmorphism aesthetics and contrast.

### Pillar 4: Cross-Device & Responsive Compatibility Testing
- **Viewport Testing**:
  - Desktop Viewport ($1920 \times 1080$)
  - Tablet Viewport ($768 \times 1024$)
  - Mobile Viewport ($375 \times 812$)
- **Evaluation Criteria**: Grid layout adaptiveness, text wrapping, button tap target sizes, horizontal overflow detection.

### Pillar 5: Reliability & Resiliency Testing
- **Evaluation Criteria**:
  - Handling invalid/non-existent routes (`/invalid-route-404`).
  - Nginx reverse proxy stability (`/api/` proxy route handling).

---

## Deliverables

1. **Non-Functional Test Cases Specification Artifact (`non_functional_test_cases.md`)**:
   - Comprehensive test cases table covering Performance, Security, Usability, Compatibility, and Reliability.
2. **Live Inspection & Testing Execution Artifact (`non_functional_test_report.md`)**:
   - Empirical measurements, security header scan results, performance benchmarks, and cross-viewport responsive testing recordings.
3. **Walkthrough & Educational Guide (`walkthrough.md`)**:
   - Step-by-step breakdown of Non-Functional QA principles and findings for teaching purposes.

---

## Open Questions / Approval Required

> [!IMPORTANT]
> **User Review Requested**  
> We will begin executing live non-functional audits using browser tools and HTTP inspection tools against `https://artiverse.camt.cmu.ac.th/`.  
> Please confirm if you approve proceeding with this plan!
