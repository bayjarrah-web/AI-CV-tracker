# UI Review Checklist — AI CV Tracker

Use this checklist before finishing any UI task or design-polish commit.

## Required Checks

1. Did I read `DESIGN.md` before changing UI?
2. Did I touch only the requested page or the minimum shared shell needed for that page?
3. Did I avoid schema, localStorage, route, and data-behavior changes?
4. Is there one clear page hierarchy?
5. Is there only one primary CTA on the screen?
6. Are there repeated labels or duplicated headings?
7. Are there unnecessary nested containers or cards inside cards?
8. Is the design consistent with the dark premium blue identity?
9. Did I avoid yellow, orange, gold, and amber accents?
10. Does the page work at 360px width without horizontal overflow?
11. Does Arabic remain readable?
12. Does RTL still look natural?
13. Are buttons and badges consistent?
14. Does the change improve understanding, usability, or visual clarity?
15. Did I avoid image generation and embedded reference screenshots?
16. Did I run syntax checks if `app.js` or `translations.js` changed?
17. Did `git diff --check` pass?

## External Skills Note

`nextlevelbuilder/ui-ux-pro-max-skill` may be used later only as a conceptual UI/UX reference. Do not install it, copy its files, or let it override the project-specific rules in `DESIGN.md`.

`DESIGN.md` is the source of truth for this project.
