# Design System — Job & Interview Tracking App

## Product Context

* **What this is:** A modern web app for job applications, interview tracking, calendar management, CV preparation, and career progress.
* **Who it's for:** Job seekers, professionals, candidates applying to multiple companies, and users preparing for interviews.
* **Project type:** Productivity dashboard + career management tool.
* **Main goal:** Help users track job applications, interviews, preparation tasks, and follow-up actions in a clean, premium, mobile-first interface.

## Design Philosophy

This product must feel like a serious professional tool, not a casual template.

The interface should be:

* Premium
* Clean
* Practical
* Trustworthy
* Fast to understand
* Mobile-first
* Data-driven
* Calm and focused

The user should immediately understand:

* What interviews are coming next
* What applications need action
* What tasks are pending
* What should be done today

The design should reduce stress and make job searching feel organized.

## Aesthetic Direction

* **Direction:** Premium productivity dashboard with industrial/utilitarian influence.
* **Decoration level:** Intentional and restrained.
* **Mood:** Serious, crafted, calm, professional, and reliable.
* **Visual personality:** Clean cards, clear hierarchy, subtle borders, controlled color use, strong typography.
* **Design inspiration:** Linear, Notion, Vercel, Raycast, Warp, modern HR platforms, and premium SaaS dashboards.

## What to Avoid

Avoid:

* Childish colors
* Random gradients
* Heavy shadows
* Too many icons
* Overdesigned cards
* Tiny mobile text
* Fixed widths that break on different screens
* Cluttered dashboards
* Unclear buttons
* Popups that are too small on mobile
* Huge empty spaces without purpose
* Generic template look

## Typography

Typography must be modern, readable, and professional.

### Recommended Fonts

* **Display / Hero:** Satoshi
  Use for main titles and hero sections.
  Weight: 700 or 900.

* **Body / UI:** DM Sans
  Use for normal text, buttons, labels, and interface text.
  Weight: 400, 500, 600.

* **Data / Technical / Status:** JetBrains Mono
  Use for dates, times, status codes, small metadata, counters, and calendar labels.
  Weight: 400 or 500.

### Font Loading

Use `display=swap` when loading fonts.

Recommended:

* Satoshi from Fontshare
* DM Sans from Google Fonts
* JetBrains Mono from Google Fonts

### Type Scale

Use responsive typography.

* Hero: `clamp(40px, 6vw, 72px)`
* H1: `clamp(32px, 5vw, 48px)`
* H2: `clamp(24px, 4vw, 32px)`
* H3: `24px`
* H4: `18px`
* Body: `16px`
* Small: `14px`
* Caption: `13px`
* Micro: `12px`
* Nano: `11px`, preferably JetBrains Mono

### Typography Rules

* Headings must be bold and clear.
* Body text must be easy to read.
* Labels should be smaller but still readable.
* Avoid text smaller than 12px on mobile.
* Use tabular numbers for dates, counters, and calendar data.
* Keep line-height comfortable.
* Do not overload cards with too much text.

## Color System

### General Approach

Use a restrained color system.

The UI chrome should stay mostly neutral.
Accent colors should be meaningful, not decorative.

Color should help the user understand:

* Upcoming interviews
* Pending actions
* Success
* Warning
* Rejection or danger
* Important deadlines

## Primary Palette

### Dark Mode

Dark mode should feel premium and focused.

* Base background: `#0C0C0C`
* Surface / card: `#141414`
* Elevated surface: `#1A1A1A`
* Border: `#262626`
* Main text: `#FAFAFA`
* Muted text: `#A1A1AA`
* Secondary text: `#71717A`

### Light Mode

Light mode should feel clean and warm.

* Base background: `#FAFAF9`
* Surface / card: `#FFFFFF`
* Elevated surface: `#F5F5F4`
* Border: `#E7E5E4`
* Main text: `#18181B`
* Muted text: `#71717A`
* Secondary text: `#A1A1AA`

## Accent Color

Use amber as the main accent inspired by gstack.

### Dark Mode Accent

