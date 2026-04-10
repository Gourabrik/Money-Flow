# Money Flow 5.0

## A Modern Personal Finance Dashboard

Money Flow 5.0 is a polished browser-based solution for personal financial management. Designed to deliver fast, secure tracking for expenses, income, savings, and goals, it keeps all data locally in the browser and removes the need for server-side infrastructure.

This project combines a clean interface with built-in analytics, visual reporting, and a lightweight architecture that makes it ideal for individuals seeking an accessible expense tracker without backend complexity.

## Table of Contents

- [Money Flow 5.0](#money-flow-50)
  - [A Modern Personal Finance Dashboard](#a-modern-personal-finance-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Key Features](#key-features)
  - [User Experience](#user-experience)
  - [Technology Stack](#technology-stack)
  - [Getting Started](#getting-started)
    - [Notes](#notes)
  - [Project Structure](#project-structure)
  - [Limitations](#limitations)
  - [Future Roadmap](#future-roadmap)
  - [License](#license)

## Overview

Money Flow 5.0 provides a clear and responsive interface for personal finance management. The application enables users to record expenses, segment income sources, and visualize spending trends with charts and calendar heatmaps.

The core value is simplicity: no server setup, no external database, and a fast, self-contained experience for individual users.

## Key Features

- Expense entry and category tracking
- Separate income tracking for online and cash sources
- Savings and debt management with goal support
- Daily and monthly financial summaries
- Heatmap-based expense calendar
- Spending insights with trend, average, and category analysis
- Simulated login flow for guest or Google-style access
- Data persistence using browser `localStorage`

## User Experience

- Responsive layout for desktop and mobile browsers
- Modular reporting sections for daily, monthly, heatmap, and insights views
- Simple entry workflows for both expenses and income
- In-page notifications and confirmation prompts
- Immediate updates when new activity is recorded

## Technology Stack

- HTML5
- CSS3
- JavaScript
- Tailwind CSS (CDN)
- Chart.js
- jsPDF + jsPDF-AutoTable
- Font Awesome

## Getting Started

1. Clone or download the repository.
2. Open `login.html` in a modern browser.
3. Sign in using the guest option or simulated Google login.
4. Use the main interface to add income, log expenses, and review reports.

### Notes

- All data is stored in the browser. Clearing browser storage or using a private session will remove saved data.
- The current login implementation is a interface-only simulation and does not connect to an authentication backend.

## Project Structure

- `index.html` — main application dashboard
- `login.html` — entry point for user access
- `script.js` — application logic, state handling, and reporting
- `login.js` — simulated sign-in controls
- `style.css` — project styling and theming
- `project_report.md` — detailed technical and project documentation

## Limitations

- No backend or remote sync support
- Data is available only on the local browser and device
- Authentication is currently simulated, not secure for production use

## Future Roadmap

- Real user authentication and account persistence
- Cloud-based data storage and sync across devices
- Import/export of transaction history
- Enhanced budget and alert settings
- Additional analytics and category customization

## License

This project is currently available for personal use and review. Include the appropriate open source license if you plan to publish it publicly.
