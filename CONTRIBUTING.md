# Contributing to Jinx Portfolio

Thanks for taking the time to contribute. This is a small static site, so the
bar for a good contribution is low — but the bar for quality is not.

- [Quick start](#quick-start)
- [How to work on a change](#how-to-work-on-a-change)
- [Branch naming](#branch-naming)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Code style](#code-style)
- [Reporting bugs](#reporting-bugs)
- [What will not be merged](#what-will-not-be-merged)

---

## Quick start

There is **no build step and no dependency install**. The site is plain HTML,
CSS and vanilla JavaScript, with a locally vendored Tailwind runtime.

```bash
git clone https://github.com/jinx7-pixel/jinx-portfolio.git
cd jinx-portfolio
```

To preview it, open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# → http://localhost:8000
```

A local server is preferable to opening the file directly, because the contact
form and some animations behave differently over `file://`.

**Stack:** HTML5 · CSS3 · vanilla JavaScript · vendored Tailwind runtime
**Tests:** manual — there is no automated test suite in this repository
**CI:** `.github/workflows/pages.yml` publishes the site to GitHub Pages

---

## How to work on a change

1. **Open an issue first** for anything larger than a typo fix. It stops you
   from building something that will not be accepted.
2. **Branch off `main`.** Never commit directly to `main`.
3. **Make the change**, keeping it as small as possible.
4. **Check it locally** — see the checklist under [Pull requests](#pull-requests).
5. **Open a pull request** and describe what changed and why.
6. **Respond to review.** Push fixes as new commits on the same branch.

---

## Branch naming

Use a slash-separated name that says what the branch is for.

| Prefix | Use it for | Example |
| --- | --- | --- |
| `feature/` | New functionality | `feature/project-filter` |
| `fix/` | A bug fix | `fix/contact-form-mobile` |
| `docs/` | Documentation only | `docs/readme-setup` |
| `style/` | Visual or CSS-only change | `style/dark-mode-tokens` |
| `refactor/` | No behaviour change | `refactor/split-main-js` |
| `chore/` | Repo maintenance | `chore/update-tailwind-runtime` |
| `perf/` | Performance work | `perf/lazy-load-illustrations` |

Rules:

- Lowercase, hyphen-separated words.
- One branch, one concern. If a PR needs two unrelated changes, split it.
- A branch that has been merged is deleted. A branch that was closed without a
  merge is kept for a week, then deleted.
- Rebase on `main` before requesting review, so the diff is clean:
  ```bash
  git fetch origin
  git rebase origin/main
  ```

---

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(optional scope): <short summary in the imperative mood>

<optional body>

<optional footer>
```

**Format:** `type: what changed`

| Type | Use it for |
| --- | --- |
| `feat` | New user-visible functionality |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace, CSS-only — no behaviour change |
| `refactor` | Code restructure with no behaviour change |
| `perf` | Performance improvement |
| `a11y` | Accessibility improvement |
| `chore` | Build, tooling, dependency updates |
| `build` | Build system or dependency changes |

**Scope** is optional and names the area touched:

```
feat(sections): add a testimonials carousel
fix(contact): stop the form submitting on Enter
```

Good examples:

```
feat(about): add a download link for the CV
fix(nav): close the mobile menu after a link is tapped
docs(readme): document the python preview command
a11y(nav): add aria-expanded to the mobile menu toggle
chore(tailwind): update vendored runtime to v4
```

Avoid:

```
updated some stuff
fixed bug
.wq:wq:wq
```

Rules:

- Subject line: imperative mood, no trailing full stop, 72 characters or fewer.
- One logical change per commit.
- Explain **why** in the body when it is not obvious. The diff already shows
  *what* changed.
- Reference issues with `Fixes #12` or `Closes #12`, not `See #12`.

---

## Pull requests

Every PR is checked against this list before it is merged:

- [ ] The change is on a branch, not on `main`.
- [ ] The PR description explains **what** changed and **why**.
- [ ] The site still works with JavaScript enabled and with it disabled.
- [ ] The site was checked on a mobile viewport (375px) and a desktop viewport.
- [ ] The browser console is clean — no new errors or warnings.
- [ ] The layout does not break between 320px and 2560px wide.
- [ ] No secrets, `.env` files, or personal data are included.
- [ ] No unrelated reformatting or refactoring crept in.
- [ ] Screenshots are attached for any visual change.

### Review guidelines

Reviewers are looking for:

- **Correctness** — does it do what the description says, and does it break
  anything else?
- **Scope** — is the change limited to what it claims to change?
- **Accessibility** — keyboard reachable, visible focus, sensible heading order,
  sufficient contrast, `alt` text on meaningful images.
- **Performance** — the vendored Tailwind runtime is ~400 KB and is loaded on
  every visit. Do not add another large dependency without discussing it.
- **Consistency** — does it match the existing naming and structure?

**How to review:**

1. Read the description first, then the diff.
2. Run the site locally before approving: `python -m http.server 8000`.
3. Check the change on a mobile viewport, not just a wide browser window.
4. Open the console and look for errors.
5. Comment on the code, not the person. Say what you mean, and say why it matters.
6. Approve when it is good enough to merge. Do not hold a PR hostage over a
   preference that is not written in the style guide.

**Who merges:** the repository owner. Any approved PR can be merged.

---

## Code style

There is no linter configured for this repository, so the conventions are
social — but they are consistent, so follow them.

**HTML**

- Two-space indentation.
- Semantic elements first: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- `id` values are kebab-case and match the `href` fragments exactly.
- Every `<img>` has an `alt`. Use `alt=""` only for decorative images.
- Buttons that do nothing without JavaScript must still be real `<button>`
  elements, not `<div>` with a click handler.

**CSS**

- Two-space indentation, one selector per line.
- Custom properties live at the top of `css/styles.css` in `:root`.
- Class names are kebab-case and describe appearance or role
  (`.project-card`, `.nav-toggle`), never position (`.left-thing`).
- Mobile-first: base styles target small screens, then media queries add
  complexity. Keep the breakpoints consistent with the ones already in the file.
- Prefer `rem` for type, `clamp()` for fluid sizing, and logical properties
  (`margin-inline`, `padding-block`) so the layout respects writing direction.
- Respect `prefers-reduced-motion` for any animation you add.

**JavaScript**

- Two-space indentation, `const` by default, `let` only when reassigned.
- `const`/`let`, never `var`.
- `async`/`await` over raw promise chains.
- Feature-detect before using a browser API; Safari is not the only target.
- Keep `js/main.js` organised in clearly commented sections. If it grows past
  what is comfortable, split it into modules under `js/`.
- No inline event handlers (`onclick="..."`) in the HTML.

**General**

- No dead code and no commented-out blocks. Delete it or commit it.
- No secrets, API keys, or real customer data — ever.
- Do not commit the `node_modules/` directory; there is none, and there should
  not be.

---

## Reporting bugs

Use the **Bug report** issue template. It asks for the environment, the steps to
reproduce, and the expected behaviour. A good bug report includes:

- The browser and viewport width.
- The exact steps, starting from a fresh page load.
- What you saw and what you expected instead.
- A screenshot or the console output, with any personal data removed.

Security vulnerabilities should **not** be opened as public issues. Follow
[SECURITY.md](SECURITY.md) instead.

---

## What will not be merged

- A change with no description and no screenshots, for a visual project.
- A wholesale rewrite of `index.html` or `css/styles.css` in a single PR.
- The vendored `css/tailwind.js` runtime being replaced with a CDN link, or
  with a build step, without a prior discussion.
- New frameworks, bundlers, or dependencies. This project is deliberately
  dependency-free.
- Anything that breaks the page when JavaScript is disabled.
- Unrelated formatting changes bundled in with a feature.
- A commit message of `.wq` / `wq` / `Merge branch 'main' of …` with no
  meaningful description.

---

## Code of Conduct

Participation in this project is governed by
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). By contributing you agree to follow it.

## Licence

See [LICENSE](LICENSE).
