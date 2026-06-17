
# App Screens

## Purpose

This document defines the main screens of the AI CV Tracker / Job & Interview Tracking App.

AI agents must read this file before changing the UI, layout, or user experience.

The app should help users manage:

* Job applications
* CV progress
* Interview preparation
* Interview calendar
* Follow-up actions
* Career tasks
* Application analytics

## Global UX Rules

Every screen must answer:

1. What is the user trying to do here?
2. What is the most important information?
3. What is the main action?
4. What should the user do next?
5. Does this screen work on mobile?

General rules:

* Keep screens simple.
* Avoid clutter.
* Use clear hierarchy.
* Use cards for grouped information.
* Use badges for statuses.
* Use short, helpful text.
* Make primary actions obvious.
* Avoid too much text inside cards.
* Empty states must include an action.

## Main Navigation

Recommended main sections:

1. Dashboard
2. Applications
3. Calendar
4. Interviews
5. CV / Profile
6. Tasks or Follow-ups
7. Analytics / Insights

On mobile:

* Use bottom navigation or compact menu.
* Keep only 4 to 5 main items visible.
* Less important screens can be inside menu/settings.

On desktop:

* Use sidebar or top navigation.
* Show active section clearly.

## Dashboard Screen

### Purpose

The Dashboard gives the user a quick overview of what matters today.

### Main Questions

The dashboard should answer:

* What is my next interview?
* What applications need action?
* How many applications are active?
* What follow-ups are pending?
* Is my CV ready?
* What should I do next?

### Recommended Sections

1. Next Interview Hero Card
2. Today’s Actions
3. Application Status Summary
4. Upcoming Interviews
5. Pending Follow-ups
6. CV Readiness / ATS Score
7. Recent Applications
8. Quick Actions

### Primary Actions

* Add job application
* Add interview
* Prepare for interview
* Add follow-up
* Update CV

### Design Rules

* The first card must show the most important next action.
* Do not show too many statistics without meaning.
* Use visual hierarchy.
* Cards should be scannable.
* Mobile layout should be one column.
* Desktop can use a grid.

### Empty State

If there is no data:

Title:
“No applications yet”

Description:
“Start by adding your first job application so you can track progress, interviews, and follow-ups.”

Primary action:
“Add application”

## Applications Screen

### Purpose

The Applications screen shows all job applications and their current status.

### Must Show

Each application should show:

* Company name
* Position title
* Location
* Application date
* Current status
* Last update
* Next action
* Source or link if available

### Statuses

Recommended statuses:

* Saved
* Applied
* Screening
* Interview scheduled
* Interview completed
* Offer
* Rejected
* Waiting response
* Follow-up needed

### Filters

Useful filters:

* All
* Active
* Interviews
* Waiting
* Offers
* Rejected
* Follow-up needed

### Primary Actions

* Add application
* Edit application
* Update status
* Add interview
* Add follow-up
* Open job link

### Mobile Layout

On mobile:

* Use cards instead of table.
* Show company, position, status, and next action first.
* Secondary data can be smaller.
* Filters should scroll horizontally or open as a sheet.

### Desktop Layout

On desktop:

* Cards or table are both acceptable.
* Table can show more metadata.
* Filters can be visible at top.

### Empty State

Title:
“No job applications yet”

Description:
“Add the jobs you applied to and track every stage from application to offer.”

Primary action:
“Add application”

## Calendar Screen

### Purpose

The Calendar screen helps users see upcoming interviews, reminders, and follow-ups by date.

### Must Show

* Current month
* Today
* Selected day
* Days with interviews
* Days with follow-ups
* Multiple events on the same day
* Selected day details

### Event Types

Possible event types:

* Interview
* Follow-up
* CV update task
* Application deadline
* Reminder
* Company research task

### Visual Indicators

Use:

* Dots
* Count badges
* Status color
* Small labels where space allows

Examples:

* One interview: one dot
* Multiple interviews: count badge
* Follow-up: warning indicator
* Deadline: danger indicator

### Selected Day Details

When the user selects a day, show:

* Date
* Number of events
* Interview cards
* Follow-up tasks
* Add event action

### Mobile Rules

On mobile:

* Calendar must not be tiny.
* Day cells must be tappable.
* Details should appear below the calendar.
* Use bottom sheet if opening detailed event view.
* Avoid small center modal.
* Multiple events should be stacked as cards.

### Desktop Rules

On desktop:

* Calendar can be larger.
* Selected day details can appear in side panel.
* Month/week/list views can be available.

### Primary Actions

* Add interview
* Add reminder
* Add follow-up
* View event details

### Empty State

For selected day with no events:

Title:
“No events on this day”

Description:
“Add an interview, follow-up, or reminder to stay organized.”

Primary action:
“Add event”

## Interviews Screen

### Purpose

The Interviews screen helps users prepare for and manage interview stages.

### Must Show

