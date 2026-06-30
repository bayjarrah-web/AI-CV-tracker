# Applications Visual Audit

Date: 2026-06-30

Scope: Applications page only, including the shared header only where it affects the Applications experience.

Evidence reviewed:

- `AGENTS.md`
- `DESIGN.md`
- `UI_REVIEW_CHECKLIST.md`
- `index.html`
- `styles.css`
- `translations.js`
- `app.js`

This is an audit-only phase. No visible UI, app logic, schema, routes, or storage keys were changed.

## 1. What Is Working Well

1. The product structure now matches the intended simplified navigation: Applications, Interviews, Stats, Analyze, with Settings kept out of the main navigation.
2. Applications is correctly implemented inside the existing `tab-jobs` surface, so it reuses the established Jobs/Application logic without introducing a new route.
3. The Applications hero is much clearer than the previous layered dashboard: it has one welcome message, one supporting sentence, and one primary Add Application action.
4. The floating Add Application button is hidden, which removes the previous duplicate CTA problem.
5. The four hiring-cycle status cards are aligned with the simplified product model: Sent, Under Review, Interview, Rejected.
6. Status-card filtering reuses the existing `JobFilters` and `renderJobs()` flow, so the visual interaction is simple without adding data risk.
7. The accordion list is a good direction for this product. It keeps company, position, applied date, and status visible first, then reveals details only when needed.
8. The blue-only visual direction is mostly respected. The legacy `--amber` variable names remain in CSS, but their values are mapped to blue, so this is mainly a naming/maintenance issue rather than a visible color issue.
9. Mobile safeguards already exist for 520px: status cards become one column, list summaries reflow, and action buttons are allowed to wrap.
10. The empty state has a real title and body copy, not just "No data", which is a solid base.

## 2. What Is Visually Weak

1. The page still has too many bordered layers: header card, nav card, hero card, status shell card, toolbar card, and accordion cards. This is better than before, but still slightly more "stacked panels" than the design system wants.
2. The status cards sit inside an additional glass `applications-dashboard-shell`. This creates a card-inside-card feeling even though the status cards themselves are already strong visual cards.
3. The toolbar mixes section heading, reset action, search, filters, and reset filters in one dense grid. On desktop it is efficient, but on mobile it can feel like a control panel before the user reaches the list.
4. The Applications list has two "All Applications" labels close together: one as the section heading and one as the reset-view button. It is functionally useful, but visually repetitive.
5. The empty state does not include the primary action. When the user has zero applications, the most helpful next step is Add Application directly inside that state.
6. The empty-state icon uses text (`JOB`), which feels less premium and less aligned with the blue AI visual identity.
7. Expanded accordion details show many equal-weight boxes: position, location, source, applied date, follow-up count, status changer, badges, interview info, notes, and four actions. This is useful but visually dense for a "simplified" Applications page.
8. Advanced legacy concepts still surface in the simplified list: priority, job type, follow-up count, follow-up done, and archive. They may be useful later, but they compete with the core mental model of company, position, date, status.
9. Button hierarchy inside expanded rows is too flat. Edit, Follow-up Done, Archive, and Delete appear as similar row actions, so the primary next action is not clear.
10. The header brand still says `CV Tracker AI` and the brand mark says `CV`, while the onboarding direction and product naming mostly say `AI CV Tracker`. This is a small consistency drift.
11. Some user-facing copy still uses "job" in non-core places such as delete confirmation and older translation keys. This does not break the UI, but it weakens the Applications mental model.
12. CSS contains many legacy selectors for hidden features and old component states. This is not a user-facing issue by itself, but it increases risk when polishing visuals later.

## 3. Exact Recommended Fixes

