import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const courses = JSON.parse(await readFile(resolve(root, 'data/catalog.json'), 'utf8'));
const docs = JSON.parse(await readFile(resolve(root, 'data/drive-docs.json'), 'utf8'));
const companions = JSON.parse(await readFile(resolve(root, 'data/companion-docs.json'), 'utf8'));
const ids = courses.map(course => course.id);

assert.equal(courses.length, 15, 'Expected 15 published courses');
assert.equal(new Set(ids).size, ids.length, 'Duplicate course IDs');
assert.deepEqual(Object.keys(docs).sort(), ids.slice().sort(), 'Every course needs exactly one Doc ID');
assert.equal(new Set(Object.values(docs)).size, ids.length, 'Duplicate Google Doc IDs');
assert.equal(companions.length, 3, 'Expected three PHIL 101 companions');
assert.equal(new Set(companions.map(item => item.id)).size, 3, 'Duplicate companion Doc IDs');
for (const item of companions) {
  assert.ok(item.title && item.description, 'Incomplete companion metadata');
  assert.match(item.id, /^[A-Za-z0-9_-]+$/, `Invalid companion Doc ID: ${item.title}`);
  assert.ok(!Object.values(docs).includes(item.id), `Companion ID duplicates a syllabus: ${item.title}`);
}

for (const course of courses) {
  assert.match(course.id, /^[a-z0-9-]+$/, `Invalid course ID: ${course.id}`);
  assert.match(docs[course.id], /^[A-Za-z0-9_-]+$/, `Invalid Doc ID: ${course.id}`);
  assert.ok(course.title && course.description && course.subject, `Missing metadata: ${course.id}`);
  assert.ok(Number.isInteger(course.weeks) && course.weeks > 0, `Invalid duration: ${course.id}`);
  assert.ok(['free', 'paid-required'].includes(course.accessClassification), `Missing resource access: ${course.id}`);
  const source = await readFile(resolve(root, 'syllabi', course.file), 'utf8');
  assert.ok(source.startsWith(`# ${course.title}\n`), `Syllabus title mismatch: ${course.id}`);
  assert.doesNotMatch(source, /track your progress in Electives|Export Electives progress|Syllabi progress from the Settings page|syllabi app/i, `Retired app instructions: ${course.id}`);
}

for (const path of ['index.html', 'styles.css', 'app.js', '.github/ISSUE_TEMPLATE/course-request.yml']) {
  assert.ok((await stat(resolve(root, path))).isFile(), `Missing ${path}`);
}
const site = await readFile(resolve(root, 'index.html'), 'utf8');
assert.doesNotMatch(site, /electives\.kaleb\.one|electives\.courses/, 'Retired app or custom domain link');
console.log(`Catalog valid: ${courses.length} courses, ${Object.keys(docs).length} syllabus Docs, ${companions.length} companion Docs, issue form and site assets present.`);
