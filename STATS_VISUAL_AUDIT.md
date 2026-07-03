# Stats Visual Audit

Phase E.1 is an audit-only review of the current Stats page against `DESIGN.md` and `UI_REVIEW_CHECKLIST.md`.

No UI, logic, schema, route, or localStorage changes were made during this audit.

## Evidence Reviewed

- Source review: `app.js`, `styles.css`, `translations.js`.
- Design governance: `AGENTS.md`, `DESIGN.md`, `UI_REVIEW_CHECKLIST.md`.
- Browser QA at 360px width with:
  - Enough applications data.
  - Empty applications data.
  - Limited data with one application.
  - Bar chart view.
  - Donut chart view.
  - Source Performance with sources.
  - Arabic RTL state.
- Temporary screenshots were captured outside the repo at:
  - `C:/Users/bayja/AppData/Local/Temp/ai-cv-tracker-stats-audit/stats-full-en-360.png`
  - `C:/Users/bayja/AppData/Local/Temp/ai-cv-tracker-stats-audit/stats-empty-en-360.png`
  - `C:/Users/bayja/AppData/Local/Temp/ai-cv-tracker-stats-audit/stats-full-ar-360.png`

## 1. What Is Working Well

- The page direction is correct for the simplified product: four KPI cards, one chart, and Source Performance are much clearer than the old analytics-heavy dashboard.
- The old visible clutter is successfully hidden from the Stats page. Browser QA did not show Achievements, Heatmap, Timeline, or Monthly Activity in the current UI.
- The KPI set answers the right core questions: total applications, interview rate, rejection rate, and under review.
- Bar and Donut chart views both render and toggle correctly with current data.
- Chart instances are destroyed before redraw through the existing chart cleanup path, reducing duplicate canvas/chart risk.
- Source Performance now includes applications, interviews, and conversion rate, which makes the section more useful than a simple source count.
- The 360px mobile checks did not show horizontal page overflow in English or Arabic.
- Arabic RTL direction is applied correctly and the page remains usable on mobile.
- The page does not show fatal console errors in the tested states.

## 2. What Is Visually Weak

| ID | Priority | Risk | Reason | Finding |
| --- | --- | --- | --- | --- |
| E1 | P1 | Low | Clarity | The zero-data empty state is too thin. It only says "Add applications to see your statistics" inside the chart card and does not guide the user back to adding an application. |
| E2 | P1 | Medium | Usability | Limited-data states can look overly definitive. With one application, the page shows 0% rates and a full chart without explaining that insights are based on a tiny sample. |
| E3 | P1 | Low | Consistency | Stats still has visible warm/amber styling from old global rules: active period tabs and stats hero score inherit amber border/background. This conflicts with the current blue-only design system. |
| E4 | P1 | Low | Clarity | Source Performance repeats the leading source label in the card header and again as the first source row, which reads as duplicate information on mobile. |
| E5 | P2 | Medium | Mobile clarity | The period filter can become tall on 360px because each tab stacks to full width at small breakpoints. It is usable, but it consumes a lot of vertical space before the KPIs. |
| E6 | P2 | Low | Consistency | KPI card visual language is close, but not fully aligned with Applications/Interviews card polish. Icons are strong, but labels have high weight and can compete with values. |
| E7 | P2 | Medium | Chart readability | Bar/Donut toggle is functional but lacks stronger selected semantics beyond style. It uses `role="tablist"` without tab-like aria-selected states, and the selected affordance inherits older global styling. |
| E8 | P2 | Low | Arabic quality | Arabic source lines use simple fixed wording such as "1 طلبات" and "0 مقابلة". It is understandable, but it feels less polished than the rest of the RTL UI. |
| E9 | P2 | Low | Clarity | The empty Source Performance text still says sources will appear after adding jobs. User-facing wording should continue the current product language: applications, not jobs. |
| E10 | P3 | Low | Polish | The Stats hero repeats "Career analytics" and "Stats & Analytics". It is not broken, but the page could feel cleaner with a shorter heading system later. |

## 3. Exact Recommended Fixes

### E1 — Improve Empty Stats State

- Replace the single-line zero-data message with a proper empty state:
  - Title: "No stats yet"
  - Body: "Add your first application to unlock simple performance insights."
  - Optional secondary action: "Go to Applications" or "Add Application" only if it can reuse existing logic safely.
