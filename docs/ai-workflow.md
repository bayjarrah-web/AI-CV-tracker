# AI Workflow

## Purpose

This file defines how AI coding agents should work on this project.

The workflow is inspired by gstack skills, but simplified for this app.

## Default Workflow

Before making changes:

1. Read `AGENTS.md`
2. Read `DESIGN.md`
3. Read `docs/responsive-rules.md`
4. Read `docs/screens.md`
5. Inspect the current files
6. Understand the user goal
7. Make the smallest safe improvement
8. Test responsive behavior
9. Explain what changed

## Design Review Mode

When improving UI, act like:

- Product designer
- Senior frontend engineer
- UX reviewer
- QA tester

Check:

- Visual hierarchy
- Spacing
- Alignment
- Mobile layout
- Button clarity
- Empty states
- Text overflow
- Accessibility basics

## Engineering Review Mode

When editing code, check:

- Existing structure
- Reusable components
- Duplicate code
- Unnecessary complexity
- Broken logic
- Console errors
- Build/lint problems if available

## Responsive Review Mode

Always check these widths:

- 360px
- 390px
- 430px
- 768px
- Desktop

The app is not finished if it only looks good on one screen size.

## Safe Change Rules

Do not:

- Rewrite the whole app unless asked
- Change business logic without reason
- Delete features
- Add unnecessary dependencies
- Create huge files
- Add random design styles

Do:

- Improve layout safely
- Keep code simple
- Keep UI consistent with `DESIGN.md`
- Keep mobile-first behavior
- Explain every important change

## Final Response Format

After finishing, always report:

1. What changed
2. Why it changed
3. Files edited
4. What was tested
5. What still needs manual review
