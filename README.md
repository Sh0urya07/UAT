# Unova // UAT Engine (`uat.unova.co.in`)

Official **Unova UAT Diagnostic Suite**, an advanced web auditing platform merging deep automated site diagnostics with a traditional Japanese ink-wash (**Sumi-e**) and dark fantasy watercolor aesthetic, built using **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Three.js**.

---

## 🎨 Visual Art Direction

- **Sumi-e Watercolor Palette**: Warm textured parchment backgrounds (`--parchment-cream: #faebd7`, `--parchment-pale: #f4ece1`), deep calligraphy ink silhouettes (`--calligraphy-black: #12100e`, `--shadow-charcoal: #231b18`), smoky sepia/taupe washes, and winding electric neon violet (`--gengar-bright-violet: #7d598f`, `--aura-light-lavender: #b193c7`) and flame-red brush trails (`--eye-flame-red: #ea3a22`, `--eye-glow-orange: #f2612d`).
- **Interactive Three.js WebGL Layer**: Dynamic background with floating ink droplets, smoky particle clouds, and undulating electric violet/flame-orange energy ribbons that react to cursor movement and accelerate during active site audits.
- **Unova Robot Mascot Logo**: Minimalist robot mascot head featuring an animated mint antenna node (`#4fe0af`), rounded parchment squircle chassis, wide pill visor with mint screen, and soft coral blush cheek points (`#fa7a5e`), animated with **Anime.js**.

---

## 🔍 Core Diagnostic Capabilities

1. **Google Core Web Vitals**: Real-time evaluation of Largest Contentful Paint (LCP) with subpart breakdowns (TTFB, load delay, render delay), Interaction to Next Paint (INP) input latency, and Cumulative Layout Shift (CLS) stability.
2. **Google Search Essentials**: Indexability matrix auditing `robots.txt`, canonical tags, meta robots, semantic heading hierarchy ($1 \times \text{H1}$), and Schema.org JSON-LD structured data.
3. **Google-Compliant Link Validation**: Verifies crawlable `<a href="...">` anchor tags, flags non-crawlable pseudo-links (`javascript:void(0)`, lone `#`), detects generic anchor text violations ("click here", "read more"), and maps internal vs. external topologies.
4. **Deep Bug & Vulnerability Tree**: Diagnostic inspection of React client/server hydration mismatches, broken DOM states (duplicate IDs, orphaned inputs), memory leak heuristics, and defensive security headers (CSP, HSTS, X-Content-Type-Options, clickjacking framing).
5. **Hardware Performance Throttler**: Simulates 2GB RAM budget mobile devices under 6x CPU throttling and high-latency mobile networks with an interactive execution budget HUD.
6. **OASIS SARIF 2.1.0 Exporter**: Direct export for GitHub Security and DevSecOps pipelines.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Production deployment: [uat.unova.co.in](https://uat.unova.co.in).