* Primary: `#F59E0B`
* Text accent: `#FBBF24`

### Light Mode Accent

* Primary: `#D97706`
* Text accent: `#B45309`

### Accent Usage Rules

Use amber for:

* Primary actions
* Active states
* Selected calendar day
* Important interview indicators
* Focus states
* Highlighted metrics

Do not use amber everywhere.
It should feel rare and meaningful.

## Semantic Colors

Use semantic colors consistently:

* Success: `#22C55E`
* Warning: `#F59E0B`
* Error / Danger: `#EF4444`
* Info: `#3B82F6`

### Job Status Colors

Suggested mapping:

* Applied: Info blue
* Interview scheduled: Amber
* Interview completed: Purple or neutral
* Offer: Success green
* Rejected: Error red
* Waiting response: Muted gray
* Follow-up needed: Warning amber

## Neutral Colors

Use cool zinc and warm stone neutrals.

* zinc-50: `#FAFAFA`
* zinc-100: `#F4F4F5`
* zinc-200: `#E4E4E7`
* zinc-400: `#A1A1AA`
* zinc-500: `#71717A`
* zinc-600: `#52525B`
* zinc-800: `#27272A`
* zinc-900: `#18181B`
* zinc-950: `#09090B`

## Spacing

### Base Unit

Use a 4px spacing system.

### Scale

* 2xs: `2px`
* xs: `4px`
* sm: `8px`
* md: `16px`
* lg: `24px`
* xl: `32px`
* 2xl: `48px`
* 3xl: `64px`

### Spacing Rules

* Mobile screens need safe padding.
* Cards should not touch the screen edges.
* Avoid cramped UI.
* Avoid excessive empty space.
* Keep vertical rhythm consistent.
* Related items should be visually grouped.
* Unrelated sections need more spacing.

## Layout

### Layout Approach

* Mobile-first.
* Grid-disciplined dashboard.
* One-column layout on mobile.
* Multi-column dashboard on tablet and desktop.
* Use responsive containers and avoid fixed widths.

### Grid

* Mobile: 1 column
* Tablet: 2 columns where useful
* Desktop: 12-column grid or clear dashboard layout

### Max Width

* Main content max width: `1200px`
* Center content on large screens.
* Do not stretch cards too wide without reason.

### Responsive Requirements

The design must work on:

* 360px small Android phones
* 390px iPhone-size screens
* 430px large phones such as Samsung S24 Ultra
* 768px tablets
* 1024px+ desktop screens

### Responsive Rules

* Do not use fixed card width.
* Do not use fixed screen height unless necessary.
* Avoid horizontal scroll.
* Use `flex`, `grid`, `minmax`, `clamp`, `max-width`, and responsive breakpoints.
* Use `flex-wrap` for crowded rows.
* Use bottom navigation on mobile if needed.
* Use sidebar only on tablet/desktop.
* Use bottom sheets on mobile instead of small center modals.

## Border Radius

Use radius carefully.

* Small: `4px`
* Medium: `8px`
* Large: `12px`
* Extra large: `20px`
* Full: `9999px`

Recommended:

* Cards / panels: `12px` to `20px`
* Buttons / inputs: `8px` to `14px`
* Badges / pills: `9999px`
* Progress bars: `4px`

## Cards

Cards are one of the most important parts of the app.

### Card Style

Cards should use:

* Clear title
* Useful content only
* Subtle border
* Soft shadow only when needed
* Consistent padding
* Good mobile layout

### Card Rules

* Do not overload cards with text.
* Make the most important info visible first.
* Use status badges.
* Use icons only when helpful.
* Keep action buttons obvious.
* Cards must not break on small screens.

## Buttons

### Primary Button

Use for main actions:

* Add application
* Add interview
* Join meeting
* Save changes
* Prepare interview

Style:

* Amber or main accent background
* Clear text
* Large enough tap target
* Rounded corners
* Strong contrast

### Secondary Button

Use for less important actions:

* View details
* Edit
* Cancel
* Open notes

Style:

* Neutral background
* Subtle border
* Clear text
* Same height system as primary buttons

### Button Rules

* Buttons must be easy to tap on mobile.
* Minimum tap target should be around 44px height.
* Avoid tiny icon-only buttons unless clearly labeled.
* Do not put too many actions in one card.

## Forms

Forms should be simple and mobile-friendly.

### Form Rules

* Use clear labels.
* Use readable input text.
* Avoid cramped fields.
* Group related fields.
* Show errors clearly.
* Keep required fields obvious.
* Use selects and date pickers carefully on mobile.
* Do not create long overwhelming forms.

### Important Forms

* Add job application
* Add interview
* Edit company details
* Add preparation notes
* Update application status
* Add follow-up reminder

## Calendar Design

Calendar is a core screen and must be very clear.

### Calendar Must Show

* Current month
* Selected day
* Today
* Days with interviews
* Multiple interviews on same day
* Interview details under selected day

### Calendar Indicators

Use:

* Small dots
* Badges
* Colored indicators
* Count indicator when multiple interviews exist

Example:

* 1 interview: one dot
* 2+ interviews: small count badge

### Mobile Calendar Rules

* Calendar numbers must be easy to tap.
* Avoid tiny dates.
* Do not open a small center popup on mobile.
* Use a bottom sheet or stacked details section.
* Selected day details should appear clearly under the calendar.
* Multiple interviews should appear as a vertical list or timeline.

## Interview Card Design

Interview cards should be clear and action-focused.

Each interview card should show:

* Company name
* Position title
* Date
* Time
* Interview type
* Location or meeting link
* Status
* Next action
* Preparation notes if available

### Primary Interview Actions

Possible actions:

* Join meeting
* Prepare
* Add notes
* Send follow-up
* Mark as completed
* Reschedule

### Interview Card Rules

* The next action must be visually clear.
* Date and time should be easy to scan.
* Meeting link should be visible when relevant.
* Avoid long paragraphs.
* Use compact but readable layout.

## Dashboard Design

Dashboard should answer:

* What is happening today?
* What is my next interview?
* How many applications are active?
* What needs my attention?

### Dashboard Sections

Recommended:

* Next interview hero card
* Application status summary
* Upcoming interviews
* Follow-up reminders
* Recent applications
* CV readiness / profile completion
* Quick actions

### Dashboard Rules

* The first card should be the most important thing.
* Avoid showing too many stats without meaning.
* Use clear hierarchy.
* Mobile dashboard should be scrollable but not chaotic.
* Desktop dashboard can use a grid.

## Status Badges

Use badges for:

* Applied
* Screening
* Interview
* Offer
* Rejected
* Waiting
* Follow-up
* Completed

### Badge Rules

* Use short labels.
* Use color carefully.
* Do not use very bright backgrounds.
* Ensure contrast is readable.
* Use pill radius.

## Navigation

### Mobile

Preferred:

* Bottom navigation for main sections
* Clear active state
* Maximum 4 to 5 main items

Possible items:

* Dashboard
* Jobs
* Calendar
* Tasks
* Profile

### Desktop

Preferred:

* Sidebar navigation
* Clear section grouping
* Active state
* User/profile area at bottom if needed

## Empty States

Empty states must be useful.

Do not only say “No data”.

Good empty states should explain:

* What is missing
* Why it matters
* What action the user should take

Examples:

* “No interviews scheduled yet.”
* “Add your next interview to track preparation and follow-up.”
* Primary action: “Add interview”

## Motion

Motion should be minimal and functional.

### Motion Rules

* Use transitions only when they help understanding.
* Do not over-animate.
* Avoid distracting motion.
* Keep interactions fast.

### Timing

* Micro: `50ms–100ms`
* Short: `150ms`
* Medium: `250ms`
* Long: `400ms`

### Easing

* Enter: `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`
* Exit: `ease-in`
* Move: `ease-in-out`

### Animated Elements

Allowed:

* Hover states
* Focus states
* Sheet opening
* Calendar selection
* Progress bars
* Small status pulse for live/upcoming items