| ID | Recommendation | Priority | Risk | Reason | Suggested files to change later |
| --- | --- | --- | --- | --- | --- |
| A1 | Add a real zero-data empty state CTA: title, short body, and a single `Add Application` button wired to the existing modal. Keep no-results copy separate from zero-data copy. | P1 | Low | usability | `index.html`, `app.js`, `styles.css`, `translations.js` |
| A2 | Replace the text `JOB` empty-state icon with a small Lucide icon or abstract blue badge. | P2 | Low | polish / consistency | `index.html`, `styles.css` |
| A3 | Reduce one visual layer by making `applications-dashboard-shell` feel like an unframed status band or removing its visible glass treatment while keeping the status grid. | P2 | Medium | clarity / hierarchy | `index.html`, `styles.css` |
| A4 | Rename the reset-view button from `All Applications` to `Clear status filter` or show it only when a status card is active. | P1 | Low | clarity | `index.html`, `app.js`, `translations.js` |
| A5 | Make the filters toolbar less dense on mobile: search first, then a compact filter row or collapsible filters. Keep desktop efficient. | P1 | Medium | usability / mobile | `index.html`, `styles.css`, minimal `app.js` if collapsible |
| A6 | In expanded accordion details, prioritize only core details by default: location, source, job link, notes, interview info. Move priority/job type/follow-up count into a quieter metadata row or hide them under "More details". | P2 | Medium | clarity | `app.js`, `styles.css`, `translations.js` |
| A7 | Rebalance expanded-row actions: keep Edit and Change Status prominent; make Archive/Delete secondary-danger; consider hiding Follow-up Done unless a follow-up is due. | P2 | Medium | usability | `app.js`, `styles.css`, `translations.js` |
| A8 | Add a clearer selected-filter summary above the list, such as `Showing: Sent`, with a small clear control. This helps users understand why the list changed after tapping a status card. | P2 | Low | clarity | `index.html`, `app.js`, `styles.css`, `translations.js` |
| A9 | Align product naming in the main app shell: use `AI CV Tracker` consistently, and replace the `CV` mark with the existing AI-style mark if available. | P3 | Low | consistency | `index.html`, `styles.css`, `translations.js` |
| A10 | Clean only user-facing "job" wording where the visible context is Applications, without renaming internal variables or storage keys. | P2 | Low | consistency | `translations.js` |
| A11 | Add explicit `aria-label` text for status-card buttons that includes the status and count. Current visible text is readable, but accessible names can be more descriptive. | P2 | Low | accessibility | `app.js`, `translations.js` |
| A12 | Add a keyboard-visible focus style specifically for accordion summaries and status cards if not already inherited cleanly. | P2 | Low | accessibility | `styles.css` |
| A13 | Audit actual 360px layout after the next visual change. The CSS has safeguards, but the toolbar and expanded details are the highest overflow-risk areas. | P1 | Low | QA / mobile | no code necessarily, browser QA |
| A14 | Leave legacy CSS selectors in place for now unless they visibly affect Applications. Remove or consolidate them only in a separate cleanup phase. | P3 | High | maintainability | `styles.css` later only |

## 4. Recommended Execution Order

1. **P1 empty-state and filter clarity**
   - Add zero-data empty CTA.
   - Rename or conditionally show the All Applications reset button.
   - Confirm no-results and zero-data states are clearly different.

2. **P1 mobile toolbar pass**
   - Make the search/filter area easier on 360px.
   - Ensure tap targets remain at least 44px.
   - Check Arabic and English labels for wrapping.

3. **P2 hierarchy reduction**
   - Lighten or unframe the status-card shell.
   - Keep the hero, status cards, and list as the only major visual beats.

4. **P2 accordion simplification**
   - Reduce equal-weight detail boxes.
   - Rebalance actions so Delete/Archive do not compete with normal actions.

5. **P2 accessibility pass**
   - Add better status-card labels.
   - Confirm focus-visible states on status cards, accordion summaries, filters, and action buttons.

6. **P3 brand and wording polish**
   - Align `AI CV Tracker` naming.
   - Replace visible "job" wording where it conflicts with Applications.
   - Avoid internal renames.

7. **Final QA**
   - Existing data state.
   - Empty data state.
   - Filtered no-results state.
   - Arabic RTL.
   - 360px, 390px, 430px, tablet, desktop.

## 5. What Must Not Be Touched

1. Do not change localStorage keys.
2. Do not change Jobs/Applications schema.
3. Do not create a new `tab-applications` route.
4. Do not delete hidden legacy logic during visual polish.
5. Do not bring back Today, Profile, or Settings as main navigation tabs.
6. Do not add a floating Add Application button.
7. Do not reintroduce visible language switching in the main app shell.
8. Do not change Interviews, Stats, Analyze, onboarding, or Settings modal during Applications-only polish.
9. Do not add yellow, orange, gold, or warm accent colors.
10. Do not install external skills, frameworks, npm packages, or build steps.

## 6. Risk Notes

- **Low-risk fixes:** empty-state CTA, copy polish, icon replacement, aria labels, focus states, and reset-button wording.
- **Medium-risk fixes:** toolbar restructuring and accordion detail simplification, because they touch dynamic rendering and event delegation.
- **High-risk fixes:** deleting legacy CSS or old functions. The project intentionally hides old complexity instead of removing it, so cleanup should be isolated and tested later.
- **Evidence limit:** This audit is based on the current project files and design rules. It does not claim full visual QA from browser screenshots. Before implementation, verify the recommended changes in the live UI at desktop and 360px mobile widths.
