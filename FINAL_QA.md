# Final QA

## Product Structure

- Applications
- Interviews
- Stats
- Analyze
- Settings modal from the header button

## Storage Keys

Do not rename these keys without a migration plan:

- `cv_tracker_user`
- `cv_tracker_cv`
- `jobtrack_jobs`
- `jobtrack_interviews`
- `cv_tracker_analyses`
- `cv_tracker_settings`

## Manual Test Checklist

- App loads without console errors.
- Onboarding works.
- Applications opens as the main experience after onboarding.
- Main navigation shows only Applications, Interviews, Stats, Analyze.
- Settings opens only as a modal from the header.
- Settings closes with X, backdrop click, and Escape.
- Arabic/English switching works.
- RTL/LTR layout works.
- Add, edit, delete, and status-change application flows work.
- Status cards count and filter applications correctly.
- All Applications resets the application filter.
- Application accordion opens and closes.
- Interview weekly strip filters by day.
- All Upcoming resets interview date filtering.
- Join Meeting, Open Map, and Prepare work from interview cards.
- Stats KPI cards render.
- Bar/Donut chart toggle works.
- Source Performance renders applications, interviews, and conversion rate.
- Analyze shows only Job Match and Interview Prep.
- CV upload works.
- Gemini API key save/remove works.
- Job Match validates CV and job description.
- Interview Prep validates CV and company or position plus interview type.
- Export Data works.
- Import Data preview and merge/replace work.
- Reset Data requires DELETE and confirmation.
- Mobile 360px has no horizontal page overflow.
- GitHub Pages live site loads the latest cache version.

## Hidden Legacy Code

Some older functions remain intentionally hidden instead of deleted:

- Today dashboard helpers
- Full settings page renderer
- Extended stats helpers such as heatmap and achievements
- Older analyzer modes and saved-analysis helpers

They are kept to avoid risky deletion during the simplification cycle.

## Future Improvements

- Move Gemini calls behind a serverless proxy for production API-key safety.
- Add formal schema migrations if the localStorage models change.
- Add automated browser smoke tests for GitHub Pages.
