# Analyze Visual Audit — Phase F.1

Date: 2026-07-05

Scope: Analyze page only. This is an audit report, not an implementation phase.

Sources reviewed:

- `AGENTS.md`
- `DESIGN.md`
- `UI_REVIEW_CHECKLIST.md`
- `app.js`
- `styles.css`
- `translations.js`
- Current rendered Analyze states in Chrome at 360px English and Arabic RTL

States audited:

1. Default Analyze state with no API key and no CV
2. Job Match mode with stored CV and filled job description
3. Interview Prep mode with stored CV and filled fields
4. Saved/generated-result support from current code
5. Missing API key state from current code
6. Loading and error behavior from current code
7. Mobile 360px English
8. Mobile 360px Arabic RTL

## 1. What Is Working Well

- The page is already simplified to the two product-relevant modes: Job Match and Interview Prep.
- The default mode is Job Match, which is the most likely first user goal.
- The page has a clear high-level hierarchy: hero, API key, CV upload, mode selection, mode form, result area.
- CV upload state is understandable: no CV shows an upload prompt, stored CV shows the file name.
- Validation logic exists for missing API key, missing CV, missing job description, and missing interview info.
- Safety basics are already present: PDF type check, PDF size limit, CV text truncation, API cooldown, markdown sanitization.
- Mobile 360px did not produce horizontal overflow in the inspected English or Arabic states.
- RTL direction switches correctly, and Arabic labels render in the expected direction.
- Result rendering uses Markdown, which is right for AI output readability.

## 2. What Is Visually Weak

### F1-A1 — API setup competes with the main Analyze task

- Priority: P1
- Risk: Low
- Reason: clarity / usability
- Suggested files later: `app.js`, `styles.css`, `translations.js`

The API key card appears before CV upload and mode selection. For a first-time user this is technically useful, but visually it makes the page feel like setup/admin work instead of an analysis workflow. Since Settings already owns API key management, Analyze should show a compact API status/guidance state, not a full setup block competing with the main action.

Recommended fix later:

- Keep API behavior and storage unchanged.
- Replace the large API setup card with a smaller inline status strip or compact setup card.
- When key is missing, show one clear action: “Add API key in Settings” or a small Save Key row.
- When key is saved, collapse it to a subtle “Gemini ready” status.

### F1-A2 — Missing API key/CV errors are toast-only

- Priority: P1
- Risk: Low
- Reason: usability / clarity
- Suggested files later: `app.js`, `styles.css`, `translations.js`

When the user clicks Analyze without API key or CV, the code shows a toast. Toasts are easy to miss on mobile and disappear quickly. For a workflow requiring setup, the missing requirement should also be visible near the CTA or inside the relevant card.

Recommended fix later:

- Keep existing toasts.
- Add a persistent inline requirement checklist near the run button:
  - CV uploaded
  - API key saved
  - Job description or interview info entered
- The checklist should be quiet, blue/slate, and not become a new dashboard.

### F1-A3 — Result history exists in code but is not visible in the current simplified UI

- Priority: P1
- Risk: Medium
- Reason: usability / clarity
- Suggested files later: `app.js`, `styles.css`

`renderSavedAnalysesList()` exists, and analysis results are saved to `AppState.analyses`, but the current `renderAnalyzerReadiness()` does not render the saved analyses section. This means saved/generated results may not be discoverable after leaving the result state.

Recommended fix later:

- Do not change storage keys or analysis schema.
- Add a small, secondary “Recent analyses” section only when saved analyses exist.
- Keep it visually quiet and below the main workflow.
- Do not make it a large history dashboard.

### F1-A4 — Result card starts hidden and the empty result state is too thin

- Priority: P2
- Risk: Low
- Reason: clarity / polish
- Suggested files later: `app.js`, `styles.css`, `translations.js`

The empty result state currently shows a single short line. It does not clearly explain what will appear after running Job Match or Interview Prep. This makes the lower page feel unfinished.

Recommended fix later:

- Use a consistent empty state with title + short body.
- In Job Match: explain that the result will show match score, strengths, gaps, and improvements.
- In Interview Prep: explain that the result will show questions, talking points, and preparation focus.
- Keep it compact.

### F1-A5 — Mode selection cards look good but their active state still has legacy amber definitions earlier in CSS

- Priority: P2
- Risk: Low
- Reason: consistency / style drift
- Suggested files later: `styles.css`

Later blue overrides currently win visually, but older `.analyzer-mode-card.active`, `.analyzer-mode-icon`, `.upload-box`, and markdown heading rules still reference amber variables earlier in `styles.css`. This increases risk that future CSS order changes reintroduce yellow/amber.

Recommended fix later:

- Stats already had blue cleanup; do the same for Analyze-scoped styles.
- Remove or override amber references only inside Analyze-related selectors.
- Do not globally replace legacy variables.

### F1-A6 — Job Match input needs stronger guidance for paste length/content

- Priority: P2
- Risk: Low
- Reason: usability
- Suggested files later: `app.js`, `translations.js`

The Job Description textarea is clear but sparse. Users may wonder whether to paste the full posting, responsibilities only, or a link. Since this is the highest-value Analyze mode, a short helper line would reduce hesitation.

Recommended fix later:

