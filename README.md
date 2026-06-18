# AI CV Tracker

Bilingual AI-powered job application tracker for Arabic and English users. The app helps you organize job applications, interviews, follow-ups, analytics, CV analysis, and backups in one static local-first dashboard.

Live site: https://bayjarrah-web.github.io/AI-CV-tracker/

## Highlights

- Arabic and English interface with RTL/LTR support
- Three-step onboarding with searchable specialties and countries with flags
- Local-first storage using browser `localStorage`
- Jobs management with add, edit, archive, delete, search, filters, follow-ups, and activity logs
- Today dashboard for active applications, follow-ups due, interviews this week, offers, recent activity, and motivation
- Interviews management with rounds, formats, results, countdowns, maps/meeting links, and job activity integration
- Stats and analytics with KPI cards, charts, source analytics, interview performance, activity heatmap, and achievements
- AI Analyzer powered by Gemini API, with PDF CV extraction and Markdown-rendered results
- Settings and data management with preferences, API key management, export/import, backup/restore, danger zone, and library status
- GitHub Pages compatible, no build step required

## Features

### Onboarding

- Collects name, specialty, and country
- Searchable country picker with flags
- Arabic/English country names sorted alphabetically by active language
- Optional CV PDF upload

### Jobs Management

- Add and edit job applications
- Track title, company, location, job type, status, priority, source, salary, URL, contact, notes, applied date, and follow-up date
- Search by job title, company, or location
- Filter by status, priority, and source
- Mark follow-up done and automatically schedule the next follow-up
- Archive or permanently delete jobs
- Per-job activity log

### Today Dashboard

- Total active jobs
- Follow-ups due
- Interviews this week
- Offers
- Upcoming interviews
- High-priority jobs needing attention
- Recent activity feed
- Contextual motivational message

### Interviews

- Add and edit interviews linked to jobs
- Support multiple rounds per job
- Round types: HR, technical, managerial, cultural fit, final, assessment, and other
- Formats: video, phone, in-person, async video
- Track interviewers, preparation notes, post-interview notes, questions asked, status, and result
- Countdown labels for today, upcoming, and past interviews
- Meeting and Google Maps links

### Stats & Analytics

- Total applications
- Active applications
- Response rate
- Interview rate
- Offer rate
- Average response time
- Application status chart
- Weekly applications chart
- Source analytics
- Interview performance
- Monthly activity heatmap
- Achievement badges

### AI Analyzer

- Stores Gemini API key locally in the browser
- Reads CV PDFs with PDF.js
- Supports CV review, job matching, and career analysis
- Renders AI output as safe Markdown using Marked.js and DOMPurify
- Saves recent analyses locally

### Settings & Data Management

- Profile summary
- Language, theme, default stats period, auto-save, and compact mode preferences
- Gemini API key setup
- Export all data or partial data as JSON
- Import and merge or replace data from JSON
- Backup and restore
- Delete analyses, archived jobs, settings, or all data with confirmations
- Library status panel

## Storage Keys

- User: `cv_tracker_user`
- CV metadata and text: `cv_tracker_cv`
- Jobs: `jobtrack_jobs`
- Interviews: `jobtrack_interviews`
- Analyses: `cv_tracker_analyses`
- Settings: `cv_tracker_settings`

## External Libraries

The app stays a static, no-build Vanilla HTML/CSS/JS project. Libraries are loaded via CDN, so no npm install or build step is required and the app remains GitHub Pages compatible.

- Fontshare Satoshi — display typography
- Google Fonts DM Sans, JetBrains Mono, Noto Kufi Arabic, and Noto Sans Arabic
- Chart.js — analytics charts
- Lucide Icons — icons
- Marked.js — Markdown rendering for AI responses
- DOMPurify — sanitizing generated HTML
- PDF.js — PDF CV text extraction

## Run Locally

Open `index.html` directly in the browser.

For a local test server:

```bash
python -m http.server 8055
```

Then open:

```text
http://127.0.0.1:8055/
```

## GitHub Pages

The app is hosted directly with GitHub Pages from the `main` branch.

Live site:

```text
https://bayjarrah-web.github.io/AI-CV-tracker/
```

## Privacy

All user data is stored locally in the browser through `localStorage`. The app does not require a backend. Gemini requests are sent only when the user provides an API key and runs an AI analysis.

## Release

Current release target: `v1.0.0`
