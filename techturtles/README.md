# Tech Turtles (techturtles.space)

A website for young inventors: learn the basics, find free resources, and post inventions or papers.
No build step. Run `python3 -m http.server 8000` in this folder and open http://localhost:8000.

Without keys in `js/config.js` the site runs in demo mode (posts saved only in your browser).
To make posting real, follow **SETUP.md**.

## Where to edit what

| I want to change...                           | Edit this file          |
|-----------------------------------------------|-------------------------|
| Supabase keys, upload limits, show/hide examples | `js/config.js`       |
| Database tables, rules, file bucket           | `sql/setup.sql`         |
| Colors, fonts, rounded corners, dark theme    | `css/tokens.css`        |
| Home page text and learning sections          | `index.html`            |
| Showcase cards                                | `showcase.html`, `js/render.js` |
| Submission form                               | `submit.html`, `js/form.js` |
| The five steps, library links, example cards  | `js/data.js`            |
| Page width, header, hero, section spacing     | `css/layout.css`        |
| Buttons, cards, form and sign-in look         | `css/components.css`    |
| How cards/steps/links are built as HTML       | `js/render.js`          |
| What happens when someone posts               | `js/form.js`            |
| Sign-in / sign-out                            | `js/auth.js`            |
| Where posts and files are saved               | `js/storage.js`         |
| The turtle picture                            | `assets/turtle.svg`     |

## Structure

```
techturtles/
├── index.html
├── showcase.html
├── submit.html
├── SETUP.md   README.md
├── sql/setup.sql
├── css/   tokens.css  base.css  layout.css  components.css
├── js/    config.js  data.js  storage.js  auth.js  render.js  form.js  main.js
└── assets/turtle.svg
```

Scripts load in the order listed at the bottom of `index.html`. Each adds itself to a shared `TT` object.

## How posting works (live mode)
1. A visitor signs in with an email link.
2. They submit the form. The file goes to the `papers` bucket and the details go to the `posts` table with `approved = false`.
3. You tick `approved` in the Supabase dashboard. Only then does everyone see the post on `showcase.html`. Owners can remove their own posts from the showcase at any time.
