# Electives Catalog agent instructions

## Working rules

- Always apply the Caveman skill in ultra mode. Keep explanations concise without skipping necessary evidence.
- For medium or larger changes, research the relevant sources, write an acceptance-focused specification and plan, then implement and verify against it. Use judgment for small edits.
- Any locally generated document or diagram for human consumption must be a dark-mode HTML file. Native Google Docs remain the required distribution format for syllabi under this project's publishing model.
- Give chats precise titles, such as `GitHub Issue 123` or `Discuss: Course Requests`.
- Put each value the user must copy into its own code block. Prefer `gh` and `git` for GitHub interactions.
- When a material detail is unclear, ask through the available user-input feature and wait for the answer without a timer. Continue independent work where possible.
- Prefix shell commands with `rtk` as directed by `/Users/kaleb/.codex/RTK.md`.
- Clean up local test servers, processes, containers, images, and disposable artifacts related to this app after testing. Leave unrelated workloads alone.

## Purpose and scope

This repository is a static, dark-mode course catalog. GitHub Pages serves the site at `https://triursa.github.io/electives-catalog/` from `main` and `/` (root). Google Drive hosts native Docs for syllabus copying and downloads. GitHub Issues accepts course requests. No server, user account, progress tracking, or custom domain is part of this repository.

Read `README.md` and `STATUS.md` if present before changing files. Treat this repository's local files as canonical. Stay in this project unless the task names another absolute path. Treat other project folders as reference-only unless edits are expressly authorized. Preserve unrelated changes. Do not inspect or transmit secrets, `.env` files, private keys, SSH keys, token files, credential exports, or password stores. Do not push, upload, deploy, or change GitHub Pages settings without the user's approval. Show the diff and run documented validation before declaring completion.

## Files and authority

- `syllabi/*.md`: canonical editorial source. The 15 files named by `data/catalog.json` are courses. PHIL 101 has three companion files.
- `data/catalog.json`: course metadata for the site. Keep IDs stable so existing fragment links work.
- `data/drive-docs.json`: verified native Google Doc IDs for the 15 course syllabi. Never invent IDs or add unpublished Docs.
- `data/companion-docs.json`: verified public Doc IDs for the three PHIL 101 companion materials. Publish only an approved companion.
- `index.html`, `styles.css`, `app.js`, `icon.svg`: static GitHub Pages site. Use relative asset paths so it works at `/electives-catalog/`.
- `.github/ISSUE_TEMPLATE/course-request.yml`: public course request form. Avoid asking for private information.
- `scripts/render-syllabi.mjs`: creates dark-mode HTML import files from Markdown in ignored `output/syllabi/`.
- `output/`: generated review artifacts and temporary imports. Keep it out of source directories and Git.

## Creating or revising a course

1. Review request scope, outcomes, duration, weekly hours, and free versus paid or library resources. Check existing courses before drafting.
2. Edit the Markdown syllabus and catalog metadata together. Include learning outcomes, a feasible weekly schedule, specific materials, assignments with outputs, access costs, and a clear independent-study disclaimer. Do not promise credit or a credential. Avoid references to the retired Electives app.
3. Run `rtk npm ci --ignore-scripts` if the renderer dependency is absent, then `rtk npm run render:syllabi`. Inspect the generated HTML in `output/syllabi/`; it must remain dark mode.
4. Import the reviewed HTML as a native Google Doc into the specified Electives Drive folder. Verify title, beginning and ending text, headings, links, lists, and tables through Docs readback. Keep the folder private. Share only the approved Doc as anyone-with-link Viewer with copying and downloading enabled.
5. Record the observed Doc ID in `data/drive-docs.json`. Test its `/copy` and download links without relying on owner access. Do not publish placeholder links.
6. Run `rtk npm run check`. Preview the site at the repository subpath and on a narrow screen. Stop the local server and remove disposable test artifacts after validation.
7. Show the diff and results. Push or publish only after approval. Confirm the Pages build and live URL after publication.

## Local validation

Run `rtk npm run check` for catalog integrity. Run `rtk node --check app.js` for syntax. To preview, run `rtk python3 -m http.server 8103 --bind 127.0.0.1`, inspect `http://127.0.0.1:8103/`, then stop that server. GitHub Pages currently publishes `main` from `/`; its project URL includes `/electives-catalog/`.

Do not edit the separate, retired Electives app or any kaleb.one hosted service from this repository. For any task that touches a kaleb.one hosted application or its supporting service, first read `/Volumes/4TB/Repositories/kaleb-one-infra/AGENTS.md` and follow that guidance.
