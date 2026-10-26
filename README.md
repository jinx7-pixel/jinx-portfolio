# Jinx Developer Portfolio

A responsive personal portfolio built as a static website with HTML, CSS, a locally vendored Tailwind runtime, and vanilla JavaScript. It has no server or build step.

## Project files

```text
.
├── index.html       # Portfolio sections and page content
├── css/
│   ├── styles.css   # Custom design, responsive layouts, and animations
│   └── tailwind.js  # Locally vendored Tailwind runtime
├── js/
│   └── main.js      # Navigation, scroll effects, and interaction logic
└── assets/          # Portfolio illustrations and project thumbnails
```

## Preview locally

Open `index.html` directly, or serve the project folder with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

The contact section uses `mailto:` links, so sending a message opens the visitor's configured email app. No backend or database is required.
