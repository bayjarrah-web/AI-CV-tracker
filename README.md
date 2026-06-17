# AI CV Tracker

A bilingual Arabic/English job application tracker built as a lightweight static web app.

## Features

- Three-step onboarding flow
- Arabic/English language switch with RTL/LTR support
- Searchable specialty field
- Searchable country field with flags
- Jobs management:
  - Add, edit, archive, and delete jobs
  - Search by job title, company, or location
  - Filter by status, priority, and source
  - Follow-up tracking
  - Activity log per job
- Local-first storage using `localStorage`

## Storage Keys

- User: `cv_tracker_user`
- CV metadata: `cv_tracker_cv`
- Jobs: `jobtrack_jobs`
- Interviews: `cv_tracker_interviews`
- Analyses: `cv_tracker_analyses`
- Settings: `cv_tracker_settings`

## Run

Open `index.html` directly in the browser.

No build step is required.

## GitHub Pages

This app can be hosted directly with GitHub Pages:

1. Upload the repository files.
2. Go to repository Settings.
3. Open Pages.
4. Select the `main` branch and root folder.
5. Save.

