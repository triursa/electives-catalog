import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { marked } from 'marked';

const root = resolve(import.meta.dirname, '..');
const catalog = JSON.parse(await readFile(resolve(root, 'data/catalog.json'), 'utf8'));
const destination = resolve(root, 'output/syllabi');
await mkdir(destination, { recursive: true });

for (const file of (await readdir(resolve(root, 'syllabi'))).filter(name => name.endsWith('.md')).sort()) {
  const markdown = await readFile(resolve(root, 'syllabi', file), 'utf8');
  const course = catalog.find(item => item.file === file);
  const id = file.slice(0, -3);
  const body = marked.parse(markdown, { gfm: true });
  const title = (course?.title || markdown.match(/^# (.+)$/m)?.[1] || id)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; background: #111923; color: #edf2f5; font: 16px/1.65 Georgia, serif; }
    body { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
    h1, h2, h3 { line-height: 1.25; color: #fff; }
    h1 { font-size: 2.3rem; } h2 { margin-top: 2.2rem; border-top: 1px solid #405160; padding-top: 1rem; }
    a { color: #a4dce7; } a:focus-visible { outline: 2px solid #a4dce7; }
    table { border-collapse: collapse; width: 100%; display: block; overflow-x: auto; }
    th, td { padding: .55rem .7rem; border: 1px solid #405160; text-align: left; vertical-align: top; }
    th { background: #20303d; } pre, code { background: #20303d; border-radius: 4px; }
    pre { overflow-x: auto; padding: 1rem; } code { padding: .1rem .25rem; }
    blockquote { border-left: 3px solid #dcb980; padding-left: 1rem; margin-left: 0; color: #c8d4dc; }
    li { margin: .25rem 0; }
  </style>
</head>
<body><main>${body}</main></body>
</html>`;
  await writeFile(resolve(destination, `${id}.html`), html);
  console.log(`${id}.html`);
}
