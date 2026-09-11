// Electives Catalog — static site, vanilla JS, no dependencies
(function () {
  "use strict";

  var catalog = [];
  var activeSubject = "All";
  var searchTerm = "";

  // Simple markdown-to-HTML (subset: headings, bold, italic, lists, links, code, blockquotes, tables, hr)
  function mdToHtml(md) {
    var lines = md.split("\n");
    var html = [];
    var inList = false;
    var inOl = false;
    var inCode = false;
    var inTable = false;
    var tableHeaders = [];

    function inline(s) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (inCode) {
        if (line.trim() === "```") {
          html.push("</code></pre>");
          inCode = false;
        } else {
          html.push(line.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        }
        continue;
      }

      if (line.trim().startsWith("```")) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        html.push("<pre><code>");
        inCode = true;
        continue;
      }

      if (line.startsWith("|") && line.endsWith("|")) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        var cells = line.split("|").filter(function(c) { return c.trim() !== ""; });
        if (!inTable) {
          inTable = true;
          tableHeaders = cells.map(function(c) { return c.trim(); });
          html.push("<table><thead><tr>");
          tableHeaders.forEach(function(h) {
            html.push("<th>" + inline(h) + "</th>");
          });
          html.push("</tr></thead><tbody>");
        } else {
          // Check if it's a separator row
          var isSeparator = cells.every(function(c) {
            return /^[-:\s]+$/.test(c.trim());
          });
          if (!isSeparator) {
            html.push("<tr>");
            cells.forEach(function(c) {
              html.push("<td>" + inline(c.trim()) + "</td>");
            });
            html.push("</tr>");
          }
        }
        continue;
      }

      if (inTable) {
        html.push("</tbody></table>");
        inTable = false;
      }

      if (/^#{1,6}\s/.test(line)) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        var level = line.match(/^#+/)[0].length;
        var text = inline(line.replace(/^#+\s/, ""));
        html.push("<h" + level + ">" + text + "</h" + level + ">");
      } else if (/^[-*]\s/.test(line)) {
        if (inOl) { html.push("</ol>"); inOl = false; }
        if (!inList) { html.push("<ul>"); inList = true; }
        html.push("<li>" + inline(line.replace(/^[-*]\s/, "")) + "</li>");
      } else if (/^\d+\.\s/.test(line)) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (!inOl) { html.push("<ol>"); inOl = true; }
        html.push("<li>" + inline(line.replace(/^\d+\.\s/, "")) + "</li>");
      } else if (/^>\s/.test(line)) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        html.push("<blockquote>" + inline(line.replace(/^>\s/, "")) + "</blockquote>");
      } else if (/^---+$/.test(line.trim())) {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        html.push("<hr>");
      } else if (line.trim() === "") {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
      } else {
        if (inList) { html.push("</ul>"); inList = false; }
        if (inOl) { html.push("</ol>"); inOl = false; }
        html.push("<p>" + inline(line) + "</p>");
      }
    }

    if (inList) html.push("</ul>");
    if (inOl) html.push("</ol>");
    if (inCode) html.push("</code></pre>");
    if (inTable) html.push("</tbody></table>");

    return html.join("\n");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function courseCode(title) {
    // Extract "PHIL 101" from "PHIL 101: Introduction to Philosophy"
    var m = title.match(/^([A-Z]+\s\d+)/);
    return m ? m[1] : title;
  }

  function renderCatalog() {
    var app = document.getElementById("app");
    var subjects = ["All"].concat(
      Object.keys(
        catalog.reduce(function(acc, c) {
          acc[c.subject] = true;
          return acc;
        }, {})
      ).sort()
    );

    var filtered = catalog.filter(function(c) {
      if (activeSubject !== "All" && c.subject !== activeSubject) return false;
      if (searchTerm) {
        var q = searchTerm.toLowerCase();
        return (
          c.title.toLowerCase().indexOf(q) !== -1 ||
          c.description.toLowerCase().indexOf(q) !== -1 ||
          c.subject.toLowerCase().indexOf(q) !== -1
        );
      }
      return true;
    });

    var html = "";

    // Hero
    html += '<div class="hero">';
    html += '<h1>Course Catalog</h1>';
    html += '<p>A collection of self-study college-level syllabi. Each course includes a full reading list, weekly schedule, assignments, and learning objectives. All materials are free to download.</p>';
    html += '</div>';

    // Controls
    html += '<div class="controls">';
    html += '<input type="search" class="search-box" placeholder="Search courses…" value="' + escapeHtml(searchTerm) + '" oninput="onSearch(this.value)" />';
    html += '<div class="filter-chips">';
    subjects.forEach(function(subj) {
      var active = subj === activeSubject ? " active" : "";
      html += '<button class="chip' + active + '" onclick="onFilter(\'' + subj.replace(/'/g, "\\'") + '\')">' + escapeHtml(subj) + '</button>';
    });
    html += '</div>';
    html += '</div>';

    // Results count
    html += '<p style="font-size:0.85rem;color:var(--muted);margin-bottom:20px;">' + filtered.length + ' course' + (filtered.length !== 1 ? 's' : '') + '</p>';

    // Grid
    if (filtered.length === 0) {
      html += '<div class="empty-state"><p>No courses match your search.</p></div>';
    } else {
      html += '<div class="course-grid">';
      filtered.forEach(function(c) {
        var code = courseCode(c.title);
        html += '<article class="course-card" onclick="navigate(\'#' + c.id + '\')">';
        html += '<div class="code">' + escapeHtml(code) + '</div>';
        html += '<h3>' + escapeHtml(c.title) + '</h3>';
        html += '<p class="desc">' + escapeHtml(c.description) + '</p>';
        html += '<div class="meta">';
        html += '<span class="meta-tag">' + escapeHtml(c.subject) + '</span>';
        html += '<span class="meta-tag">' + escapeHtml(c.level) + '</span>';
        html += '<span class="meta-tag">' + c.weeks + ' weeks</span>';
        if (c.totalHours) {
          html += '<span class="meta-tag">' + c.totalHours + ' hours</span>';
        }
        html += '</div>';
        html += '</article>';
      });
      html += '</div>';
    }

    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderDetail(course) {
    var app = document.getElementById("app");
    var code = courseCode(course.title);
    var html = '<div class="course-detail">';

    // Back link
    html += '<a class="back-link" href="#" onclick="navigate(\'\');return false;">&larr; All courses</a>';

    // Header
    html += '<div class="detail-header">';
    html += '<div class="code">' + escapeHtml(code) + '</div>';
    html += '<h1>' + escapeHtml(course.title) + '</h1>';
    html += '<div class="detail-meta">';
    html += '<span class="meta-tag">' + escapeHtml(course.subject) + '</span>';
    html += '<span class="meta-tag">' + escapeHtml(course.level) + '</span>';
    html += '<span class="meta-tag">' + course.weeks + ' weeks</span>';
    if (course.totalHours) {
      html += '<span class="meta-tag">' + course.totalHours + ' total hours</span>';
    }
    if (course.hoursPerWeek) {
      html += '<span class="meta-tag">~' + course.hoursPerWeek + ' hrs/week</span>';
    }
    html += '</div>';
    html += '<p class="detail-desc">' + escapeHtml(course.description) + '</p>';
    html += '</div>';

    // Download bar
    html += '<div class="download-bar">';
    html += '<a class="btn btn-primary" href="syllabi/' + course.file + '" download>Download Syllabus (.md)</a>';
    html += '<a class="btn btn-secondary" href="https://electives.kaleb.one" rel="noopener" target="_blank">Open in App</a>';
    html += '</div>';

    // Objectives
    if (course.objectives && course.objectives.length) {
      html += '<div class="detail-section">';
      html += '<h2>Learning Objectives</h2>';
      html += '<ul>';
      course.objectives.forEach(function(obj) {
        html += '<li>' + escapeHtml(obj) + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    // Study Guide
    if (course.studyGuide) {
      html += '<div class="detail-section">';
      html += '<h2>Study Guide</h2>';
      html += '<p>' + escapeHtml(course.studyGuide) + '</p>';
      html += '</div>';
    }

    // Source Notes
    if (course.sourceNotes) {
      html += '<div class="detail-section">';
      html += '<h2>Source Notes</h2>';
      html += '<p>' + escapeHtml(course.sourceNotes) + '</p>';
      html += '</div>';
    }

    // Weekly Schedule
    if (course.weeklySchedule && course.weeklySchedule.length) {
      html += '<div class="detail-section">';
      html += '<h2>Weekly Schedule</h2>';
      html += '<div class="schedule-list">';
      course.weeklySchedule.forEach(function(week) {
        html += '<div class="schedule-week">';
        html += '<div class="week-num">Week ' + week.week + '</div>';
        html += '<div>';
        if (week.theme) {
          html += '<div class="week-theme">' + escapeHtml(week.theme) + '</div>';
        }
        if (week.topics) {
          html += '<div class="week-topics">' + escapeHtml(week.topics) + '</div>';
        }
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }

    // Resources
    if (course.resources && course.resources.length) {
      html += '<div class="detail-section">';
      html += '<h2>Resources</h2>';
      html += '<div class="resource-list">';
      course.resources.forEach(function(r) {
        html += '<div class="resource-item">';
        html += '<a href="' + escapeHtml(r.url) + '" rel="noopener" target="_blank">' + escapeHtml(r.label) + '</a>';
        if (r.note) {
          html += '<div class="note">' + escapeHtml(r.note) + '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }

    // Folder Structure
    if (course.folderStructure && course.folderStructure.length) {
      html += '<div class="detail-section">';
      html += '<h2>Recommended Folder Structure</h2>';
      html += '<ul>';
      course.folderStructure.forEach(function(folder) {
        html += '<li>' + escapeHtml(folder) + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    // Syllabus preview (lazy loaded)
    html += '<div class="detail-section">';
    html += '<h2>Full Syllabus Preview</h2>';
    html += '<div id="syllabus-preview" class="syllabus-preview"><p style="color:var(--muted);font-style:italic;">Loading…</p></div>';
    html += '</div>';

    html += '</div>';

    app.innerHTML = html;
    window.scrollTo(0, 0);

    // Lazy load the markdown
    fetch("syllabi/" + course.file)
      .then(function(r) { return r.text(); })
      .then(function(md) {
        var preview = document.getElementById("syllabus-preview");
        if (preview) {
          preview.innerHTML = mdToHtml(md);
        }
      })
      .catch(function() {
        var preview = document.getElementById("syllabus-preview");
        if (preview) {
          preview.innerHTML = '<p style="color:var(--muted);">Could not load syllabus file. <a href="syllabi/' + course.file + '" download>Download it directly</a>.</p>';
        }
      });
  }

  // Routing
  function route() {
    var hash = window.location.hash.slice(1);
    if (!hash) {
      renderCatalog();
    } else {
      var course = catalog.find(function(c) { return c.id === hash; });
      if (course) {
        renderDetail(course);
      } else {
        renderCatalog();
      }
    }
  }

  // Exposed for onclick handlers
  window.navigate = function(hash) {
    window.location.hash = hash;
  };

  window.onSearch = function(val) {
    searchTerm = val;
    renderCatalog();
  };

  window.onFilter = function(subject) {
    activeSubject = subject;
    renderCatalog();
  };

  window.addEventListener("hashchange", route);

  // Init
  fetch("data/catalog.json")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      catalog = data;
      route();
    })
    .catch(function(err) {
      document.getElementById("app").innerHTML =
        '<div class="empty-state"><p>Could not load the catalog. Please try again.</p></div>';
      console.error(err);
    });
})();