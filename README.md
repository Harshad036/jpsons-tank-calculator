# JP Sons Engineering — Tank Calculator PWA

Mixing tank calculation app for JP Sons Engineering. Install on mobile like a native app.

## Features

- Mixing tank volume, material weight, and cost calculator
- PDF export
- Offline support (PWA)
- Mobile responsive

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & preview on phone (same Wi‑Fi)

```bash
npm run build
npm run preview -- --host
```

Open `http://YOUR-PC-IP:4173` on your phone.

> **Note:** Install / Add to Home Screen on Android works best over **HTTPS**. Local HTTP may only show "Add to Home Screen" — that is normal.

## Install on mobile

### Android (Chrome)
1. Open the site in Chrome (HTTPS URL after deploy)
2. Menu (⋮) → **Add to Home screen** or **Install app**
3. Confirm — **JP Sons** logo appears on home screen

### iPhone (Safari)
1. Share → **Add to Home Screen** → **Add**

## Publish to GitHub

### 1. Create repository on GitHub
- Go to https://github.com/new
- Name: `jpsons-tank-calculator` (or any name)
- Public repository
- Do **not** add README (this project has one)

### 2. Push code (first time)

```bash
git init
git add .
git commit -m "Initial commit: JP Sons mixing tank calculator PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jpsons-tank-calculator.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. After the workflow runs, your app is live at:
   `https://YOUR_USERNAME.github.io/jpsons-tank-calculator/`

Use that HTTPS URL on your phone to install with the correct JP Sons icon.

## Tech stack

- React 19 + TypeScript
- Vite 6 + vite-plugin-pwa
- jsPDF (PDF export)