## Grain Texture

A subtle grain texture can be used to avoid a generic flat UI.

### Rules

* Keep it very subtle.
* Dark mode opacity: `0.03`
* Light mode opacity: `0.02`
* Use only if it improves the visual quality.
* It must not reduce readability.
* It must not hurt performance.

Suggested implementation:

* CSS pseudo-element on `body::after`
* `pointer-events: none`
* `position: fixed`
* High z-index only if it does not interfere with UI
* SVG `feTurbulence` background-image

## Accessibility

Accessibility is required.

### Rules

* Text must have enough contrast.
* Buttons must be keyboard accessible.
* Inputs must have labels.
* Focus states must be visible.
* Do not rely only on color to communicate status.
* Icons should have labels or accessible names.
* Tap targets must be large enough on mobile.

## Data Display

For numbers, dates, and stats:

* Use clear labels.
* Use tabular numbers.
* Do not show too many numbers without context.
* Highlight only meaningful metrics.
* Use trend indicators carefully.
* Make status easy to understand.

## Content Style

Text inside the app should be:

* Short
* Clear
* Professional
* Helpful
* Calm

Avoid:

* Long AI-like paragraphs
* Overly casual language
* Confusing technical words
* Too many explanations inside cards

## Component Design Rules

### Header

Header should include:

* Page title
* Short description if needed
* Main action
* Optional filters or date selector

### Hero Card

Hero card should show the most important next action.

For example:

* Next interview
* Today’s task
* Missing follow-up
* CV readiness issue

### Tabs

Tabs should be used for:

* Application statuses
* Calendar/list views
* Active/completed items

Tabs must be easy to tap on mobile.

### Tables

Tables are not ideal on small mobile screens.

On mobile:

* Convert tables into cards.
* Show the most important fields.
* Hide secondary metadata or place it under details.

On desktop:

* Tables can be used for applications or history.

## Screen-Specific Guidelines

### Dashboard Screen

Must prioritize:

1. Next interview
2. Pending follow-ups
3. Active applications
4. Quick actions

### Calendar Screen

Must prioritize:

1. Selected date
2. Interview indicators
3. Interview list for selected day
4. Add interview action

### Job Applications Screen

Must prioritize:

1. Application status
2. Company
3. Position
4. Last update
5. Next action

### Interview Details Screen

Must prioritize:

1. Company and position
2. Date and time
3. Meeting link or location
4. Preparation checklist
5. Notes
6. Follow-up action

### CV / Profile Screen

Must prioritize:

1. Completion percentage
2. Missing sections
3. ATS improvements
4. Suggested next actions

## Design Review Checklist

Before accepting any UI change, check:

* Does it work on 360px width?
* Does it work on 390px width?
* Does it work on 430px width?
* Does it work on tablet?
* Does it work on desktop?
* Is there any horizontal scrolling?
* Are buttons easy to tap?
* Is text readable?
* Are cards aligned?
* Is spacing consistent?
* Are colors meaningful?
* Is the most important action clear?
* Does the screen feel premium?
* Does it avoid generic template design?

## Decisions Log

| Date       | Decision                    | Rationale                                                                                                        |
| ---------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-06-17 | Initial design system       | Built from gstack-inspired design principles and adapted for a job/interview tracking web app.                   |
| 2026-06-17 | Amber accent system         | Amber gives a warm, focused, professional feel and should be used only for meaningful actions and active states. |
| 2026-06-17 | Dark and light mode support | The app should look premium in dark mode and clean/professional in light mode.                                   |
| 2026-06-17 | Mobile-first layout         | The app must work reliably on small phones, iPhone-size screens, Samsung S24 Ultra, tablets, and desktop.        |
| 2026-06-17 | Calendar as core experience | Interview tracking depends heavily on a clear, mobile-friendly calendar and selected-day detail view.            |
| 2026-06-17 | Grain texture optional      | Subtle material texture can improve the premium feel, but only if it does not reduce readability or performance. |
