/* Sami: voice companion + metacognitive memory. Explains, locates, recommends,
   remembers approved decisions. Does not edit files from this panel. */
(function () {
  var panel = document.getElementById("sami-panel");
  var chatView = document.getElementById("sami-chat-view");
  var memoryView = document.getElementById("sami-memory-view");
  var input = document.getElementById("sami-text");
  var form = document.getElementById("sami-form");
  var micBtn = document.getElementById("sami-mic");
  var statusEl = document.getElementById("sami-status");
  var voiceBtn = document.getElementById("sami-voice");
  var meta = null;
  var speakOn = true;
  var recognition = null;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function status(text) { if (statusEl) statusEl.textContent = text; }

  function speak(text) {
    if (!speakOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var clean = String(text).replace(/[*_#>`]/g, "").replace(/\s+/g, " ").trim();
    var utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.98;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }
  function plain(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  }

  function bubble(who, html) {
    var el = document.createElement("div");
    el.className = "sami-msg " + who;
    el.innerHTML = html;
    chatView.appendChild(el);
    chatView.scrollTop = chatView.scrollHeight;
    return el;
  }

  /* ---- answer engine ---- */
  function answer(question) {
    var q = question.toLowerCase();
    var m = meta || {};
    var mc = m.metacognition || {};

    if (/search|google|look up|on the web|web search/.test(q)) {
      var term = question.replace(/^(please\s+)?(search|google|look up|find on the web|search the web for|search for)\s*/i, "").trim();
      if (!term) term = question;
      window.open("https://www.google.com/search?q=" + encodeURIComponent(term), "_blank", "noopener,noreferrer");
      return { html: "Opening a web search for <b>" + esc(term) + "</b> in a new tab. That is a handoff, not me claiming to have read the results — you decide what to trust.", speak: "Opening a web search for " + term + ". I haven't read the results, so you decide what to trust." };
    }

    if (/where is|which file|locate|find the file|open the file|file path|\bpath\b|show me the file/.test(q)) {
      var files = m.files || [];
      var words = q.replace(/where is|which file|locate|find the file|open the file|file path|show me the file|the|my|please/g, "")
        .replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(function (w) { return w.length > 2; });
      var hits = files.filter(function (item) {
        var hay = (item.path + " " + item.what).toLowerCase();
        return !words.length || words.some(function (word) { return hay.indexOf(word) !== -1; });
      });
      if (!hits.length) hits = files.slice(0, 4);
      var list = hits.slice(0, 6).map(function (item) {
        var link = item.path.endsWith("/") ? "" : '<a href="/file/' + encodeURI(item.path) + '" target="_blank" rel="noopener">' + esc(item.path) + "</a>";
        return "<div>" + (link || "<b>" + esc(item.path) + "</b>") + "<span>" + esc(item.what) + "</span></div>";
      }).join("");
      return { html: "Here is where things live in the app:" + '<div class="sami-files">' + list + "</div>", speak: "I found " + hits.length + " matching places. I've listed the paths and what each one holds." };
    }

    if (/recommend|next step|what should i|what do you suggest|better idea/.test(q)) {
      var recs = m.recommendations || [];
      var top = recs[0];
      return { html: "My first recommendation is <b>" + esc(top.title) + "</b>. " + esc(top.why) + " Next: " + esc(top.next) + " Open <b>Memory &amp; recommendations</b> to approve it and I will record the decision.", speak: "My first recommendation: " + top.title + ". " + top.why + " Open the memory tab to approve it." };
    }

    if (/adhd|focus|setting|colour|color|theme|overwhelm|calm/.test(q)) {
      var adhd = m.adhd || {};
      return { html: "ADHD settings that are already here:<ul>" + (adhd.present || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>What I would add:<ul>" + (adhd.could_add || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>", speak: "You have one focus card, short prayer-window chunks, one-click done and skip, colour-coded sections, dark theme and a focus mode. I would add an intensity switch, a shutdown timer and energy labels for tasks." };
    }

    if (/lesson|learn|education|study|quiz|design.*better/.test(q)) {
      return { html: "<b>On better lessons:</b> " + esc(mc.better_lessons || "") + " <b>And your direction:</b> " + esc(mc.your_history_direction || ""), speak: mc.better_lessons || "" };
    }

    if (/career|journey|tools.*provided|is it enough|enough.*tools/.test(q)) {
      return { html: "<b>Tools you have:</b> " + esc(mc.tools_for_education_career || "") + " <b>My honest read:</b> " + esc(mc.is_it_all_inclusive || ""), speak: mc.tools_for_education_career || "" };
    }

    if (/history|review.*direction|you know me|directed to/.test(q)) {
      return { html: "<b>From your review history:</b> " + esc(mc.your_history_direction || ""), speak: mc.your_history_direction || "" };
    }

    if (/stay|external|resources|leave the app|inside the app/.test(q)) {
      return { html: "<b>Can you stay here?</b> " + esc(mc.does_it_keep_me_here || ""), speak: mc.does_it_keep_me_here || "" };
    }

    if (/missing|lack|all inclusive|is it all|architecture|standard|honest|gap/.test(q)) {
      var gaps = mc.what_is_missing || [];
      return { html: "<b>Honest answer:</b> " + esc(mc.is_it_all_inclusive || "") + " <b>Open gaps:</b><ul>" + gaps.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>", speak: mc.is_it_all_inclusive || "" };
    }

    if (/project|helix|signoff|compliproof|study.studio|sigma|live support/.test(q)) {
      var ps = m.projects || [];
      var list = ps.map(function (p) { return "<div><b>" + esc(p.name) + "</b><span>" + esc(p.note) + "</span></div>"; }).join("");
      return { html: "The projects I can speak about:<div class='sami-files'>" + list + "</div>", speak: "I can tell you about Helix Codex, LIVE Support Assistant, Signoff, CompliProof, Study Studio and SigmaHelix OS. Ask me about one by name." };
    }

    if (/^(hi|hello|hey|salam|good (morning|evening|afternoon))\b/.test(q)) {
      return { html: "Salam, Hatem. I am here — ask me about any part of this app, your projects, or what would move your learning forward. Ask about what is missing and I will be honest.", speak: "Salam Hatem. I'm here. Ask me about the app, your projects, or what would move your learning forward." };
    }

    return { html: "I can do four things from here: <b>explain</b> any part of the app, <b>locate</b> a file and open it, <b>hand off</b> a web search, and <b>recommend</b> your next move with my metacognitive memory. Try “what's missing?”, “where is the glossary?”, or “recommend a next step”.", speak: "I can explain the app, locate a file, hand off a web search, and recommend your next move. Try asking what's missing, where the glossary is, or for a recommendation." };
  }

  function send(question) {
    question = String(question || "").trim();
    if (!question) return;
    bubble("me", esc(question));
    input.value = "";
    var res = answer(question);
    bubble("sami", res.html);
    speak(res.speak || plain(res.html));
  }

  /* ---- memory and recommendations ---- */
  function renderMemory() {
    if (!meta) return;
    var mc = meta.metacognition || {};
    var recs = meta.recommendations || [];
    var decisions = meta.decisions || [];
    var done = {};
    decisions.forEach(function (d) { done[d.id] = d; });
    var qa = [
      ["Is the OS all inclusive?", mc.is_it_all_inclusive],
      ["Does it keep you here?", mc.does_it_keep_me_here],
      ["Can we design lessons better?", mc.better_lessons],
      ["Your review-history direction", mc.your_history_direction],
      ["Tools for education & career", mc.tools_for_education_career],
      ["Does the architecture meet your standard?", mc.architecture_fit],
      ["What is still missing", (mc.what_is_missing || []).join(" · ")]
    ];
    memoryView.innerHTML =
      '<div><span class="mono-label">My metacognitive memory · ' + esc(meta.updated || "") + "</span>" +
      qa.map(function (pair) {
        return '<div class="sami-decision"><b>' + esc(pair[0]) + "</b><small>" + esc(pair[1] || "") + "</small></div>";
      }).join("") + "</div>" +
      '<div><span class="mono-label">Recommendations · approve to record</span>' +
      recs.map(function (rec) {
        var recorded = done[rec.id];
        return '<div class="sami-rec-full' + (recorded ? " done" : "") + '" data-rec="' + esc(rec.id) + '">' +
          "<h4>" + esc(rec.title) + "</h4>" +
          (rec.status ? '<small style="color:var(--positive)">' + esc(rec.status) + "</small>" : "") +
          "<p>" + esc(rec.why) + "</p><p>" + esc(rec.next) + "</p>" +
          '<button type="button" data-approve="' + esc(rec.id) + '">' +
          (recorded ? "✓ Recorded " + esc(recorded.approved_at || "") : "Approve &amp; record") + "</button></div>";
      }).join("") + "</div>" +
      '<div><span class="mono-label">Recorded decisions</span>' +
      (decisions.length ? decisions.map(function (d) {
        return '<div class="sami-decision"><b>' + esc(d.title) + "</b><small>" + esc(d.approved_at || "") + (d.note ? " · " + esc(d.note) : "") + "</small></div>";
      }).join("") : '<p class="day-os-note">Nothing approved yet. Approve a recommendation above and it is written down.</p>') + "</div>";

    memoryView.querySelectorAll("button[data-approve]").forEach(function (btn) {
      if (btn.textContent.indexOf("✓") === 0) return;
      btn.addEventListener("click", function () {
        fetch("/api/approve", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: btn.getAttribute("data-approve") })
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (res.error) { status(res.error); return; }
          return fetch("/api/meta").then(function (r) { return r.json(); }).then(function (fresh) {
            meta = fresh;
            renderMemory();
            status("Recorded. We move on.");
            bubble("sami", "Recorded: <b>" + esc(btn.getAttribute("data-approve")) + "</b>. It is now in your decision log — we move on.");
            speak("Recorded. We move on.");
          });
        });
      });
    });
  }

  /* ---- panel wiring ---- */
  document.getElementById("sami-open").addEventListener("click", function () {
    panel.hidden = false;
    input.focus();
    if (!chatView.children.length) {
      bubble("sami", "Salam, Hatem. I am your companion here — not a coding agent. I can locate files, hand off a web search, and keep a metacognitive memory of this app. Ask me anything, or open <b>Memory &amp; recommendations</b>.");
    }
    status(speakOn ? "Voice on. Use the mic to talk; 🔊 toggles my answers." : "Voice off. Type your question.");
  });
  document.getElementById("sami-close").addEventListener("click", function () {
    panel.hidden = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognition) { try { recognition.stop(); } catch (e) {} }
  });

  voiceBtn.addEventListener("click", function () {
    speakOn = !speakOn;
    voiceBtn.textContent = speakOn ? "🔊" : "🔇";
    if (!speakOn && window.speechSynthesis) window.speechSynthesis.cancel();
    status(speakOn ? "Voice on." : "Voice off. Type your question.");
  });

  document.querySelectorAll(".sami-tabbar button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".sami-tabbar button").forEach(function (b) { b.classList.toggle("on", b === btn); });
      var memory = btn.dataset.tab === "memory";
      chatView.hidden = memory;
      memoryView.hidden = !memory;
      document.getElementById("sami-chips").hidden = memory;
      form.hidden = memory;
      if (memory) renderMemory();
    });
  });

  document.querySelectorAll("#sami-chips button").forEach(function (btn) {
    btn.addEventListener("click", function () { send(btn.dataset.q); });
  });
  form.addEventListener("submit", function (event) { event.preventDefault(); send(input.value); });

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  micBtn.addEventListener("click", function () {
    if (!SpeechRecognition) {
      status("Voice input is not supported in this browser. Type instead.");
      return;
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
      micBtn.classList.remove("listening");
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "en-GB";
    recognition.interimResults = false;
    recognition.onstart = function () { micBtn.classList.add("listening"); status("Listening…"); };
    recognition.onresult = function (event) {
      var text = event.results[0][0].transcript;
      micBtn.classList.remove("listening");
      recognition = null;
      status("Got it.");
      send(text);
    };
    recognition.onerror = function (event) {
      status("Mic: " + event.error + ". Type instead if needed.");
      micBtn.classList.remove("listening");
      recognition = null;
    };
    recognition.onend = function () { micBtn.classList.remove("listening"); recognition = null; };
    try { recognition.start(); } catch (e) { status("Mic could not start. Type instead."); }
  });

  fetch("/api/meta").then(function (r) { return r.json(); }).then(function (data) {
    meta = data;
    status(speakOn ? "Ready. Voice on — allow the microphone when your browser asks." : "Ready. Voice off.");
  }).catch(function () { status("Memory could not load. The rest of the app still works."); });
})();
