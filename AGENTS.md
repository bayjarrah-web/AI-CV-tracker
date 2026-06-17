# Project Instructions for Codex

## Project Overview

This project is a modern web app for job applications, interview tracking, calendar management, and career preparation.

The goal is to build a premium, clean, responsive, mobile-first product that feels professional and reliable.

Codex must act like a small product team:

* Product reviewer
* Senior frontend engineer
* UI/UX designer
* QA tester
* Code reviewer

## Main Priorities

1. Mobile-first responsive design
2. Premium UI quality
3. Clean reusable code
4. Consistent design system
5. No broken layouts on different phone sizes
6. Clear user experience
7. Safe changes without breaking business logic

## Design Direction

The UI should feel like a premium SaaS dashboard.

Use this style direction:

* Clean
* Modern
* Professional
* Calm
* Trustworthy
* Minimal but not empty
* High-quality spacing and alignment

Good inspiration:

* Notion
* Linear
* Vercel
* Raycast
* Modern HR and productivity platforms

Avoid:

* Childish colors
* Random gradients
* Heavy shadows
* Cluttered cards
* Tiny text on mobile
* Fixed layouts that break on different screens
* Overdesigned UI without purpose

## Responsive Design Rules

The app must work correctly on:

* 360px small Android phones
* 390px iPhone-size screens
* 430px large phones like Samsung S24 Ultra
* 768px tablets
* Desktop screens

Rules:

* Do not use fixed card widths.
* Do not use hardcoded screen heights unless necessary.
* Avoid horizontal scrolling.
* Use flexible layout with flex, grid, minmax, clamp, max-width, and responsive breakpoints.
* Use safe mobile padding.
* Use readable font sizes.
* Use large enough tap targets for mobile.
* Keep important actions visible and easy to reach.
* Use bottom sheets on mobile instead of small center modals when showing details.

## UI Component Rules

### Cards

Cards should:

* Use consistent spacing
* Have clear hierarchy
* Show only important information
* Use soft borders or subtle shadows
* Avoid too much text
* Work on small and large screens

### Buttons

Buttons should:

* Be easy to tap on mobile
* Have clear labels
* Use consistent height, radius, and spacing
* Show primary and secondary actions clearly

### Forms

Forms should:

* Be simple and readable
* Use clear labels
* Avoid cramped inputs
* Work perfectly on mobile
* Show errors clearly
* Avoid unnecessary fields

### Calendar

Calendar screens must:

* Show days with interviews clearly
* Support multiple interviews on the same day
* Show selected day details clearly
* Use badges, dots, or indicators for interview days
* Avoid tiny clickable calendar numbers
* Use mobile-friendly detail views

### Interview Cards

Interview cards should show:

* Company name
* Position
* Date and time
* Interview type or meeting link
* Status
* Next action
* Preparation notes when available

## UX Rules

Before changing any screen, Codex should think about:

* What is the main user goal on this screen?
* What should the user notice first?
* What is the primary action?
* Is the screen easy to use with one hand on mobile?
* Is there too much text?
* Are actions clear?
* Does the empty state help the user?
* Can users understand multiple interviews on the same day?

## Code Rules

Codex must:

* Read existing files before editing.
* Reuse existing components when possible.
* Avoid creating duplicate components.
* Avoid huge files.
* Keep component names clear.
* Keep logic separated from UI when possible.
* Do not change business logic unless required.
* Do not remove existing features unless asked.
* Do not introduce unnecessary dependencies.
* Keep code simple and maintainable.

## Testing and Review

Before finishing any task, Codex must check:

* Mobile responsiveness
* 360px screen width
* 390px screen width
* 430px screen width
* Tablet layout
* Desktop layout
* Text overflow
* Button tap targets
* Card spacing
* Visual consistency
* Accessibility basics
* Build/lint errors if scripts are available

If the project has scripts, run the relevant ones:

* npm run lint
* npm run build
* npm test

If a command is not available, mention that clearly.

## Design Review Mode

When asked to improve a screen, Codex should review it like a designer:

1. Identify layout problems.
2. Identify spacing problems.
3. Identify hierarchy problems.
4. Identify mobile issues.
5. Identify visual inconsistencies.
6. Improve the screen without changing the core functionality.
7. Explain what changed and why.

## QA Mode

When asked to test or audit, Codex should:

1. Check the expected user flow.
2. Look for broken states.
3. Look for mobile layout bugs.
4. Look for empty-state issues.
5. Look for unclear buttons.
6. Look for overflow or clipped text.
7. Report issues clearly.
8. Fix only what is safe to fix.

## Pull Request Rules

When Codex creates a pull request, the summary must include:

* What changed
* Why it changed
* Which files were edited
* What was tested
* What still needs manual review

## Important Instruction

Always read this file before making changes.

For design tasks, also read:

* DESIGN.md
* docs/responsive-rules.md
* docs/screens.md

Never make random UI changes. Every UI change must improve usability, responsiveness, or visual consistency.
