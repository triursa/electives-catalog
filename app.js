(() => {
  'use strict';

  const catalogView = document.querySelector('#catalog-view');
  const detailView = document.querySelector('#detail-view');
  const courseList = document.querySelector('#course-list');
  const resultCount = document.querySelector('#result-count');
  const search = document.querySelector('#search');
  const subject = document.querySelector('#subject');
  let courses = [];
  let docs = {};
  let companions = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function link(text, href, className) {
    const node = element('a', className, text);
    node.href = href;
    if (href.startsWith('https://')) {
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
    return node;
  }

  function codeFor(course) {
    return course.title.match(/^[A-Z]+\s+\d+/)?.[0] || course.title;
  }

  function accessFor(course) {
    return course.accessClassification === 'free' ? 'Free required materials' : 'Library or purchase may be needed';
  }

  function tagsFor(course) {
    const tags = element('div', 'tags');
    for (const value of [course.subject, course.level, `${course.weeks} weeks`, accessFor(course)]) {
      tags.append(element('span', 'tag', value));
    }
    return tags;
  }

  function renderCards() {
    const query = search.value.trim().toLocaleLowerCase();
    const selected = subject.value;
    const matches = courses.filter(course =>
      (!selected || course.subject === selected) &&
      (!query || [course.title, course.subject, course.description].some(value => value.toLocaleLowerCase().includes(query)))
    );
    resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'course' : 'courses'}`;
    courseList.replaceChildren();
    if (!matches.length) {
      courseList.append(element('p', 'empty-state', 'No courses match those filters. Try another topic or subject.'));
      return;
    }
    for (const course of matches) {
      const card = link('', `#${course.id}`, 'course-card');
      card.setAttribute('aria-label', `View ${course.title}`);
      card.append(element('span', 'course-code', codeFor(course)));
      card.append(element('h3', '', course.title));
      card.append(element('p', '', course.description));
      card.append(tagsFor(course));
      courseList.append(card);
    }
  }

  function renderDetail(course) {
    detailView.replaceChildren();
    detailView.append(link('← All courses', '#courses', 'back-link'));
    detailView.append(element('p', 'eyebrow', codeFor(course)));
    detailView.append(element('h1', '', course.title));
    detailView.append(element('p', 'detail-description', course.description));
    detailView.append(tagsFor(course));
    detailView.append(element('p', 'access-note', course.accessClassification === 'free'
      ? 'All required materials are freely available online.'
      : 'Some required materials require purchase or library access. Check the syllabus before starting.'));

    const actions = element('div', 'action-bar');
    const docId = docs[course.id];
    if (typeof docId === 'string' && /^[A-Za-z0-9_-]+$/.test(docId)) {
      const base = `https://docs.google.com/document/d/${docId}`;
      actions.append(link('Make a copy in Google Drive', `${base}/copy`, 'button button-primary'));
      actions.append(link('Download PDF', `${base}/export?format=pdf`, 'button button-secondary'));
      actions.append(link('Download Word', `${base}/export?format=docx`, 'button button-muted'));
      detailView.append(actions);
      detailView.append(element('p', 'detail-description', 'Copying needs a Google account. Downloads can be saved to a computer, phone, or tablet.'));
    } else {
      detailView.append(element('p', 'access-note', 'This syllabus is being prepared for Google Drive. Check back soon.'));
    }

    if (course.id === 'phil-101-intro-to-philosophy' && companions.length) {
      const section = element('section', 'detail-section');
      section.append(element('h2', '', 'Companion materials'));
      const list = element('ul', 'companion-list');
      for (const companion of companions) {
        const item = element('li', 'companion-item');
        item.append(element('h3', '', companion.title));
        item.append(element('p', '', companion.description));
        const links = element('div', 'companion-links');
        const base = `https://docs.google.com/document/d/${companion.id}`;
        links.append(link('Make a copy', `${base}/copy`));
        links.append(link('Download PDF', `${base}/export?format=pdf`));
        links.append(link('Download Word', `${base}/export?format=docx`));
        item.append(links);
        list.append(item);
      }
      section.append(list);
      detailView.append(section);
    }

    if (course.objectives?.length) {
      const section = element('section', 'detail-section');
      section.append(element('h2', '', 'What you will learn'));
      const list = element('ul');
      for (const objective of course.objectives) list.append(element('li', '', objective));
      section.append(list);
      detailView.append(section);
    }

    if (course.weeklySchedule?.length) {
      const section = element('section', 'detail-section');
      section.append(element('h2', '', 'Weekly outline'));
      const weeks = element('div', 'week-list');
      for (const week of course.weeklySchedule) {
        const item = element('div', 'week');
        item.append(element('strong', '', `Week ${week.week}`));
        item.append(element('span', '', week.topic || week.theme || week.topics || 'Study and practice'));
        weeks.append(item);
      }
      section.append(weeks);
      detailView.append(section);
    }
  }

  function route() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const course = courses.find(item => item.id === id);
    if (course) {
      renderDetail(course);
      catalogView.hidden = true;
      detailView.hidden = false;
      document.title = `${course.title} | Electives`;
      window.scrollTo(0, 0);
    } else {
      detailView.hidden = true;
      catalogView.hidden = false;
      document.title = 'Electives | Self-study course catalog';
    }
  }

  async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  search.addEventListener('input', renderCards);
  subject.addEventListener('change', renderCards);
  window.addEventListener('hashchange', route);

  Promise.all([loadJson('data/catalog.json'), loadJson('data/drive-docs.json'), loadJson('data/companion-docs.json')])
    .then(([loadedCourses, loadedDocs, loadedCompanions]) => {
      courses = loadedCourses;
      docs = loadedDocs;
      companions = loadedCompanions;
      for (const value of [...new Set(courses.map(course => course.subject))].sort()) {
        const option = element('option', '', value);
        option.value = value;
        subject.append(option);
      }
      renderCards();
      route();
    })
    .catch(error => {
      courseList.replaceChildren(element('p', 'load-error', 'The catalog could not load. Please refresh the page.'));
      console.error(error);
    });
})();
