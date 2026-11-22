/* Shell: theme, motion, focus, sidebar index and the planning control room. */
(function () {
  var body = document.body;
  var root = document.getElementById("planning-root");
  var week = null;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---- appearance ---- */
  var theme = localStorage.getItem("dayos-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  var themeBtn = document.getElementById("theme-toggle");
  function themeLabel() { themeBtn.textContent = theme === "dark" ? "☀ Light" : "☾ Dark"; }
  themeLabel();
  themeBtn.addEventListener("click", function () {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dayos-theme", theme);
    themeLabel();
  });

  var motionOn = localStorage.getItem("dayos-motion") !== "reduced";
  if (!motionOn) body.classList.add("reduce-motion");
  var motionBtn = document.getElementById("motion-toggle");
  function motionLabel() { motionBtn.textContent = motionOn ? "◐ Motion" : "◑ Reduced"; }
  motionLabel();
  motionBtn.addEventListener("click", function () {
    motionOn = !motionOn;
    body.classList.toggle("reduce-motion", !motionOn);
    localStorage.setItem("dayos-motion", motionOn ? "full" : "reduced");
    motionLabel();
  });

  var intensityOrder = ["calm", "balanced", "vivid"];
  var intensity = localStorage.getItem("dayos-intensity") || "balanced";
  document.documentElement.setAttribute("data-intensity", intensity);
  var intensityBtn = document.getElementById("intensity-toggle");
  function intensityLabel() { intensityBtn.textContent = "◐ Colour: " + intensity; }
  intensityLabel();
  intensityBtn.addEventListener("click", function () {
    intensity = intensityOrder[(intensityOrder.indexOf(intensity) + 1) % 3];
    document.documentElement.setAttribute("data-intensity", intensity);
    localStorage.setItem("dayos-intensity", intensity);
    intensityLabel();
  });

  var exitFocus = document.getElementById("exit-focus");
  function setFocus(on) {
    body.classList.toggle("focus-mode", on);
    exitFocus.hidden = !on;
  }
  document.getElementById("focus-toggle").addEventListener("click", function () {
    setFocus(!body.classList.contains("focus-mode"));
  });
  exitFocus.addEventListener("click", function () { setFocus(false); });
  document.addEventListener("keydown", function (event) {
    var tag = (document.activeElement && document.activeElement.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (event.key === "f" || event.key === "F") {
      setFocus(!body.classList.contains("focus-mode"));
    }
  });

  /* ---- sidebar index ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll("#side-nav a"));
  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }
  links.forEach(function (a) {
    a.addEventListener("click", function () { setActive(a.getAttribute("href").slice(1)); });
  });
  window.addEventListener("scroll", function () {
    var current = "";
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 170) current = id;
    });
    if (current) setActive(current);
  }, { passive: true });

  /* ---- body double timer + Maghrib shutdown ---- */
  function timerState() {
    try { return JSON.parse(localStorage.getItem("dayos-timer") || "null"); }
    catch (e) { return null; }
  }
  function saveTimer(state) { localStorage.setItem("dayos-timer", JSON.stringify(state)); }
  function clock(seconds) {
    return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" +
      String(seconds % 60).padStart(2, "0");
  }
  var timerTick = null;
  function tickTimer() {
    var state = timerState();
    if (!state) return;
    var left = state.running
      ? Math.max(0, Math.round((state.endAt - Date.now()) / 1000))
      : state.remaining;
    var display = document.getElementById("timer-display");
    if (display) display.textContent = clock(left);
    if (state.running && left === 0) {
      state.running = false;
      state.remaining = 0;
      saveTimer(state);
      var note = document.getElementById("timer-note");
      if (note) note.textContent = "Time's up — stand up, stretch, write one line before the next block.";
    }
  }
  function startTimerTick() {
    if (timerTick) clearInterval(timerTick);
    timerTick = setInterval(tickTimer, 1000);
    tickTimer();
  }

  /* ---- planning control room ---- */
  function weekHtml() {
    if (!week || !week.days) return '<p class="day-os-note">Loading the week…</p>';
    return '<div class="week-strip">' + week.days.map(function (day) {
      return '<button type="button" class="week-day' + (day.date === week.today ? " is-today" : "") +
        '" data-date="' + esc(day.date) + '"><b>' + esc(day.label) + '</b><small>' +
        esc(day.short) + '</small><em title="' + esc(day.lesson) + '">' + esc(day.lesson || "—") +
        '</em><small>' + esc(day.task_count) + ' tasks</small></button>';
    }).join("") + "</div>";
  }

  window.renderPlanning = function (data) {
    if (!root || !data) return;
    var counts = data.counts || {};
    var streak = data.streak || {};
    var nowTask = (data.tasks || []).filter(function (t) { return t.id === data.now_task; })[0];
    var recorded = counts.lessons - counts.unrecorded_lessons;
    var note = localStorage.getItem("dayos-note") || "";
    root.innerHTML =
      '<div class="date-banner"><span>Cairo · ' + esc(data.date) + " · " + esc(data.now) +
      " · " + esc(data.current_window ? data.current_window.replace(/_/g, " → ") : "between windows") +
      '</span><button type="button" id="plan-today">Back to today</button></div>' +
      weekHtml() +
      '<div class="control-grid">' +
        '<div class="control-card"><span class="mono-label">Next action</span><div class="big" style="font-size:1rem">' +
          esc(nowTask ? nowTask.title : "Nothing open") + '</div><p>' +
          esc(nowTask ? nowTask.minutes + " min · " + nowTask.window.replace(/_/g, " → ") : "The day is closed.") +
          (data.lesson_reason ? "<br><small>" + esc(data.lesson_reason) + "</small>" : "") + "</p></div>" +
        '<div class="control-card"><span class="mono-label">Day status</span><div class="big">' +
          esc(counts.done) + " / " + esc(counts.done + counts.open + counts.skipped) +
          '</div><p>' + esc(counts.open) + " open · " + esc(counts.skipped) + " skipped · " +
          esc(streak.count || 0) + " day streak</p></div>" +
        '<div class="control-card"><span class="mono-label">Learning</span><div class="big">' +
          esc(recorded) + " / " + esc(counts.lessons) +
          '</div><p>answers recorded · ' + esc(counts.terms) + " glossary terms</p></div>" +
        '<div class="control-card"><span class="mono-label">Signal · real evidence</span>' +
          '<div class="big" style="font-size:1rem">' + esc((data.signal || {}).level || "empty") + "</div>" +
          '<p>' + esc((data.signal || {}).quiz_attempts || 0) + " quiz attempts · " +
          esc((data.signal || {}).written_answers || 0) + " answers · " +
          esc((data.signal || {}).graded_terms || 0) + " graded terms</p>" +
          "<p>" + esc((data.signal || {}).note || "") + "</p></div>" +
        '<div class="control-card" id="body-double"><span class="mono-label">Body double · stay with me</span>' +
          '<div class="big timer-display" id="timer-display">25:00</div>' +
          '<div class="timer-controls"><button type="button" data-minutes="10">10</button>' +
          '<button type="button" data-minutes="15">15</button>' +
          '<button type="button" data-minutes="25">25</button>' +
          '<button type="button" id="timer-start">Start</button>' +
          '<button type="button" id="timer-reset">Reset</button></div>' +
          '<p id="timer-note">A quiet block: one task, one timer, no switching.</p></div>' +
        '<div class="control-card" id="shutdown"><span class="mono-label">Maghrib shutdown · ' +
          esc((data.prayers || {}).maghrib || "") + "</span>" +
          '<div class="big" id="shutdown-state" style="font-size:1rem">' +
          (data.now >= ((data.prayers || {}).maghrib || "23:59") ? "Due now · close the day" : "After Maghrib · " + esc((data.prayers || {}).maghrib || "")) +
          "</div>" +
          '<label><input type="checkbox" data-ritual="tasks"> every task done or skipped</label>' +
          '<label><input type="checkbox" data-ritual="line"> one line written about today</label>' +
          '<label><input type="checkbox" data-ritual="focus"> one focus for tomorrow chosen</label>' +
          '<button type="button" id="ritual-close">Close the day</button>' +
          '<p id="ritual-note">Three small boxes, then the week can close.</p></div>' +
      "</div>" +
      '<form class="capture-row" id="plan-capture">' +
        '<input type="text" name="title" maxlength="140" required placeholder="Capture one next action (25 min or less)">' +
        '<select name="window"><option value="fajr_dhuhr">After Fajr</option><option value="dhuhr_asr">After Dhuhr</option><option value="asr_maghrib">After Asr</option></select>' +
        '<select name="minutes"><option>10</option><option>15</option><option selected>20</option><option>25</option></select>' +
        '<select name="priority"><option value="must">Must</option><option value="should" selected>Should</option><option value="could">Could</option></select>' +
        '<select name="energy"><option value="low">low energy</option><option value="medium" selected>medium energy</option><option value="high">high energy</option></select>' +
        '<button type="submit">Add to plan</button></form>' +
      '<div><span class="mono-label">Scratchpad · saved in this browser</span>' +
      '<textarea class="quick-note" id="quick-note" placeholder="Park a thought here so it stops competing for attention…">' +
      esc(note) + "</textarea></div>";

    document.getElementById("plan-today").addEventListener("click", function () {
      if (window.refreshDayOs) window.refreshDayOs();
    });
    document.querySelectorAll(".week-day").forEach(function (button) {
      button.addEventListener("click", function () {
        fetch("/api/day?date=" + encodeURIComponent(button.dataset.date))
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.live && window.renderDayData) window.renderDayData(d); });
      });
    });
    document.getElementById("plan-capture").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.target;
      fetch("/api/tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "add", title: form.title.value, window: form.window.value,
          minutes: Number(form.minutes.value), priority: form.priority.value,
          energy: form.energy.value
        })
      }).then(function (r) { return r.json(); }).then(function () {
        if (window.refreshDayOs) window.refreshDayOs();
      });
    });
    var noteEl = document.getElementById("quick-note");
    noteEl.addEventListener("input", function () {
      localStorage.setItem("dayos-note", noteEl.value);
    });

    var timer = timerState() || { minutes: 25, remaining: 25 * 60, running: false, endAt: 0 };
    if (!timerState()) saveTimer(timer);
    document.getElementById("timer-start").textContent = timer.running ? "Pause" : "Start";
    document.querySelectorAll("#body-double button[data-minutes]").forEach(function (button) {
      button.addEventListener("click", function () {
        var minutes = Number(button.getAttribute("data-minutes"));
        saveTimer({ minutes: minutes, remaining: minutes * 60, running: false, endAt: 0 });
        var note = document.getElementById("timer-note");
        if (note) note.textContent = "Set for " + minutes + " minutes. Press Start.";
        tickTimer();
      });
    });
    document.getElementById("timer-start").addEventListener("click", function () {
      var state = timerState();
      state.running = !state.running;
      if (state.running) state.endAt = Date.now() + state.remaining * 1000;
      else state.remaining = Math.max(0, Math.round((state.endAt - Date.now()) / 1000));
      saveTimer(state);
      this.textContent = state.running ? "Pause" : "Start";
      tickTimer();
    });
    document.getElementById("timer-reset").addEventListener("click", function () {
      var state = timerState();
      state.remaining = state.minutes * 60;
      state.running = false;
      state.endAt = 0;
      saveTimer(state);
      document.getElementById("timer-start").textContent = "Start";
      var note = document.getElementById("timer-note");
      if (note) note.textContent = "Reset. One task, one timer.";
      tickTimer();
    });
    startTimerTick();

    var ritualKey = "dayos-ritual-" + data.date;
    var ritual = null;
    try { ritual = JSON.parse(localStorage.getItem(ritualKey) || "null"); } catch (e) { ritual = null; }
    var boxes = document.querySelectorAll("#shutdown input[data-ritual]");
    boxes.forEach(function (box) {
      box.checked = !!(ritual && ritual.checks && ritual.checks[box.dataset.ritual]);
      box.addEventListener("change", function () {
        var current = ritual || { checks: {} };
        current.checks[box.dataset.ritual] = box.checked;
        ritual = current;
        localStorage.setItem(ritualKey, JSON.stringify(current));
      });
    });
    var ritualNote = document.getElementById("ritual-note");
    if (ritual && ritual.closedAt && ritualNote) {
      ritualNote.textContent = "Closed at " + ritual.closedAt + ". The day is done.";
    }
    document.getElementById("ritual-close").addEventListener("click", function () {
      var all = Array.prototype.slice.call(boxes).every(function (box) { return box.checked; });
      if (!all) {
        if (ritualNote) ritualNote.textContent = "Finish all three boxes first — no half-closed day.";
        return;
      }
      var current = ritual || { checks: {} };
      current.closedAt = data.now; // server clock is Cairo time
      localStorage.setItem(ritualKey, JSON.stringify(current));
      if (ritualNote) ritualNote.textContent = "Closed at " + current.closedAt + ". The day is done.";
    });
  };

  /* ---- German v5 learning track ---- */
  var germanRoot = document.getElementById("german-root");
  function renderGerman() {
    fetch("/api/german").then(function (r) { return r.json(); }).then(function (d) {
      if (!germanRoot) return;
      var lessons = d.lessons || [];
      var lessonHtml = lessons.length
        ? '<div class="german-lessons">' + lessons.map(function (item) {
            return '<div class="german-lesson"><b>' + esc(item.id) + "</b><span>" + esc(item.title) +
              "</span><small>" + esc(item.minutes) + " min · hand-authored</small></div>";
          }).join("") + "</div>"
        : '<p class="day-os-note">No pilot lessons found — the v5 folder is missing.</p>';
      var glossary = [
        ["Segment", "One narrator line rendered to its own cached audio clip; the lesson is a sequence of segments."],
        ["LUFS", "Integrated loudness target −16 LUFS; the pilot renders measured −16.42…−16.50."],
        ["Timeline drift", "Difference between computed and assembled segment timing; pilot keeps it within 7 ms."],
        ["Voice profile", "One of six German profiles in VoiceStudio, keyed in v5/config/voices.toml."],
        ["Position restore", "Playback position survives a reload by reading the local progress endpoint."],
        ["Corpus candidate", "A scored YouTube clip from the local corpus used to source real listening material."]
      ];
      germanRoot.innerHTML =
        '<div class="german-track"><div class="german-bar">' +
        '<span class="n8n-live ' + (d.live ? "on" : "") + '">' +
          (d.live ? "● server live" : "○ server off — start it below") + "</span>" +
        '<a href="http://127.0.0.1:8766/" target="_blank" rel="noopener">Open German app ↗</a>' +
        "<code>cd …/projects/Learning German/v5 &amp;&amp; make serve</code>" +
        '<span class="mono-label">' + esc(lessons.length) + " pilot lessons · A1 → C2 · port 8766</span></div>" +
        lessonHtml +
        '<div><span class="mono-label">Glossary of the listening app</span>' +
        '<div class="german-glossary">' + glossary.map(function (row) {
          return "<div><b>" + esc(row[0]) + "</b><span>" + esc(row[1]) + "</span></div>";
        }).join("") + "</div></div></div>";
    }).catch(function () { /* the loading note stays */ });
  }
  renderGerman();

  /* ---- n8n project ---- */
  var n8nRoot = document.getElementById("n8n-root");
  function renderN8n() {
    if (!n8nRoot) return;
    fetch("/api/n8n").then(function (r) { return r.json(); }).then(function (d) {
      n8nRoot.innerHTML =
        '<div class="n8n-box"><div class="n8n-top">' +
        '<span class="n8n-live ' + (d.live ? "on" : "") + '">' +
          (d.live ? "● LIVE at 127.0.0.1:5678" : "○ not running") + "</span>" +
        '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">Open n8n ↗</a>' +
        '<span class="mono-label">' + esc(d.status || "") + "</span></div>" +
        '<div class="n8n-facts">' +
          '<div class="n8n-fact"><b>Verified</b>' + esc(d.verified || "") + "</div>" +
          '<div class="n8n-fact"><b>Host</b>' + esc(d.host || "") + "</div>" +
          '<div class="n8n-fact"><b>Repository</b>' + esc(d.repository || "") + "</div>" +
          '<div class="n8n-fact"><b>Health detail</b>' + esc(d.detail || "") + "</div>" +
        "</div>" +
        '<div><span class="mono-label">Still open — do not onboard clients yet</span>' +
        '<ul class="n8n-blockers">' + (d.blockers || []).map(function (item) {
          return "<li>" + esc(item) + "</li>";
        }).join("") + "</ul></div>" +
        '<p class="day-os-note">Full evidence is in the matrix row "n8n Production Starter", and there is a low-energy n8n check in Today.</p>' +
        "</div>";
    }).catch(function () { /* the loading note stays */ });
  }
  renderN8n();

  /* ---- portable history ---- */
  var portableRoot = document.getElementById("portable-root");
  function renderPortable() {
    if (!portableRoot) return;
    portableRoot.innerHTML =
      '<div class="portable-box"><p class="day-os-note">Answers, quiz results, term grades, weekly reviews and approved decisions are plain files. Export them to keep your history on another machine; import merges a validated copy back in without deleting anything.</p>' +
      '<div class="portable-actions">' +
      '<a href="/api/export" download>Download history JSON ↓</a>' +
      '<label>Choose a history file <input type="file" id="history-file" accept=".json,application/json"></label>' +
      '<button type="button" id="history-validate" disabled>Validate</button>' +
      '<button type="button" id="history-apply" disabled>Apply import</button></div>' +
      '<pre class="portable-report" id="history-report">No file chosen.</pre></div>';
    var fileEl = document.getElementById("history-file");
    var validateBtn = document.getElementById("history-validate");
    var applyBtn = document.getElementById("history-apply");
    var report = document.getElementById("history-report");
    var payload = null;
    fileEl.addEventListener("change", function () {
      payload = null;
      applyBtn.disabled = true;
      var file = fileEl.files && fileEl.files[0];
      validateBtn.disabled = !file;
      report.textContent = file ? "Ready to validate: " + file.name : "No file chosen.";
    });
    function readFile(done) {
      var file = fileEl.files && fileEl.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try { payload = JSON.parse(reader.result); }
        catch (e) { payload = null; report.textContent = "Not valid JSON: " + e.message; return; }
        done();
      };
      reader.readAsText(file);
    }
    validateBtn.addEventListener("click", function () {
      readFile(function () {
        fetch("/api/import/validate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res.error) { report.textContent = "Refused: " + res.error; applyBtn.disabled = true; return; }
          report.textContent = "Safe to import: " + res.accepted.length + " records (" + res.bytes + " bytes)." +
            (res.rejected.length ? "\nRejected: " + res.rejected.join(", ") : "") +
            "\nExisting files with the same names will be replaced. Nothing else is deleted.";
          applyBtn.disabled = false;
        });
      });
    });
    applyBtn.addEventListener("click", function () {
      if (!payload) return;
      fetch("/api/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res.error) { report.textContent = "Import failed: " + res.error; return; }
        report.textContent = "Imported " + res.count + " records:\n" + res.written.join("\n");
        applyBtn.disabled = true;
        if (window.refreshDayOs) window.refreshDayOs();
        renderMonthly();
      });
    });
  }
  renderPortable();

  /* ---- monthly rollup ---- */
  var monthlyRoot = document.getElementById("monthly-root");
  function renderMonthly() {
    if (!monthlyRoot) return;
    fetch("/api/monthly").then(function (r) { return r.json(); }).then(function (d) {
      var rows = d.months || [];
      if (!rows.length) {
        monthlyRoot.innerHTML = '<p class="day-os-note">No weekly reviews yet. Close a week above and it will appear here as a month.</p>';
        return;
      }
      var max = Math.max.apply(null, rows.map(function (m) { return m.recorded || 0; }).concat([1]));
      monthlyRoot.innerHTML = '<div class="monthly-box">' + rows.map(function (m) {
        var accuracy = m.quiz_total ? Math.round(100 * m.quiz_correct / m.quiz_total) + "% quiz" : "no quiz data";
        var focus = m.focuses.length ? " · focus: " + esc(m.focuses[m.focuses.length - 1]) : "";
        return '<div class="month-row"><b>' + esc(m.month) + "</b>" +
          '<div class="month-bar" style="width:' + Math.max(2, Math.round(100 * (m.recorded || 0) / max)) + '%"></div>' +
          '<span class="month-detail">' + esc(m.recorded || 0) + " recorded · " + esc(m.reviews) + " reviews · " +
          esc(accuracy) + focus + "</span></div>";
      }).join("") + "</div>";
    }).catch(function () { /* the loading note stays */ });
  }
  renderMonthly();

  /* ---- competence map ---- */
  var competenceRoot = document.getElementById("competence-root");
  function renderCompetence() {
    fetch("/api/competence").then(function (r) { return r.json(); }).then(function (d) {
      if (!competenceRoot) return;
      if (d.error) { competenceRoot.textContent = d.error; return; }
      var months = d.months || [];
      var head = '<div class="competence-row header"><span>Domain</span>' +
        months.map(function (m) { return "<span>" + esc(m.slice(2)) + "</span>"; }).join("") +
        "<span>Total</span></div>";
      var rows = (d.domains || []).map(function (row) {
        return '<div class="competence-row"><span>' + esc(row.domain) + "</span>" +
          row.months.map(function (v) {
            return '<span class="competence-cell' + (v ? " has" : "") + '">' + (v || "·") + "</span>";
          }).join("") + '<span class="competence-cell">' + esc(row.total) + "</span></div>";
      }).join("");
      var lessons = '<div class="lesson-status">' + (d.lessons || []).map(function (item) {
        return "<div><b>" + esc(item.number) + "</b><span>" + esc(item.title) + "</span>" +
          (item.recorded ? "<em>recorded " + esc(item.recorded_on || "") + "</em>" : "<em>to do</em>") +
          (item.accuracy !== null ? "<em>quiz " + Math.round(item.accuracy * 100) + "%</em>" : "") +
          "</div>";
      }).join("") + "</div>";
      competenceRoot.innerHTML = '<div class="competence-grid">' + head + rows + "</div>" + lessons;
    }).catch(function () { /* the loading note stays */ });
  }

  /* ---- weekly review ---- */
  var reviewRoot = document.getElementById("review-root");
  function renderReview() {
    fetch("/api/review").then(function (r) { return r.json(); }).then(function (d) {
      if (!reviewRoot) return;
      if (d.error) { reviewRoot.textContent = d.error; return; }
      var saved = d.saved
        ? '<div class="review-saved">' + esc(d.saved) + "</div>"
        : '<p class="day-os-note">No review recorded for ' + esc(d.week) + " yet.</p>";
      reviewRoot.innerHTML =
        '<p class="day-os-note">Week ' + esc(d.week) +
        '. Write down what closed, what slipped, and one focus for next week.</p>' +
        '<form class="review-form" id="review-form">' +
        '<textarea name="note" placeholder="What got recorded, what slipped, what did you miss?"></textarea>' +
        '<textarea name="focus" placeholder="One focus for next week"></textarea>' +
        '<button type="submit">Close the week &amp; record</button></form>' + saved;
      document.getElementById("review-form").addEventListener("submit", function (event) {
        event.preventDefault();
        var form = event.target;
        fetch("/api/review", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: form.note.value, focus: form.focus.value })
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res.error) {
            reviewRoot.insertAdjacentHTML("afterbegin", '<div class="day-banner">' + esc(res.error) + "</div>");
            return;
          }
          renderReview();
        });
      });
    }).catch(function () { /* the loading note stays */ });
  }
  renderCompetence();
  renderReview();

  fetch("/api/week")
    .then(function (r) { return r.json(); })
    .then(function (d) { week = d; if (window.dayOsData) window.renderPlanning(window.dayOsData); })
    .catch(function () { /* the week strip simply stays in its loading state */ });
})();