- Keep this separate from limited-data states.
- Suggested files later: `app.js`, `translations.js`, `styles.css`.

### E2 — Add Limited-Data Context

- When total applications are 1 or 2, show a small helper note near KPIs or chart:
  - "Insights are early. Add more applications for stronger trends."
- Do not hide the chart; just add context so percentages do not feel misleading.
- Suggested files later: `app.js`, `translations.js`, `styles.css`.

### E3 — Remove Warm/Amber Drift From Stats

- Override Stats active period tabs and `stats-hero-score` to use electric blue only.
- Avoid changing shared global rules that could affect already-approved Interviews/Applications unless scoped safely.
- Suggested files later: `styles.css`.

### E4 — De-duplicate Source Performance Header

- Change the right-side header pill from the best source name to a neutral summary, for example:
  - "Best source" + value in a small line, or
  - "{count} sources"
- Keep source rows unchanged.
- Suggested files later: `app.js`, `translations.js`.

### E5 — Compact Period Filter on Mobile

- On 360px, use a horizontal scroll segmented control or a two-column compact layout instead of four full-width rows.
- Preserve 44px tap targets and no horizontal page overflow.
- Suggested files later: `styles.css`.

### E6 — Refine KPI Card Hierarchy

- Make numeric values the strongest element.
- Reduce label weight slightly.
- Keep icons quieter than Applications status cards.
- Do not add new metrics.
- Suggested files later: `styles.css`.

### E7 — Improve Chart Toggle Semantics

- Add `aria-selected` or switch to a simpler segmented-control pattern without tab semantics.
- Keep Bar/Donut logic unchanged.
- Suggested files later: `app.js`, `styles.css`.

### E8 — Polish Arabic Counts

- Improve Source Performance line formatting for Arabic count labels.
- A simple safe improvement is acceptable:
  - "{applications} طلب / طلبات"
  - "{interviews} مقابلة / مقابلات"
- Avoid a large pluralization system in this phase.
- Suggested files later: `translations.js`, possibly `app.js`.

### E9 — Replace Jobs Wording in Stats Empty Copy

- Change Stats empty/source copy from "jobs" to "applications" in English and from "وظائف" to "طلبات" in Arabic where visible in the simplified Stats UI.
- Do not rename internal variables.
- Suggested files later: `translations.js`.

### E10 — Hero Copy Polish

- Later, consider shortening the hero to:
  - "Stats"
  - "See your application performance at a glance."
- Keep this P3 because current text is understandable.
- Suggested files later: `translations.js`.

## 4. Recommended Execution Order

1. P1: Fix blue-only styling drift in Stats scoped CSS (`E3`).
2. P1: Improve zero-data empty state (`E1`).
3. P1: Add limited-data context (`E2`).
4. P1: De-duplicate Source Performance header (`E4`).
5. P2: Compact period filter on mobile (`E5`).
6. P2: KPI hierarchy and chart toggle semantics (`E6`, `E7`).
7. P2: Arabic count and wording polish (`E8`, `E9`).
8. P3: Hero copy polish (`E10`).

## 5. What Must Not Be Touched

- Do not change localStorage keys.
- Do not change Jobs/Application schema.
- Do not change Interviews schema.
- Do not reintroduce Achievements, Heatmap, Timeline, or the old complex analytics UI.
- Do not modify Applications, Interviews, Analyze, Settings modal, or onboarding in the Stats polish phase.
- Do not change Chart.js CDN or add libraries.
- Do not rename internal code variables just to change user-facing wording.
- Do not change export/import data format.

## 6. Risk Notes

- The safest next phase should be `Phase E.2 — Stats P1 visual/usability fixes`.
- Most P1 items can be handled with small scoped `styles.css`, `translations.js`, and `app.js` rendering changes.
- The warm/amber drift should be fixed carefully because `.period-filter-tab.active` is a shared selector. Prefer Stats-scoped overrides first.
- Empty state and limited-data improvements are low-risk if they only affect `renderStats()` output and translations.
- Source Performance changes are low-risk if they do not alter `getSimplifiedSourcePerformance()` calculations.
- Arabic plural polish can become larger than expected. Keep it simple unless a broader i18n pass is planned.

