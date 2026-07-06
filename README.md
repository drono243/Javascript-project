# 📚 Read Later Debt Tracker

A simple, no-BS tracker for all the articles, videos, courses, and books you bookmarked to "read later" — and never did.

Instead of just being another checklist app, this one calculates exactly how long each item has been sitting unread and confronts you with the numbers. No streaks, no gamification. Just your actual reading debt, laid out in days.

## Why this exists

Everyone has a "read later" list that's really a graveyard. This app doesn't let you forget that — it tracks the age of every unread item and shows you the total backlog you're carrying, so you can either finally deal with it or consciously let it go.

## Features

- **Add bookmarks** — title, type (article / video / course / book), and an optional URL
- **Backlog age tracking** — every unread item shows exactly how many days old it is
- **Color-coded urgency** — green (0-3 days), yellow (4-14 days), red (15+ days)
- **Dashboard stats** — total unread count, total reading debt (in days), average backlog age, and your single oldest unread item
- **Mark as Read / Abandon** — move items out of your active debt into an archive
- **Sort by oldest first** — the worst offenders always surface to the top
- **Filter by type** — view just articles, videos, courses, or books
- **Persistent storage** — everything saves to your browser via `localStorage`, no backend needed

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript (no frameworks, no libraries)

Built as a beginner project after a 7-day JavaScript course — the goal was clean, simple code over anything fancy.

## How to run it

1. Clone or download this repo
2. Open `index.html` in your browser
3. That's it — no build steps, no dependencies

```bash
git clone https://github.com/yourusername/read-later-debt-tracker.git
cd read-later-debt-tracker
open index.html
```

## Project Structure

```
read-later-debt-tracker/
├── index.html
├── style.css
└── script.js
```

## How it works

Each bookmark is stored as an object:

```js
{
  id: 1720180000000,
  title: "Deep Work by Cal Newport",
  type: "book",
  url: "",
  dateAdded: 1720180000000,
  status: "unread"
}
```

Backlog age is calculated by comparing `dateAdded` to the current timestamp:

```js
const daysOld = Math.floor((Date.now() - dateAdded) / (1000 * 60 * 60 * 24));
```

All bookmarks are stored in an array and saved to `localStorage`, so your data persists across sessions without needing a database.

## What's next (possible future additions)

- Export backlog data as a CSV
- Weekly email/notification reminders for oldest items
- "Give up" mode — auto-archive anything past 60 days

## License

Free to use, modify, and learn from.

---

Built by Ruturaj kulkarni & Ganesh badgujar as a first JavaScript project.
