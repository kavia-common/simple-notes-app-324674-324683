# Simple Notes (React)

Simple Notes is a small, frontend-only notes app built with React. It supports creating, editing, deleting, and searching notes. All data is stored in the browser via `localStorage`, and there is no backend service.

## Features

The current app implementation includes the following user-facing capabilities:

- Adding notes with a title and content.
- Editing an existing note inline within its card.
- Deleting a single note (with a confirmation prompt).
- Deleting all notes (with a confirmation prompt).
- Searching notes by title or content.
- Local persistence using `localStorage`.

## Getting started

This app is a Create React App project.

### Prerequisites

You need Node.js and npm installed.

### Install dependencies

From this folder (`notes_frontend/`):

```bash
npm install
```

### Run in development

```bash
npm start
```

Then open http://localhost:3000.

### Run tests

Create React App runs tests in watch mode by default. In CI, you typically run it with `CI=true`.

```bash
npm test
```

### Build for production

```bash
npm run build
```

## Usage

When the app loads, the “Title” field is focused for quick note capture.

To create a note, fill in a title and/or content and click “Add note”. If you leave the title empty but provide content, the title is saved as `Untitled`. If both title and content are empty, the note is not created.

To edit a note, click “Edit” on a note card, update the fields, and press “Save”. To abandon changes, click “Cancel”.

To delete notes, use either “Delete” on a card or “Delete all” in the header. Both actions show a browser confirmation dialog.

## Data storage and persistence

Notes are stored locally in the browser using `localStorage` under the key:

- `simple-notes-app:notes:v1`

Each note object contains:

- `id` (string) – locally-generated identifier
- `title` (string)
- `content` (string)
- `createdAt` (number, epoch millis)
- `updatedAt` (number, epoch millis)

Because storage is local to the browser, notes are specific to the device and browser profile. Clearing site data will remove notes.

## Code structure

The app is intentionally small and keeps logic in a minimal set of files:

- `src/App.js` contains the UI and all core behaviors (add/edit/delete/search) and `localStorage` persistence.
- `src/App.css` defines the modern light theme, layout, and component styling.
- `src/index.css` defines global CSS and typography (Inter).
- `src/App.test.js` includes a basic render test for the main header.

## Design and theme notes

The UI uses a modern light theme with these primary accents:

- Primary: `#3b82f6`
- Accent: `#06b6d4`
- Danger: `#ef4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`

These are defined as CSS variables in `src/App.css` and used across buttons, focus rings, and card states.

## Environment variables

This frontend does not require any environment variables to run. If your environment provides `REACT_APP_*` variables, they are currently not used by the app.

## Learn more

- React documentation: https://react.dev/
- Create React App documentation: https://create-react-app.dev/
