/* Day board. Live only when cockpit/os_server.py is running. */
(function () {
  var root = document.getElementById("day-os-root");
  if (!root) return;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fail(message) {
    root.innerHTML =
      '<div class="day-banner"><strong>Not live.</strong> ' +
      esc(message) +
      " Start it with <code>python3 cockpit/os_server.py</code> inside Repos_Readmes, then open http://127.0.0.1:8765/</div>";
  }

  function post(body) {
    return fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) throw new Error(data.error || "save failed");
        return data;
      });
    });
  }

  function activeDomain() {
    var button = document.querySelector(".domain-tabs .tab-btn.is-active");
    return button ? (button.dataset.domain || "All") : "All";
  }

  function renderLessons(domain) {
    var box = document.getElementById("day-os-lessons");
    var data = window.dayOsData;
    if (!box || !data) return;
    var lessons = (data.lessons || []).filter(function (lesson) {
      return domain === "All" || (lesson.domains || []).indexOf(domain) !== -1;
    });
    var label = document.getElementById("day-os-lessons-label");
    if (label) label.textContent = domain === "All" ? "Lessons — all domains" : "Lessons — " + domain;
    if (!lessons.length) {
      box.innerHTML = '<p class="day-os-note">No lessons in this domain yet.</p>';
      return;
    }
    box.innerHTML = '<div class="lesson-list">' + lessons.map(function (lesson) {
      return '<div class="lesson-row' + (lesson.recorded ? " is-done" : "") + '">' +
        '<span class="lesson-num">' + esc(lesson.number) + '</span>' +
        '<a href="/lessons/' + esc(lesson.file) + '">' + esc(lesson.title) + '</a>' +
        '<span class="lesson-state">' + (lesson.recorded ? "done" : "to do") + '</span>' +
        '<a href="/record/' + esc(lesson.file) + '">Write answer →</a>' +
        '</div>';
    }).join("") + '</div>';
  }

  window.onDomainChange = function (domain) { renderLessons(domain || "All"); };

  function destinationLinks(task) {
    var links = task.links || {};
    var parts = [];
    if (links.lesson) {
      parts.push('<a href="/lessons/' + esc(links.lesson) + '">Open lesson</a>');
      parts.push('<a href="/record/' + esc(links.lesson) + '">Write answer →</a>');
    }
    if (links.glossary) {
      parts.push('<a href="#glossary-list">Open glossary</a>');
    }
    if (links.matrix_id) {
      parts.push('<a href="#entry-' + esc(links.matrix_id) + '">Matrix row</a>');
    }
    if (links.german) {
      parts.push('<a href="#german">German track</a>');
      parts.push('<a href="http://127.0.0.1:8766/" target="_blank" rel="noopener">Open app ↗</a>');
    }
    if (links.n8n) {
      parts.push('<a href="#n8n">n8n project</a>');
      parts.push('<a href="http://127.0.0.1:5678/" target="_blank" rel="noopener">Open n8n ↗</a>');
    }
    if (links.note) {
      parts.push('<a href="/note/' + esc(links.note) + '">Write today\'s note</a>');
    }
    if (links.project) {
      parts.push('<a href="/project/' + encodeURIComponent(links.project) + '/">Project files ↗</a>');
    }
    if (task.source && /^(reference|lessons)\//.test(task.source)) {
      parts.push('<a href="/file/' + encodeURI(task.source) + '" target="_blank" rel="noopener">Source file ↗</a>');
    }
    return parts.length ? '<div class="task-actions">' + parts.join("") + "</div>" : "";
  }

  function render(data) {
    window.dayOsData = data;
    var prayers = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    var prayerHtml = prayers.map(function (name) {
      var on = false;
      data.windows.forEach(function (window) {
        if (window.id === data.current_window && (window.start === data.prayers[name] || name === "sunrise")) {
          on = window.start === data.prayers[name];
        }
      });
      return '<div class="prayer-chip' + (on ? " is-now" : "") + '"><span>' +
        esc(name) + '</span><strong>' + esc(data.prayers[name]) + "</strong></div>";
    }).join("");

    var nowTask = data.tasks.filter(function (task) { return task.id === data.now_task; })[0];
    var focusHtml = nowTask
      ? '<div class="now-card"><h3>Do this now</h3><strong>' + esc(nowTask.title) +
        '</strong><p class="day-os-note">' + esc(nowTask.minutes) + " min · " +
        esc(nowTask.window.replace(/_/g, " → ")) +
        (nowTask.energy ? " · " + esc(nowTask.energy) + " energy" : "") + "</p>" +
        (nowTask.status === "open" && !nowTask.blocked
          ? '<div class="task-actions"><button type="button" class="btn-done" data-op="check" data-id="' +
            esc(nowTask.id) + '">Done</button><button type="button" data-op="skip" data-id="' +
            esc(nowTask.id) + '">Skip</button></div>'
          : "") +
        destinationLinks(nowTask) + "</div>"
      : '<div class="now-card"><h3>Nothing open</h3><p class="day-os-note">' +
        "Every task is done or skipped. The day is closed.</p></div>";

    var streak = data.streak || {};
    var streakText = streak.count
      ? " · " + esc(streak.count) + " day streak" + (streak.today_complete ? "" : " (yesterday)")
      : "";

    var tasks = data.tasks.map(function (task) {
      var cls = "task-card";
      if (task.id === data.now_task) cls += " is-now";
      if (task.status === "done" || task.status === "skipped") cls += " is-done";
      if (task.blocked) cls += " is-blocked";
      var buttons = "";
      if (task.blocked) {
        buttons = "<span>Waiting. Finish or skip the open tasks first.</span>";
      } else if (task.status === "open") {
        buttons =
          '<button type="button" class="btn-done" data-op="check" data-id="' + esc(task.id) + '">Done</button>' +
          '<button type="button" data-op="skip" data-id="' + esc(task.id) + '">Skip</button>';
      } else {
        buttons = '<button type="button" data-op="uncheck" data-id="' + esc(task.id) + '">Undo</button>';
      }
      if (task.manual) {
        buttons += '<button type="button" data-op="remove" data-id="' + esc(task.id) + '">Remove</button>';
      }
      if (task.links && task.links.term) {
        var term = esc(task.links.term);
        buttons += '<span class="term-grade" data-term="' + term + '">' +
          '<button type="button" data-grade="again">Missed</button>' +
          '<button type="button" data-grade="good">Got it</button>' +
          '<button type="button" data-grade="easy">Easy</button></span>';
      }
      var links = "";
      if (task.links && task.links.lesson) {
        links += ' <a href="/lessons/' + esc(task.links.lesson) + '">Open lesson</a>' +
          ' <a href="/record/' + esc(task.links.lesson) + '">Write answer →</a>';
      }
      if (task.links && task.links.project) {
        links += ' <button type="button" data-project="' + esc(task.links.project) + '">Show project</button>';
      }
      if (task.links && task.links.matrix_id) {
        links += ' <a href="#entry-' + esc(task.links.matrix_id) + '">Matrix row</a>';
      }
      if (task.links && task.links.glossary) {
        links += ' <a href="#glossary-list">Open glossary</a>';
      }
      if (task.links && task.links.german) {
        links += ' <a href="#german">German track</a>' +
          ' <a href="http://127.0.0.1:8766/" target="_blank" rel="noopener">Open app ↗</a>';
      }
      if (task.links && task.links.n8n) {
        links += ' <a href="#n8n">n8n project</a>' +
          ' <a href="http://127.0.0.1:5678/" target="_blank" rel="noopener">Open n8n ↗</a>';
      }
      if (task.links && task.links.note) {
        links += ' <a href="/note/' + esc(task.links.note) + '">Write today\'s note</a>';
      }
      if (task.links && task.links.project) {
        links += ' <a href="/project/' + encodeURIComponent(task.links.project) + '/">Project files ↗</a>';
      }
      if (task.source && /^(reference|lessons)\//.test(task.source)) {
        links += ' <a href="/file/' + encodeURI(task.source) + '" target="_blank" rel="noopener">Source file ↗</a>';
      }
      var mark = task.id === data.now_task ? "Now · " : "";
      return '<article class="' + cls + '"><div class="day-os-source">' + mark + esc(task.minutes) +
        " min · " + esc(task.window.replace(/_/g, " → ")) +
        (task.priority ? ' · <span class="priority-chip priority-' + esc(task.priority) + '">' + esc(task.priority) + "</span>" : "") +
        (task.energy ? ' · <span class="energy-chip energy-' + esc(task.energy) + '">' + esc(task.energy) + " energy</span>" : "") +
        " · " + esc(task.status) +
        "</div><strong>" + esc(task.title) + "</strong><p class=\"day-os-note\">" +
        esc(task.detail) + "</p><p class=\"day-os-source\">" + esc(task.source) + links +
        '</p><div class="task-actions">' + buttons + "</div></article>";
    }).join("");

    root.innerHTML =
      '<p class="day-os-meta">Cairo · ' + esc(data.date) + " · clock " + esc(data.now) +
      " · " + esc(data.counts.terms) + " glossary terms · " + esc(data.counts.lessons) +
      " lessons (" + esc(data.counts.unrecorded_lessons) + " with no learning record) · " +
      esc(data.counts.projects) + " projects · " + esc(data.counts.done) + " done, " +
      esc(data.counts.open) + " still open" + streakText +
      " · " + esc(data.counts.quiz_attempts || 0) + " quiz answers · " +
      esc(data.counts.due_terms || 0) + " terms due" + "</p>" +
      focusHtml +
      '<div class="prayer-row">' + prayerHtml + "</div>" +
      '<p class="day-os-note">Prayer times are offline Egyptian Survey angles for Cairo. Checked against the public table for 19 Nov 2026. Asr can differ by one minute.</p>' +
      '<div class="task-list">' + tasks + "</div>" +
      '<section class="day-os-lessons-wrap">' +
      '<h3 class="section-heading" id="day-os-lessons-label">Lessons</h3>' +
      '<div id="day-os-lessons"></div></section>' +
      '<section class="spaced-wrap"><h3 class="section-heading">Spaced repetition</h3>' +
      '<p class="day-os-note">Terms come back on a 1, 3, 7, 14, 30-day ladder. “Missed” resets the ladder.</p>' +
      '<div class="prayer-row">' + (data.due_term_list || []).map(function (term) {
        return '<span class="prayer-chip" data-term="' + esc(term) + '"><span>' + esc(term) +
          '</span><button type="button" data-grade="good">Got it</button></span>';
      }).join("") + '</div>' +
      ((data.due_term_list || []).length ? "" : '<p class="day-os-note">Nothing due — all terms are on schedule.</p>') +
      '</section>' +
      '<form class="add-row" id="day-os-add">' +
      '<input name="title" maxlength="140" required placeholder="One next action, 25 min or less">' +
      '<select name="window"><option value="fajr_dhuhr">After Fajr</option><option value="dhuhr_asr">After Dhuhr</option><option value="asr_maghrib">After Asr</option></select>' +
      '<select name="minutes"><option>15</option><option selected>20</option><option>25</option><option>10</option></select>' +
      '<select name="energy"><option value="low">low energy</option><option value="medium" selected>medium energy</option><option value="high">high energy</option></select>' +
      '<button type="submit">Add</button></form>' +
      '<div id="day-os-project"></div>';

    root.querySelectorAll("button[data-op]").forEach(function (button) {
      button.addEventListener("click", function () {
        post({ op: button.getAttribute("data-op"), id: button.getAttribute("data-id") })
          .then(render)
          .catch(function (error) { fail(error.message); });
      });
    });
    root.querySelectorAll("button[data-grade]").forEach(function (button) {
      button.addEventListener("click", function () {
        var holder = button.closest("[data-term]");
        fetch("/api/term", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: holder ? holder.getAttribute("data-term") : "",
            grade: button.getAttribute("data-grade")
          })
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res.error) { fail(res.error); return; }
          if (window.refreshDayOs) window.refreshDayOs();
        });
      });
    });
    root.querySelectorAll("button[data-project]").forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-project");
        fetch("/api/project?name=" + encodeURIComponent(name))
          .then(function (response) { return response.json(); })
          .then(function (project) {
            var box = document.getElementById("day-os-project");
            if (!box) return;
            if (project.error) {
              box.innerHTML = '<div class="day-banner">' + esc(project.error) + "</div>";
              return;
            }
            var status = project.status_file
              ? esc(project.status_file) + ": " + esc(project.status_line || "")
              : "No status file. Gap left open.";
            box.innerHTML = '<div class="project-panel"><h3>' + esc(project.folder) +
              "</h3><p>" + esc(project.title) + "</p><p>" + esc(project.blurb) +
              "</p><p class=\"day-os-source\">" + status + "</p></div>";
          })
          .catch(function (error) { fail(error.message); });
      });
    });
    var form = document.getElementById("day-os-add");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var body = {
        op: "add",
        title: form.title.value,
        window: form.window.value,
        minutes: Number(form.minutes.value),
        energy: form.energy.value
      };
      post(body).then(function (next) {
        render(next);
      }).catch(function (error) { fail(error.message); });
    });
    renderLessons(activeDomain());
    if (typeof window.renderMatrix === "function") window.renderMatrix();
    if (typeof window.renderPlanning === "function") window.renderPlanning(data);
  }

  function load() {
    fetch("/api/day")
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.live) throw new Error(data.error || "day feed refused");
          return data;
        });
      })
      .then(render)
      .catch(function (error) { fail(error.message); });
  }

  window.initDayOs = load;
  window.refreshDayOs = load;
  window.renderDayData = render;
})();
