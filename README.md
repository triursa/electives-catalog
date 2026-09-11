# Electives Catalog

A static catalog of self-study college-level syllabi. Browse courses by subject, read learning objectives, weekly schedules, and resource lists, then download the full syllabus as Markdown.

Hosted at **electives.courses** via GitHub Pages.

## Courses

15 syllabi across 7 subjects: Philosophy, Political Science, Economics, Creative Writing, Legal Studies, Library Science, Interdisciplinary Studies, Humanities, and Religion.

## Development

This is a fully static site. No build step, no dependencies, no server.

```sh
python3 -m http.server 8103 --bind 127.0.0.1
```

Open http://127.0.0.1:8103.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | Responsive classical/obsidian theme |
| `app.js` | Vanilla JS catalog: routing, filtering, search, detail views |
| `data/catalog.json` | Course metadata (generated from source `syllabi.json`) |
| `syllabi/*.md` | Full syllabus Markdown files |
| `icon.svg` | Favicon |

## Data Source

Course data originates from the [Electives app](https://electives.kaleb.one) ([repo](https://github.com/triursa/syllabi)). The catalog is a read-only snapshot for public browsing and download.