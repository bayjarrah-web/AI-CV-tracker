# Interviews Visual Audit

Phase D.1 audit only. No visible UI, app logic, schema, routes, or storage keys were changed.

## Evidence Reviewed

- `AGENTS.md`
- `DESIGN.md`
- `UI_REVIEW_CHECKLIST.md`
- `index.html`
- `styles.css`
- `app.js`
- `translations.js`
- Chrome headless check at 360px with seeded interview data:
  - upcoming interviews
  - past interview
  - multiple interviews on the same day
  - today interview highlight
  - Arabic empty state
  - RTL layout

Observed 360px QA:

- English interviews state had no horizontal overflow.
- Arabic empty state had no horizontal overflow.
- Weekly strip rendered 7 days.
- Same-day count rendered as a numeric badge.
- Past interviews section stayed collapsed by default.
- Day filtering updated the upcoming count.

## 1. What Is Working Well

1. **Focused page model**
   - The page already follows the simplified product direction: weekly strip first, upcoming interviews next, past interviews collapsed below.
   - This answers the user's main question quickly: what interview is coming and what action is needed.

2. **Weekly strip exists and is interactive**
   - The next 7 days are visible as buttons.
   - A selected day uses `aria-pressed`.
   - The "All Upcoming" reset exists.

3. **Multiple interviews are counted**
   - The strip shows a numeric badge when a day has interviews.
   - This is a good base for improving same-day clarity.

4. **Upcoming and past hierarchy is mostly right**
   - Upcoming interviews are the main section.
   - Past interviews are collapsed by default, which keeps the screen focused.

5. **Smart interview actions are already present**
   - `Join Meeting` appears only when a safe meeting URL exists.
   - `Open Map` appears for in-person interviews with a map URL or location fallback.
   - `Prepare` routes to Analyze without building new AI logic in the Interviews page.

6. **Mobile foundation is solid**
   - The weekly strip scrolls/fits at 360px.
   - Interview cards stack on small screens.
   - The 360px Chrome check showed no horizontal overflow in English or Arabic.

7. **RTL is functional**
   - Arabic switched to `dir="rtl"` correctly.
   - The empty state and weekly strip stayed within the viewport.

## 2. What Is Visually Weak

1. **Same-day count is not self-explanatory**
   - The weekly strip shows a number like `2` or `3`, but it does not say "interviews".
   - A user can understand it eventually, but it is not immediately clear.

2. **Selected-day context is weak**
   - After tapping a day, the list count changes, but the section does not clearly say which day is being shown.
   - This can make the page feel like it changed silently.

3. **Today highlight may become noisy**
   - Every interview card scheduled today gets the `today-interview` pulse.
   - With multiple interviews today, several pulsing cards can feel visually busy.

4. **Empty state is helpful but passive**
   - The empty state has a title and body, but no direct `Add Interview` CTA.
   - For zero interviews, the next logical action is scheduling one.

5. **Header hierarchy is still a bit heavy**
   - The Interviews page has a large header card plus a large weekly strip.
   - It is acceptable, but Applications now feels more refined and compact after recent polish.

6. **Interview cards are readable but still denser than Applications**
   - The date chip, colored rail, badges, details, and actions all compete slightly.
   - The card is useful, but it does not yet feel as calm as the polished Applications accordion.

7. **Action hierarchy can be calmer**
   - `Join Meeting` and `Open Map` correctly behave as primary actions.
   - `Prepare` is useful, but visually it should stay secondary and calm.
   - Edit/Delete are already quieter, but the whole action area can be tuned further.

8. **Hidden legacy empty state still has `INT`**
   - The currently rendered inline empty state is cleaner, but the hidden static empty state still contains a text icon.
   - If it ever becomes visible, it would feel less premium than the current visual direction.

9. **Some older colors remain in card accents**
   - The interview rail uses violet-to-cyan.
   - This is not yellow/orange, but the current design system is moving toward restrained deep blue/electric blue.

## 3. Exact Recommended Fixes

| ID | Recommendation | Priority | Risk | Reason | Suggested Files |
| --- | --- | --- | --- | --- | --- |
| D1 | Make same-day counts explicit in the weekly strip. Add visible or accessible text such as `2 interviews`, not only `2`. Keep the visual compact. | P1 | Low | Clarity / usability | `app.js`, `translations.js`, `styles.css` |
| D2 | Add selected-day context above the upcoming list, for example `Showing Jul 2 · 2 interviews`, with the existing All Upcoming reset still available. | P1 | Medium | Clarity | `app.js`, `translations.js`, `styles.css` |
| D3 | Improve zero-interview empty state with one primary `Add Interview` CTA wired to the existing modal trigger. Keep selected-day no-results separate and do not show CTA there unless appropriate. | P1 | Low | Usability | `app.js`, `translations.js`, `styles.css` |
| D4 | Soften today's highlight. Prefer a subtle badge/date-chip glow or one restrained pulse, not full card pulsing on every today's interview. Respect reduced motion. | P2 | Low | Polish / accessibility | `styles.css` |
| D5 | Polish interview card hierarchy: job title strongest, company secondary, date chip quieter, details easier to scan. Avoid adding nested cards. | P2 | Medium | Consistency / readability | `styles.css`, minimal `app.js` only if needed |
| D6 | Tune action hierarchy: `Join` / `Open Map` primary, `Prepare` secondary but visible, Edit/Delete tertiary. Avoid making all actions compete equally. | P2 | Low | Usability / consistency | `styles.css` |
| D7 | Improve weekly strip mobile affordance. It fits now, but horizontal scroll should feel intentional, with compact labels and enough touch space. | P2 | Low | Mobile clarity | `styles.css` |
| D8 | Polish the collapsed Past Interviews row so the count and disclosure affordance feel clearer. | P2 | Low | Clarity | `styles.css` |
| D9 | Replace or neutralize the hidden `INT` text icon if the static empty state may become visible later. | P3 | Low | Polish | `index.html`, `styles.css` |
| D10 | Align interview accent colors closer to the blue system. Reduce violet accents unless they communicate a meaningful state. | P3 | Low | Visual consistency | `styles.css` |

## 4. Recommended Execution Order

1. **D.2 P1 fixes**
   - D1: explicit count label for days with multiple interviews.
   - D2: selected-day context line.
   - D3: zero-interview empty state CTA.

2. **D.3 card and motion polish**
   - D4: soften today's pulse.
   - D5: improve interview card readability.
   - D6: refine action hierarchy.

3. **D.4 secondary polish**
   - D7: mobile strip affordance.
   - D8: past collapsed row.
   - D9/D10: hidden legacy icon and accent cleanup.

## 5. What Must Not Be Touched

- Storage keys.
- Jobs schema.
- Interviews schema.
- Routes and tab IDs.
- Applications page behavior.
- Stats page behavior.
- Analyze page behavior.
- Settings modal behavior.
- Onboarding behavior.
- Gemini/API behavior.
- Export/import format.
- Add/Edit Interview modal logic.
- Any old hidden logic that is not visible.

## 6. Risk Notes

- D1 and D2 are low-to-medium risk because they touch render text and selected-day display, but they should not change filtering logic.
- D3 is low risk if it reuses the existing `data-open-interview-modal` trigger.
- D4 through D8 are mostly CSS-first and should be safe.
- Avoid changing date calculations, interview grouping, or storage shape during visual polish.
- Avoid bringing back full calendar behavior. The current weekly assistant model is the right product direction.