- Add a one-line helper below the textarea:
  - “Paste the full job description for best results.”
  - Arabic equivalent.
- Do not add more fields.

### F1-A7 — Interview Prep form is useful but lacks “what matters most” hierarchy

- Priority: P2
- Risk: Low
- Reason: usability / clarity
- Suggested files later: `app.js`, `styles.css`

Company and position are important, interview type is important, interviewer fields are optional. Visually they all have similar weight. On mobile this can feel like a form rather than a preparation assistant.

Recommended fix later:

- Keep the same fields.
- Visually separate required/primary fields from optional context.
- Add subtle optional labels for interviewer name/title and notes.
- Keep one primary CTA: Prepare for Interview.

### F1-A8 — Loading state is button-only

- Priority: P2
- Risk: Low
- Reason: clarity / accessibility
- Suggested files later: `app.js`, `styles.css`, `translations.js`

During analysis, only the clicked button text changes to “AI is analyzing the data...”. There is no visible loading state in the result area. For AI calls that may take several seconds, the user should see that the page is working.

Recommended fix later:

- Keep button disabled behavior.
- Add a small loading panel in the result area while analyzing.
- Avoid aggressive animation.
- Respect `prefers-reduced-motion`.

### F1-A9 — Result typography can be stronger for AI output

- Priority: P2
- Risk: Low
- Reason: readability / polish
- Suggested files later: `styles.css`

Markdown output is supported, but result styling is basic. AI output will likely include headings, lists, scores, and recommendations. It needs better spacing, list readability, and heading hierarchy to feel premium and useful.

Recommended fix later:

- Improve `.analyzer-result.markdown-body` spacing.
- Make headings blue, not amber.
- Improve list spacing and block separation.
- Keep long AI text readable on 360px.

### F1-A10 — Arabic labels are understandable, but some terms still say “وظيفة” instead of “طلب/وصف وظيفي”

- Priority: P3
- Risk: Low
- Reason: consistency / wording polish
- Suggested files later: `translations.js`

Some legacy analyzer translations still reference “وظيفة” in a generic way. In Analyze, this is acceptable for “job description”, but product-wide wording is now Applications. The wording should be reviewed carefully, not globally replaced.

Recommended fix later:

- Keep “وصف الوظيفة” for job description.
- Use “طلب” where the user is managing tracked applications.
- Do not replace technical keys or hidden legacy text blindly.

## 3. Exact Recommended Fixes

1. Make API readiness compact and reduce setup-card dominance.
2. Add inline requirement/validation state near the run CTA.
3. Restore a small Recent analyses section only when saved analyses exist.
4. Improve the empty result state with mode-specific guidance.
5. Remove/override Analyze-scoped amber style drift.
6. Add a small helper line for Job Match textarea.
7. Rebalance Interview Prep field hierarchy: primary fields first, optional context quieter.
8. Add a result-area loading state while Gemini is running.
9. Improve Markdown result typography.
10. Polish Arabic wording where it affects visible Analyze copy.

## 4. Recommended Execution Order

### Phase F.2 — Analyze P1 usability fixes

Implement only:

- F1-A1 compact API readiness
- F1-A2 inline requirements/checklist
- F1-A3 recent analyses visibility

Why first:

- These directly affect whether users understand how to start and recover prior results.
- They are mostly rendering/CSS changes and can be done without changing schema or API behavior.

### Phase F.3 — Analyze P2 workflow polish

Implement:

- F1-A4 empty result guidance
- F1-A6 Job Match helper
- F1-A7 Interview Prep hierarchy
- F1-A8 loading panel

Why second:

- These improve flow confidence and reduce confusion without changing core logic.

### Phase F.4 — Analyze visual consistency polish

Implement:

- F1-A5 amber cleanup
- F1-A9 Markdown result typography
- F1-A10 Arabic wording polish

Why third:

- These are important but less urgent than start/run/result discoverability.

## 5. What Must Not Be Touched

- Do not change `callGemini()` endpoint, API model, or request behavior in visual phases.
- Do not change Gemini API key storage key or format.
- Do not change `cv_tracker_cv` storage format.
- Do not change `cv_tracker_analyses` schema.
- Do not change Applications, Interviews, Stats, Settings modal, or onboarding.
- Do not add backend, npm, build step, or new libraries.
- Do not add a third Analyze mode.
- Do not reintroduce old full Career Analysis or CV Review modes into the visible UI.
- Do not globally replace “job” wording; only polish visible Analyze copy carefully.

## 6. Risk Notes

- Medium risk: Recent analyses visibility touches saved analyses rendering. It should reuse `renderSavedAnalysesList()` and existing handlers only.
- Medium risk: API readiness changes could accidentally duplicate Settings behavior. Keep storage and save behavior unchanged.
- Low risk: Inline requirements are display-only if implemented from existing state.
- Low risk: Amber cleanup should be Analyze-scoped only.
- Low risk: Markdown typography is CSS-only.

## Audit Verdict

Analyze is functional and directionally aligned with the simplified product, but it still feels like a technical setup page in places. The biggest usability issue is not the AI logic; it is start-state clarity: users need to instantly see what is ready, what is missing, and what result they will get.

Recommended next step: Phase F.2 only, with the three P1 fixes above.
