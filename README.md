# AI CV Tracker

Bilingual, local-first job application tracker for Arabic and English users.

Live site: https://bayjarrah-web.github.io/AI-CV-tracker/

## Current Product

The app is intentionally focused on four daily-use sections:

- Applications: track where you applied and the current hiring stage.
- Interviews: see upcoming interviews, join meetings, open maps, and prepare.
- Stats: review simple application performance metrics and source performance.
- Analyze: use Gemini with your CV for job matching and interview preparation.

Settings are secondary and open as a small modal from the header.

## Highlights

- Arabic and English UI with RTL/LTR support
- Static Vanilla HTML/CSS/JS
- No build step and no backend required
- GitHub Pages compatible
- Browser `localStorage` for user data
- PDF CV upload and local CV text storage
- Gemini API key stored locally in the browser
- JSON export/import and reset from the settings modal

## Storage Keys

These keys are intentionally preserved for compatibility:

- User: `cv_tracker_user`
- CV metadata and text: `cv_tracker_cv`
- Applications: `jobtrack_jobs`
- Interviews: `jobtrack_interviews`
- AI analyses: `cv_tracker_analyses`
- Settings: `cv_tracker_settings`

## External Libraries

Loaded by CDN:

- Chart.js: Stats chart
- Lucide Icons: UI icons
- Marked.js: Markdown rendering for AI results
- DOMPurify: sanitizing rendered Markdown
- PDF.js: PDF CV text extraction

## Run Locally

Open `index.html` directly in the browser, or run a simple static server:

```bash
python -m http.server 8055
```

Then open:

```text
http://127.0.0.1:8055/
```

## Privacy

The app is local-first. Your profile, applications, interviews, settings, CV text, and analyses stay in browser `localStorage`.

Gemini requests are sent only when you provide an API key and run an analysis.

## Release

Current release target: `v1.0.0`
