# Multithreading Task Management System — Web Version

A browser-based version of the task manager built with HTML, CSS, and JavaScript.

## Features
- Add tasks
- Start all pending tasks
- Pause, resume, and stop a selected task
- Track progress from 0% to 100%
- Live counts for total, running, paused, completed, and stopped tasks
- Responsive layout for desktop and mobile

## Files
- `index.html` — page structure
- `style.css` — layout and visual styling
- `script.js` — task state, progress simulation, controls, and statistics

## Run locally
1. Extract the ZIP file.
2. Open the extracted folder.
3. Double-click `index.html`, or open the folder in VS Code and use Live Server.

No installation or backend is required.

## Deploy to Netlify
1. Sign in to Netlify.
2. Open your site and choose the manual deploy / Drop new files option.
3. Upload the extracted project folder containing `index.html`, `style.css`, and `script.js`.
4. Open the published site URL.

## Note
This is a browser-based simulation of concurrent task activity using JavaScript timers. Browsers do not run Java Swing `Thread` objects; this web version reproduces the task-management features in JavaScript.
