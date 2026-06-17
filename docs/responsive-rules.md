
# Responsive Rules

## Purpose

This document defines the responsive design rules for the AI CV Tracker / Job & Interview Tracking App.

The app must work reliably on small phones, large phones, tablets, and desktop screens.

The main goal is to avoid layout problems such as:

* Broken cards
* Text overflow
* Buttons going outside the screen
* Horizontal scrolling
* Huge spacing differences between emulator and real phones
* UI looking good on one phone but bad on another

## Supported Screen Sizes

The app must be checked and optimized for:

* 360px width — small Android phones
* 375px width — iPhone mini / small mobile
* 390px width — common iPhone size
* 412px width — common Android size
* 430px width — large phones like Samsung S24 Ultra
* 768px width — tablets
* 1024px+ width — desktop and laptop

## Core Rule

Design mobile-first.

Start with the smallest phone layout first, then improve the layout for larger screens.

Do not build desktop first and then squeeze it into mobile.

## Layout Rules

### General

* Do not use fixed page widths.
* Do not use fixed card widths.
* Do not use fixed screen heights unless absolutely necessary.
* Avoid horizontal scrolling.
* Use responsive containers.
* Use `max-width` for large screens.
* Use `width: 100%` for mobile elements.
* Use `box-sizing: border-box`.
* Use safe padding on mobile.
* Use flexible spacing.

### Recommended CSS Patterns

Use:

```css
* {
  box-sizing: border-box;
}

.page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(16px, 4vw, 32px);
}

.card {
  width: 100%;
  min-width: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: clamp(12px, 3vw, 24px);
}
```

## Typography Rules

Use responsive font sizes.

Recommended:

```css
h1 {
  font-size: clamp(28px, 6vw, 48px);
}

h2 {
  font-size: clamp(22px, 4vw, 32px);
}

h3 {
  font-size: clamp(18px, 3vw, 24px);
}

p,
button,
input,
select,
textarea {
  font-size: clamp(14px, 2.5vw, 16px);
}
```

Rules:

* Avoid text smaller than 12px on mobile.
* Body text should usually be 14px to 16px.
* Important titles should not become too huge on large phones.
* Use `line-height` for readability.
* Avoid long text in small cards.

## Spacing Rules

Use `clamp()` for responsive spacing.

Recommended:

```css
.section {
  margin-bottom: clamp(20px, 5vw, 48px);
}

.card {
  padding: clamp(14px, 4vw, 24px);
  border-radius: clamp(14px, 3vw, 20px);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 3vw, 20px);
}
```

Rules:

* Mobile padding should not be too large.
* Desktop spacing should not feel empty.
* Related elements should be close.
* Different sections should have more spacing.

## Card Rules

Cards must:

* Fit inside 360px screen width.
* Never overflow horizontally.
* Use `width: 100%`.
* Use `min-width: 0`.
* Wrap text correctly.
* Keep buttons inside the card.
* Avoid large fixed images or icons.

Bad:

```css
.card {
  width: 420px;
}
```

Good:

```css
.card {
  width: 100%;
  max-width: 420px;
}
```

For dashboard cards:

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 16px;
}
```

## Button Rules

Buttons must:

* Be easy to tap.
* Have enough height.
* Not overflow on mobile.
* Wrap or stack if there are multiple actions.

Recommended:

```css
.button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
}

.button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 430px) {
  .button-row {
    flex-direction: column;
  }

  .button-row .button {
    width: 100%;
  }
}
```

## Header Rules

On mobile:

* Header should be compact.
* Avoid too many buttons in one row.
* Page title should not overflow.
* Secondary actions can move under the title.
* Search and filters can stack.

On desktop:

* Header can use horizontal layout.
* Actions can be aligned to the right.

Recommended:

```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
```

## Navigation Rules

### Mobile

Use either:

* Bottom navigation
* Compact top navigation
* Menu button

Rules:

* Maximum 4 to 5 main items.
* Active item must be clear.
* Tap targets must be large.
* Avoid desktop sidebar on small screens.

### Desktop

Use:

* Sidebar navigation
* Top navigation
* Clear active section

## Calendar Rules

The calendar is a core screen and must be mobile-friendly.

Rules:

* Calendar day cells must be large enough to tap.
* Dates must not be tiny.
* Multiple interviews on the same day must be visible.
* Selected day must be obvious.
* Today must be obvious.
* Interview details should appear below calendar or in a bottom sheet on mobile.
* Avoid small center popups on mobile.

Recommended mobile behavior:

* Calendar on top.
* Selected day summary under calendar.
* Interview cards stacked vertically.
* Add Interview button visible.

## Tables Rules

Tables are risky on mobile.

On mobile:

* Convert tables into cards.
* Show only important data first.
* Hide secondary metadata or place it under details.
* Avoid horizontal scrolling unless the data truly needs it.

On desktop:

* Tables can be used for job applications, history, or analytics.

## Forms Rules

Forms must work perfectly on mobile.

Rules:

* Inputs should be full width.
* Labels must be clear.
* Avoid two-column forms on mobile.
* Use one-column layout under 768px.
* Buttons should stack on small screens.
* Date/time fields should be easy to use.

Recommended:

```css
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

## Modal and Bottom Sheet Rules

On desktop:

* Center modals are acceptable.

On mobile:

* Prefer bottom sheets.
* Avoid small center modals.
* Sheet should use most of the screen width.
* Sheet content should be scrollable when needed.

Recommended:

```css
@media (max-width: 600px) {
  .modal {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    width: 100%;
    max-height: 85vh;
    border-radius: 20px 20px 0 0;
    overflow-y: auto;
  }
}
```

## Overflow Rules

Check for:

* Long company names
* Long job titles
* Long email addresses
* Long URLs
* Long meeting links
* Long notes
* Arabic and English text mixing

Use:

```css
.text-safe {
  overflow-wrap: anywhere;
  word-break: break-word;
  min-width: 0;
}
```

For single-line labels:

```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## Arabic / English Layout Rules

The app may contain English and Arabic content.

Rules:

* Support mixed direction text.
* Avoid layout breaking when Arabic text appears.
* Do not assume all text is short.
* Keep icons and labels aligned.
* Test with long Arabic labels.

## Real Phone Testing Checklist

Test every main screen at:

* 360px
* 390px
* 430px
* 768px
* Desktop

Check:

* No horizontal scroll
* No clipped text
* No broken card
* Buttons stay inside cards
* Calendar dates are tappable
* Forms are readable
* Header does not break
* Navigation is usable
* Modal or bottom sheet works
* Layout still looks premium

## Final Rule for AI Agents

Before finishing any UI task, check responsive behavior first.

If a screen looks good only on desktop or only on one emulator, the task is not complete.

The app must look correct on real phones, especially:

* Small Android phones
* iPhone-size screens
* Samsung S24 Ultra
