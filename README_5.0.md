# Money Flow 5.0 Release

## Updated Features and Improvements

Money Flow 5.0 introduces a refined personal finance experience with improved reporting, better data visibility, and a stronger user workflow. This release focuses on enhancements to analytics, interface clarity, and local data management while preserving the lightweight, browser-only architecture.

### What's New in 5.0

- **Enhanced insights dashboard** with average spending, top category analysis, financial health score, savings rate, and budget status.
- **Interactive heatmap calendar** for visualizing daily expense intensity across the month.
- **Expanded savings management** including goal tracking, savings balance view, and milestone achievements.
- **Income breakdown** support for separate online and cash income tracking.
- **Refined summary reports** with daily totals, monthly category breakdowns, and a more polished reporting layout.
- **Simulated login gateway** including guest access and Google-style entry flow to improve onboarding.
- **Local persistence enhancements** to keep data stored reliably in browser `localStorage` across sessions.
- **Improved mobile-friendly layout** with responsive navigation and cleaner view switching.

## Feature Overview

- Expense tracking with dynamic categories and daily summaries.
- Income recording for multiple revenue streams.
- Savings, debt, and financial goal monitoring.
- Visual analytics for spending trends and monthly behavior.
- On-screen reports with charts and calendar-based heatmaps.
- Lightweight deployment with no backend dependency.

## Release Notes

This version is intended as a stable, production-ready update for the Money Flow application. It includes:

- better data visualization and UX polish
- more actionable financial insight widgets
- an expanded application dashboard for real-world budgeting
- improved local storage handling and session persistence

## How to Use the Release

1. Open `login.html` in a modern browser.
2. Sign in with the guest option or use the simulated Google-style login.
3. Add income and expense records through the main dashboard.
4. Monitor updated reports in daily, monthly, heatmap, and insights sections.

## Recommended Files

- `index.html` — application dashboard and analytics interface
- `login.html` — login gateway for user entry
- `script.js` — core application behavior and reporting logic
- `login.js` — login flow handlers for guest and Google-style sign-in
- `style.css` — UI styling and responsive layout rules

## Notes

- The login flow remains a simulation intended for local demonstration.
- All tracked data is saved locally in the browser and is not synced to a remote server.

## Looking Ahead

Future updates may add real account authentication, cloud sync, import/export support, and deeper budget planning tools.
