# JSON‑driven Quiz App (GitHub Pages)

A simple, Bootstrap‑styled, JSON‑driven single‑page quiz application suitable for hosting on GitHub Pages as a **project site**.

## Repo layout
- `index.html` — single page app
- `assets/css/style.css` — custom styles
- `assets/js/quiz.js` — app logic (loads `./assets/data/questions.json`)
- `assets/data/questions.json` — question data (JSON)
- `.gitignore` — common ignores

## Deploy to GitHub Pages
1. Create a new GitHub repository (e.g., `my-quiz`).
2. Clone locally and copy these files into the repo.
3. Commit and push to GitHub.
4. In the repository on GitHub, go to **Settings → Pages**.
   - For a project site, choose **Branch: main** (or your default branch) and **Folder: / (root)**, or place files in `/docs` and select `/docs`.
5. After a minute or two, your site will be available at:
   `https://<username>.github.io/<repo-name>/`

**Important:** This project uses relative paths (`./assets/...`) so it works correctly under the repo subpath.

## How to add or edit questions
1. Open `assets/data/questions.json`.
2. Add or edit question objects. Each question has:
   - `id` (number)
   - `title` (string)
   - `text` (string)
   - `answers` (array of acceptable answers as strings)
   - `type` (string; currently `"text"`)

Example:
```json
{
  "id": 4,
  "title": "History",
  "text": "Who wrote the Declaration of Independence?",
  "answers": ["thomas jefferson", "jefferson"],
  "type": "text"
}
