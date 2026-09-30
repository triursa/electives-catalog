# Electives Catalog

Electives is a static collection of independent, college-style self-study courses. Browse a course, make a personal copy of its Google Docs syllabus, or download a PDF or Word file. Request a new course through the [GitHub issue form](https://github.com/triursa/electives-catalog/issues/new?template=course-request.yml).

Courses are study plans, not academic credit or credentials. Some require books or library access; each course page identifies that requirement.

## Publishing model

The 15 Markdown syllabi in `syllabi/` are the editorial source. Public, view-only Google Docs in the private `Electives / Public Syllabi` Drive folder serve copies and downloads. `data/catalog.json` holds course metadata, while `data/drive-docs.json` maps stable course IDs to verified Google Doc IDs. PHIL 101 also has three public companion Docs listed in `data/companion-docs.json`. The site has no account, backend, or progress tracker.

GitHub Pages is configured to publish `main` from the repository root at **https://triursa.github.io/electives-catalog/**. No custom domain is configured. Local edits do not update the live site until approved changes are pushed to `main`.

## Development

The site itself has no build step. Use a local server because the browser fetches JSON:

```sh
rtk python3 -m http.server 8103 --bind 127.0.0.1
```

Open `http://127.0.0.1:8103/`. Stop the server after testing.

Run `rtk npm run check` for catalog integrity and `rtk node --check app.js` for JavaScript syntax. To render updated Markdown as dark-mode HTML for Google Docs import, run `rtk npm ci --ignore-scripts` followed by `rtk npm run render:syllabi`. Generated files go in ignored `output/syllabi/`.

Read [AGENTS.md](AGENTS.md) for the course and release workflow. The previous full Electives app is archived separately at [triursa/electives](https://github.com/triursa/electives).