Each interview should show:

* Company name
* Position title
* Interview date
* Interview time
* Interview type
* Meeting link or location
* Interviewer if available
* Preparation status
* Notes
* Follow-up status

### Interview Types

Possible types:

* Phone screening
* HR interview
* Technical interview
* Manager interview
* Final interview
* On-site interview
* Online meeting

### Primary Actions

* Join meeting
* Prepare
* Add notes
* Mark completed
* Send follow-up
* Reschedule
* Add next round

### Interview Card Rules

* The next interview should be highlighted.
* “Join meeting” should be easy to find when relevant.
* Date and time must be easy to scan.
* Long notes should not overload the card.
* Show preparation status clearly.

### Empty State

Title:
“No interviews scheduled”

Description:
“When you get an interview invitation, add it here to track preparation and follow-up.”

Primary action:
“Add interview”

## Interview Details Screen

### Purpose

The Interview Details screen gives all information needed for one specific interview.

### Must Show

* Company
* Position
* Date
* Time
* Interview type
* Location or meeting link
* Interviewer name if available
* Preparation checklist
* Notes
* Questions to ask
* Follow-up action
* Related job application

### Recommended Sections

1. Interview summary
2. Meeting details
3. Preparation checklist
4. Company research
5. Questions to ask
6. Notes
7. Follow-up

### Primary Actions

* Join meeting
* Mark as completed
* Edit details
* Add follow-up reminder
* Add notes

### Mobile Rules

* Use stacked sections.
* Keep primary action sticky or visible near top.
* Meeting link should be easy to tap.
* Long notes should be collapsible if needed.

## CV / Profile Screen

### Purpose

The CV / Profile screen helps users improve their CV and profile readiness.

### Must Show

* Profile completion
* CV readiness score
* Missing sections
* ATS improvement suggestions
* Skills summary
* Experience summary
* Languages
* Certificates
* Uploaded CV if available

### Possible Metrics

* CV completion percentage
* ATS score
* Missing keywords
* Missing contact details
* Missing achievements
* Weak summary
* Skills match

### Primary Actions

* Upload CV
* Edit profile
* Improve summary
* Add skills
* Add experience
* Export CV

### Empty State

Title:
“Your CV is not set up yet”

Description:
“Add your CV and profile details to get better job tracking and preparation suggestions.”

Primary action:
“Set up CV”

## Tasks / Follow-ups Screen

### Purpose

The Tasks screen helps users track small actions related to job search.

### Must Show

Each task should show:

* Task title
* Related company
* Due date
* Priority
* Status
* Related application or interview

### Task Types

Possible task types:

* Send follow-up email
* Prepare for interview
* Research company
* Update CV
* Apply to job
* Check application status
* Add missing notes
* Send thank-you message

### Primary Actions

* Add task
* Mark complete
* Edit task
* Open related application
* Add reminder

### Mobile Rules

* Use task cards.
* Show due date and priority clearly.
* Completed tasks can be collapsed or filtered.

### Empty State

Title:
“No pending tasks”

Description:
“Create follow-up reminders and preparation tasks to stay on track.”

Primary action:
“Add task”

## Analytics / Insights Screen

### Purpose

Analytics helps the user understand progress and job search performance.

### Must Show

Useful insights:

* Total applications
* Active applications
* Interviews received
* Offers
* Rejections
* Response rate
* Interview conversion rate
* Applications by status
* Applications by month
* Follow-ups pending

### Design Rules

* Do not overload users with charts.
* Use simple, useful metrics.
* Explain what the numbers mean.
* Highlight actionable insights.
* Use cards and small charts.

### Primary Actions

* View applications
* Add follow-up
* Improve CV
* Export report if needed

## Settings Screen

### Purpose

Settings controls user preferences and app configuration.

### Must Show

* Language
* Theme
* Notifications
* Data export
* Profile settings
* App preferences

### Rules

* Keep settings simple.
* Group related settings.
* Avoid too many technical options.

## Empty State Rules

Every empty state must include:

1. Clear title
2. Short helpful description
3. Primary action

Bad:
“No data”

Good:
“No interviews scheduled yet. Add your next interview to track preparation and follow-up.”

## Loading State Rules

Loading states should:

* Use skeletons where useful.
* Avoid layout jumps.
* Keep the page stable.
* Not feel broken.

## Error State Rules

Error states should:

* Explain the problem simply.
* Offer a retry or recovery action.
* Avoid technical error messages unless needed.

## Final Screen Review Checklist

Before accepting any screen change, check:

* Is the main action clear?
* Is the hierarchy clear?
* Is there too much text?
* Does it work on mobile?
* Does it work on Samsung S24 Ultra width?
* Does it work on small 360px screens?
* Does it work on tablet and desktop?
* Are cards consistent?
* Are statuses clear?
* Are empty states useful?
* Are buttons easy to tap?
* Is the design premium and professional?
