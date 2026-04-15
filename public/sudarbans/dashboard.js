/* ============================================================
   SUNDARBANS HOUSE WIDGETS — app.js
   Loads config from data.json, then initialises all 8 widgets.
   All state is persisted to localStorage under "sb_*" keys.
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   GLOBAL UTILITIES
────────────────────────────────────────────── */

const TODAY = new Date().toDateString();
const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/** Persist a value to localStorage as JSON. */
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

/** Load a value from localStorage, or return a default. */
function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch (e) { return defaultValue; }
}

/** Safely escape HTML to prevent XSS when injecting user content. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Zero-pad a number to 2 digits. */
function pad2(n) { return String(n).padStart(2, '0'); }

/** Format seconds as MM:SS. */
function fmtTime(secs) {
  return pad2(Math.floor(secs / 60)) + ':' + pad2(secs % 60);
}

/** Human-readable time since a Unix timestamp. */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  if (diff  < 60000)  return 'just now';
  if (mins  < 60)     return mins + 'm ago';
  if (hrs   < 24)     return hrs  + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

/* ──────────────────────────────────────────────
   CONFETTI ENGINE  (Canvas-based particle burst)
────────────────────────────────────────────── */

const CC  = document.getElementById('confetti-canvas');
const CTX = CC.getContext('2d');
let _confAF = null;

function resizeCanvas() {
  CC.width  = window.innerWidth;
  CC.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/**
 * Fire a confetti burst originating from (ox, oy).
 * Falls back to centre of screen when coordinates are omitted.
 */
function fireConfetti(ox, oy) {
  const cx = ox != null ? ox : CC.width / 2;
  const cy = oy != null ? oy : CC.height * 0.45;
  const PALETTE = ['#c9a84c','#e8c97a','#4caf50','#f5f0e8','#e07070','#7ab0e0','#b07ae0'];

  const particles = Array.from({ length: 110 }, () => ({
    x:    cx + (Math.random() - 0.5) * 50,
    y:    cy + (Math.random() - 0.5) * 20,
    vx:   (Math.random() - 0.5) * 10,
    vy:   -(Math.random() * 9 + 2),
    r:    Math.random() * 5 + 2,
    rot:  Math.random() * 360,
    rotV: (Math.random() - 0.5) * 8,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    life: 1
  }));

  cancelAnimationFrame(_confAF);

  (function draw() {
    CTX.clearRect(0, 0, CC.width, CC.height);
    let alive = false;

    particles.forEach(function (p) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.2;
      p.vx  *= 0.98;
      p.rot += p.rotV;
      p.life -= 0.013;
      if (p.life <= 0) return;
      alive = true;

      CTX.save();
      CTX.globalAlpha = p.life;
      CTX.translate(p.x, p.y);
      CTX.rotate(p.rot * Math.PI / 180);
      CTX.fillStyle = p.color;
      CTX.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.55);
      CTX.restore();
    });

    if (alive) _confAF = requestAnimationFrame(draw);
    else CTX.clearRect(0, 0, CC.width, CC.height);
  })();
}

/* ──────────────────────────────────────────────
   BOOT — fetch data.json then initialise widgets
────────────────────────────────────────────── */

fetch('data.json')
  .then(function (res) { return res.json(); })
  .then(function (DATA) {
    initStreak();
    initMood(DATA.moods);
    initConfessions(DATA.confessions);
    initHousePoints(DATA.housePoints);
    initPomodoro(DATA.pomodoro);
    initBuddy(DATA.studyBuddies, DATA.buddyOptions);
    initChallenge(DATA.dailyChallenge);
    initMeme(DATA.meme);
  })
  .catch(function () {
    // Graceful fallback: run widgets with built-in defaults when
    // data.json cannot be fetched (e.g. opened as file://)
    initStreak();
    initMood(null);
    initConfessions(null);
    initHousePoints(null);
    initPomodoro(null);
    initBuddy(null, null);
    initChallenge(null);
    initMeme(null);
  });

/* ──────────────────────────────────────────────
   PAGE FADE-IN
────────────────────────────────────────────── */
document.body.style.opacity    = '0';
document.body.style.transition = 'opacity .55s';
setTimeout(function () { document.body.style.opacity = '1'; }, 80);


/* ══════════════════════════════════════════════
   1. STUDY STREAK
   localStorage keys:
     sb_streak  – current streak count (int)
     sb_best    – all-time best (int)
     sb_hist    – array of toDateString() values
     sb_last    – toDateString() of last check-in
══════════════════════════════════════════════ */

function initStreak() {

  /** Map streak count to a flame font-size tier. */
  function flameSize(n) {
    if (n === 0)  return 64;
    if (n < 3)    return 78;
    if (n < 7)    return 94;
    if (n < 14)   return 112;
    return 130;
  }

  /** Rebuild the 7-day history grid. */
  function buildGrid() {
    var hist = load('sb_hist', []);
    var grid = document.getElementById('streakGrid');
    grid.innerHTML = '';

    for (var i = 6; i >= 0; i--) {
      var d  = new Date();
      d.setDate(d.getDate() - i);
      var ds   = d.toDateString();
      var done = hist.indexOf(ds) > -1;
      var isT  = ds === TODAY;

      var cell = document.createElement('div');
      cell.className = 'streak-day' + (done ? ' done' : ' empty') + (isT ? ' today-slot' : '');
      cell.innerHTML  = '<span class="streak-day-name">' + DAYS[d.getDay()] + '</span>'
                      + '<span class="streak-day-icon">' + (done ? '🔥' : '·') + '</span>';
      grid.appendChild(cell);
    }
  }

  /** Refresh all streak UI from localStorage. */
  function refresh() {
    var streak       = load('sb_streak', 0);
    var best         = load('sb_best',   0);
    var last         = load('sb_last',   null);
    var checkedToday = (last === TODAY);

    document.getElementById('streakNumber').textContent = streak;
    document.getElementById('streakFlame').style.fontSize = flameSize(streak) + 'px';
    document.getElementById('streakBest').innerHTML = 'Best streak: <span>' + best + '</span> days';

    var btn = document.getElementById('streakBtn');
    if (checkedToday) {
      btn.disabled    = true;
      btn.textContent = 'Checked In ✓';
      document.getElementById('streakMsg').classList.add('show');
    } else {
      btn.disabled    = false;
      btn.textContent = 'Check In Today';
    }
    buildGrid();
  }

  /** Handle the Check In button click. */
  window.doCheckin = function () {
    var last = load('sb_last', null);
    if (last === TODAY) return;                       // already done

    var streak = load('sb_streak', 0);
    var best   = load('sb_best',   0);
    var hist   = load('sb_hist',   []);

    // Increment if yesterday was checked in, else restart
    var yest = new Date();
    yest.setDate(yest.getDate() - 1);
    streak = (last === yest.toDateString()) ? streak + 1 : 1;
    best   = Math.max(best, streak);

    if (hist.indexOf(TODAY) === -1) hist.push(TODAY);
    if (hist.length > 60) hist = hist.slice(-60);    // cap history

    save('sb_streak', streak);
    save('sb_best',   best);
    save('sb_hist',   hist);
    save('sb_last',   TODAY);

    refresh();

    // Fire confetti from button position
    var r = document.getElementById('streakBtn').getBoundingClientRect();
    fireConfetti(r.left + r.width / 2, r.top);
  };

  refresh();
}


/* ══════════════════════════════════════════════
   2. MOOD CHECK-IN WALL
   localStorage keys:
     sb_mood_tally – { happy:n, chill:n, … }
     sb_mood_mine  – key of today's vote
     sb_mood_date  – toDateString() of vote date
══════════════════════════════════════════════ */

function initMood(cfg) {
  var MOODS = cfg ? cfg.options : [
    { key:'happy', emoji:'😄', label:'Thriving', color:'#4caf50' },
    { key:'chill', emoji:'😌', label:'Chill',    color:'#7ab0e0' },
    { key:'grind', emoji:'😤', label:'Grind',    color:'#c9a84c' },
    { key:'meh',   emoji:'😔', label:'Meh',      color:'#b07ae0' },
    { key:'chaos', emoji:'🤯', label:'Chaos',    color:'#e07070' }
  ];
  var SEED_TALLY = cfg ? cfg.seedTally : { happy:12, chill:8, grind:19, meh:5, chaos:7 };

  var tally      = load('sb_mood_tally', SEED_TALLY);
  var myDate     = load('sb_mood_date',  null);
  var myVote     = load('sb_mood_mine',  null);
  var votedToday = (myDate === TODAY);

  /** Re-render the animated bar chart. */
  function renderBars() {
    var total = Object.values(tally).reduce(function (a, b) { return a + b; }, 0) || 1;
    var barsEl = document.getElementById('moodBars');

    barsEl.innerHTML = MOODS.map(function (m) {
      var pct = Math.round((tally[m.key] || 0) / total * 100);
      return '<div class="mood-bar-row">'
        + '<span class="mood-bar-emoji">' + m.emoji + '</span>'
        + '<div class="mood-bar-track">'
        +   '<div class="mood-bar-fill" style="background:' + m.color + ';width:0" data-pct="' + pct + '"></div>'
        + '</div>'
        + '<span class="mood-bar-count">' + (tally[m.key] || 0) + '</span>'
        + '</div>';
    }).join('');

    document.getElementById('moodTotal').textContent = total + ' votes today';

    // Animate bar widths on next paint
    requestAnimationFrame(function () {
      barsEl.querySelectorAll('.mood-bar-fill').forEach(function (f) {
        f.style.width = f.dataset.pct + '%';
      });
    });
  }

  /** Disable all buttons and show the confirmation message. */
  function lockButtons() {
    document.querySelectorAll('.mood-opt').forEach(function (btn) {
      btn.disabled = true;
      if (votedToday && btn.dataset.mood === myVote) {
        btn.classList.add('selected');
      }
    });
    document.getElementById('moodVotedMsg').classList.add('show');
  }

  renderBars();
  if (votedToday) lockButtons();

  /** Handle a mood button click. */
  window.voteMood = function (btn) {
    if (votedToday) return;
    var key = btn.dataset.mood;
    tally[key] = (tally[key] || 0) + 1;
    save('sb_mood_tally', tally);
    save('sb_mood_mine',  key);
    save('sb_mood_date',  TODAY);
    myVote = key; votedToday = true;
    btn.classList.add('selected');
    lockButtons();
    renderBars();
  };
}


/* ══════════════════════════════════════════════
   3. CONFESSION WALL
   localStorage keys:
     sb_confs     – array of confession objects
     sb_conf_id   – next auto-increment id
     sb_conf_rx   – { confId: reactionKey }
══════════════════════════════════════════════ */

function initConfessions(cfg) {
  // Build seed array with real timestamps relative to now
  var SEED = cfg ? cfg.seed.map(function (s) {
    return { id: s.id, text: s.text, ts: Date.now() - s.offsetMs, r: Object.assign({}, s.reactions) };
  }) : [
    { id:1, text:"I've submitted 4 assignments as drafts thinking they were submitted. Found out during grade review. Might cry.", ts:Date.now()-7200000,  r:{heart:24,laugh:12,wow:31} },
    { id:2, text:"Started a 6-week course 3 days before the quiz and got 90%. I operate purely on chaos energy.",                 ts:Date.now()-18000000, r:{heart:18,laugh:67,wow:9}  },
    { id:3, text:"I genuinely look forward to Monday technical sessions more than anything else this week. Not cringe, just facts.", ts:Date.now()-86400000, r:{heart:88,laugh:4,wow:11} }
  ];

  var REACTIONS = cfg ? cfg.reactions : [
    { key:'heart', emoji:'❤️' },
    { key:'laugh', emoji:'😂' },
    { key:'wow',   emoji:'😮' }
  ];

  var confs  = load('sb_confs',    SEED);
  var nextId = load('sb_conf_id',  4);
  var myRx   = load('sb_conf_rx',  {});

  /** Render all confession cards, newest first. */
  function render() {
    var listEl = document.getElementById('confList');
    if (!confs.length) {
      listEl.innerHTML = '<div class="conf-empty">No confessions yet. Be the first! 🤫</div>';
      return;
    }

    listEl.innerHTML = [].concat(confs).reverse().map(function (c) {
      var rxHtml = REACTIONS.map(function (rx) {
        var active = myRx[c.id] === rx.key ? ' reacted' : '';
        return '<button class="reaction-btn' + active + '" onclick="rxConf(' + c.id + ',\'' + rx.key + '\')">'
             + rx.emoji + ' <span>' + (c.r[rx.key] || 0) + '</span></button>';
      }).join('');

      return '<div class="confession-item">'
           +   '<div class="confession-text">' + esc(c.text) + '</div>'
           +   '<div class="confession-meta">'
           +     '<span class="confession-time">' + timeAgo(c.ts) + '</span>'
           +     rxHtml
           +   '</div>'
           + '</div>';
    }).join('');
  }

  /** Update character counter as the user types. */
  window.updateCharCount = function (el) {
    var n  = el.value.length;
    var cc = document.getElementById('charCount');
    cc.textContent = n + ' / 280';
    cc.classList.toggle('warn', n > 240);
  };

  /** Post a new confession. */
  window.postConfession = function () {
    var inp  = document.getElementById('confInput');
    var text = inp.value.trim();
    if (!text) { inp.focus(); return; }

    var c = { id: nextId++, text: text, ts: Date.now(), r: { heart:0, laugh:0, wow:0 } };
    confs.push(c);
    if (confs.length > 80) confs = confs.slice(-80);  // cap at 80

    save('sb_confs',   confs);
    save('sb_conf_id', nextId);

    inp.value = '';
    document.getElementById('charCount').textContent = '0 / 280';
    render();
    document.getElementById('confList').scrollTop = 0;
  };

  /** Toggle a reaction on a confession. Clicking the same emoji removes the vote. */
  window.rxConf = function (id, key) {
    var c = confs.find(function (x) { return x.id === id; });
    if (!c) return;

    var prev = myRx[id];
    if (prev) c.r[prev] = Math.max(0, (c.r[prev] || 1) - 1);  // remove old vote

    if (prev !== key) {
      c.r[key] = (c.r[key] || 0) + 1;
      myRx[id] = key;
    } else {
      delete myRx[id];                                         // toggle off
    }

    save('sb_confs',   confs);
    save('sb_conf_rx', myRx);
    render();
  };

  render();
}


/* ══════════════════════════════════════════════
   4. HOUSE POINTS LIVE BOARD
   (Animated counter + category bar fills on scroll)
══════════════════════════════════════════════ */

function initHousePoints(cfg) {
  var CATS = cfg ? cfg.categories : [
    { name:'Academic',  icon:'📚', points:312, max:400, color:'#e8c97a' },
    { name:'Cultural',  icon:'🎭', points:198, max:400, color:'#b07ae0' },
    { name:'Sports',    icon:'🏏', points:241, max:400, color:'#4caf50' },
    { name:'Community', icon:'🤝', points:167, max:400, color:'#7ab0e0' }
  ];
  var TOTAL = CATS.reduce(function (s, c) { return s + c.points; }, 0);

  // Build category rows
  var catsEl = document.getElementById('pointsCats');
  catsEl.innerHTML = CATS.map(function (c) {
    var pct = Math.round(c.points / c.max * 100);
    return '<div class="points-cat">'
         +   '<div class="points-cat-icon">' + c.icon + '</div>'
         +   '<div class="points-cat-info">'
         +     '<div class="points-cat-name">' + c.name + '</div>'
         +     '<div class="points-cat-bar">'
         +       '<div class="points-cat-fill" style="background:' + c.color + '" data-pct="' + pct + '"></div>'
         +     '</div>'
         +   '</div>'
         +   '<div class="points-cat-val">' + c.points + '</div>'
         + '</div>';
  }).join('');

  /** Eased numeric counter from 0 → target over `dur` ms. */
  function animateCount(el, target, dur) {
    var start = performance.now();
    (function tick(now) {
      var t    = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - t, 3);            // cubic ease-out
      el.textContent = Math.round(target * ease);
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  // Trigger animations only when the widget enters the viewport
  var fired = false;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !fired) {
        fired = true;
        animateCount(document.getElementById('houseTotal'), TOTAL, 2000);
        setTimeout(function () {
          document.querySelectorAll('.points-cat-fill').forEach(function (f) {
            f.style.width = f.dataset.pct + '%';
          });
        }, 120);
      }
    });
  }, { threshold: 0.3 }).observe(document.getElementById('widget-points'));
}


/* ══════════════════════════════════════════════
   5. POMODORO STUDY ROOM
   localStorage keys:
     sb_pomo_room    – boolean (are you in the room?)
     sb_pomo_people  – array of display names in the room
══════════════════════════════════════════════ */

function initPomodoro(cfg) {
  var PHASES = cfg ? cfg.phases : [
    { key:'focus', label:'Focus',       seconds:1500, tabLabel:'Focus 25' },
    { key:'short', label:'Short Break', seconds:300,  tabLabel:'Break 5'  },
    { key:'long',  label:'Long Break',  seconds:900,  tabLabel:'Long 15'  }
  ];
  var SEED_PEOPLE  = cfg ? cfg.seedStudiers  : ['Aditi S.','Rohan V.','Dev P.','Mehak S.'];
  var MAX_SESSIONS = cfg ? cfg.maxSessions   : 4;

  // SVG ring circumference for r=70: 2π×70 ≈ 440
  var CIRC = 2 * Math.PI * 70;
  var ring = document.getElementById('pomoRing');
  ring.style.strokeDasharray = String(CIRC);

  var phase      = 'focus';
  var totalSecs  = 1500;
  var remaining  = 1500;
  var running    = false;
  var ticker     = null;
  var sessions   = 0;
  var inRoom     = load('sb_pomo_room',   false);
  var roomPeople = load('sb_pomo_people', SEED_PEOPLE);

  /** Map stroke-dashoffset so the ring empties as time runs down. */
  function setRing(fraction) {
    ring.style.strokeDashoffset = String(CIRC * (1 - fraction));
  }

  /** CSS class for ring colour by phase. */
  function ringClass() {
    if (phase === 'focus') return 'pomo-ring-fill';
    if (phase === 'short') return 'pomo-ring-fill break';
    return 'pomo-ring-fill longbreak';
  }

  /** Sync display, ring, and ring colour. */
  function updateDisplay() {
    document.getElementById('pomoDisplay').textContent = fmtTime(remaining);
    setRing(remaining / totalSecs);
    ring.className = ringClass();
  }

  /** Re-render the session progress dots. */
  function renderDots() {
    var html = '';
    for (var i = 0; i < MAX_SESSIONS; i++) {
      html += '<span class="pomo-session-dot' + (i < sessions ? ' filled' : '') + '"></span>';
    }
    html += '<span class="pomo-session-lbl">' + sessions + '/' + MAX_SESSIONS + ' sessions</span>';
    document.getElementById('pomoSessionRow').innerHTML = html;
  }

  /** Re-render the "studying now" chips. */
  function renderPeople() {
    var list = inRoom ? ['You'].concat(roomPeople) : roomPeople;
    document.getElementById('pomoCount').textContent = list.length;
    document.getElementById('pomoStudiers').innerHTML = list.map(function (p) {
      var isYou = p === 'You';
      return '<div class="pomo-person' + (isYou ? ' you' : '') + '">'
           + (isYou ? '<div class="pomo-person-dot"></div>' : '')
           + esc(p) + '</div>';
    }).join('');

    var jb = document.getElementById('pomoJoinBtn');
    jb.textContent = inRoom ? 'Leave Room' : 'Join Room';
    jb.className   = 'btn ' + (inRoom ? 'btn-green' : 'btn-ghost');
  }

  /** Called when the countdown reaches zero. */
  function onComplete() {
    running = false;
    clearInterval(ticker); ticker = null;
    document.getElementById('pomoStartBtn').textContent = 'Start';

    if (phase === 'focus') {
      sessions = Math.min(sessions + 1, MAX_SESSIONS);
      renderDots();
    }

    var banner = document.getElementById('pomoBanner');
    banner.classList.add('show');
    setTimeout(function () { banner.classList.remove('show'); }, 4500);
    fireConfetti();
  }

  /* ── Public handlers (called by onclick in HTML) ── */

  /** Switch to a different phase (focus / short / long). */
  window.setPhase = function (btn) {
    clearInterval(ticker); ticker = null; running = false;
    document.getElementById('pomoStartBtn').textContent = 'Start';
    document.getElementById('pomoBanner').classList.remove('show');
    document.querySelectorAll('.pomo-tab').forEach(function (t) { t.classList.remove('active'); });
    btn.classList.add('active');

    phase      = btn.dataset.phase;
    totalSecs  = parseInt(btn.dataset.secs, 10);
    remaining  = totalSecs;
    document.getElementById('pomoPhaseLabel').textContent =
      PHASES.find(function (p) { return p.key === phase; }).label;

    updateDisplay();
  };

  /** Start or pause the timer. */
  window.togglePomo = function () {
    running = !running;
    var btn = document.getElementById('pomoStartBtn');
    if (running) {
      btn.textContent = 'Pause';
      ticker = setInterval(function () {
        remaining--;
        updateDisplay();
        if (remaining <= 0) onComplete();
      }, 1000);
    } else {
      btn.textContent = 'Resume';
      clearInterval(ticker); ticker = null;
    }
  };

  /** Reset the timer to the start of the current phase. */
  window.resetPomo = function () {
    clearInterval(ticker); ticker = null; running = false; remaining = totalSecs;
    document.getElementById('pomoStartBtn').textContent = 'Start';
    document.getElementById('pomoBanner').classList.remove('show');
    updateDisplay();
  };

  /** Join or leave the study room. */
  window.toggleRoom = function () {
    inRoom = !inRoom;
    save('sb_pomo_room', inRoom);
    renderPeople();
  };

  updateDisplay();
  renderDots();
  renderPeople();
}


/* ══════════════════════════════════════════════
   6. STUDY BUDDY MATCHER
══════════════════════════════════════════════ */

function initBuddy(pool, opts) {
  var POOL = pool || [
    { name:'Aditi Sharma',  roll:'23f1000052', tags:['Night Owl','Explains Well','Speed Runner']    },
    { name:'Rohan Verma',   roll:'22f1000119', tags:['Silent Mode','Topper Energy','Note Sharer']   },
    { name:'Mehak Singh',   roll:'24f1000093', tags:['Discussion Queen','Mock Test Fan','Patient']  },
    { name:'Dev Patel',     roll:'23f2000114', tags:['Problem Solver','Early Riser','Flashcard Pro']},
    { name:'Priya Nair',    roll:'24f2000050', tags:['Chill Vibes','Group Study','Mentor Mode']     },
    { name:'Arjun Mehra',   roll:'23f3000021', tags:['Competitive','CP Grinder','Deadline Chaser']  },
    { name:'Sneha Iyer',    roll:'24f1000078', tags:['Structured Notes','Pomodoro Fan','Consistent']},
    { name:'Karan Joshi',   roll:'23f4000031', tags:['Visual Learner','Diagram Lover','Calm Energy']}
  ];

  var lastIdx = -1;

  /** Populate the three filter dropdowns from data.json. */
  function buildDropdowns() {
    if (!opts) return;
    var map = { buddySub: opts.subjects, buddyTime: opts.timeSlots, buddyStyle: opts.studyStyles };
    Object.keys(map).forEach(function (id) {
      var sel = document.getElementById(id);
      map[id].forEach(function (label) {
        var opt = document.createElement('option');
        opt.textContent = label;
        sel.appendChild(opt);
      });
    });
  }

  /** Find and display a matched buddy. */
  window.findBuddy = function () {
    // Validate all three selects
    var valid = true;
    ['buddySub','buddyTime','buddyStyle'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value) {
        el.classList.add('error');
        setTimeout(function () { el.classList.remove('error'); }, 2000);
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });
    if (!valid) return;

    // Pick a different member from last time
    var idx, attempts = 0;
    do {
      idx = Math.floor(Math.random() * POOL.length);
      attempts++;
    } while (idx === lastIdx && POOL.length > 1 && attempts < 10);
    lastIdx = idx;

    var m   = POOL[idx];
    var pct = 75 + Math.floor(Math.random() * 24);   // 75–98% match score

    document.getElementById('buddyAvatar').textContent = m.name.charAt(0);
    document.getElementById('buddyName').textContent   = m.name;
    document.getElementById('buddyRoll').textContent   = m.roll + '@ds.study.iitm.ac.in';
    document.getElementById('buddyPct').textContent    = pct + '%';
    document.getElementById('buddyTags').innerHTML     = m.tags.map(function (t) {
      return '<span class="buddy-tag">' + esc(t) + '</span>';
    }).join('');

    // Reset connect state for fresh match
    document.getElementById('buddySentMsg').classList.remove('show');
    var cb = document.getElementById('connectBtn');
    cb.disabled    = false;
    cb.textContent = '💬 Connect';

    document.getElementById('buddyResult').classList.add('show');
  };

  /** Send a connection request to the matched buddy. */
  window.connectBuddy = function () {
    var name = document.getElementById('buddyName').textContent;
    if (!name) return;
    document.getElementById('buddySentMsg').classList.add('show');
    var cb = document.getElementById('connectBtn');
    cb.disabled    = true;
    cb.textContent = 'Sent!';
  };

  // Remove error styling when user changes a select
  ['buddySub','buddyTime','buddyStyle'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function () {
      this.classList.remove('error');
    });
  });

  buildDropdowns();
}


/* ══════════════════════════════════════════════
   7. DAILY CHALLENGE
   localStorage keys (reset each day):
     sb_ch_date    – TODAY string
     sb_ch_solvers – array of solver objects
     sb_ch_solved  – boolean
══════════════════════════════════════════════ */

function initChallenge(cfg) {
  var SEED_SOLVERS = cfg ? cfg.seedSolvers : [
    { name:'Aditi Sharma', time:'08:42 AM', points:25, me:false },
    { name:'Dev Patel',    time:'09:15 AM', points:25, me:false },
    { name:'Rohan Verma',  time:'10:03 AM', points:20, me:false }
  ];
  var PTS_FULL = cfg ? cfg.points         : 25;
  var PTS_HINT = cfg ? cfg.pointsWithHint : 15;

  // Wipe solver list and solved state at the start of each new day
  if (load('sb_ch_date', null) !== TODAY) {
    save('sb_ch_date',    TODAY);
    save('sb_ch_solvers', SEED_SOLVERS);
    save('sb_ch_solved',  false);
  }

  var solvers   = load('sb_ch_solvers', SEED_SOLVERS);
  var mySolved  = load('sb_ch_solved',  false);
  var hintShown = false;

  /** Render the ranked solver list. */
  function renderSolvers() {
    document.getElementById('solverCount').textContent = solvers.length;
    document.getElementById('challengeSolvers').innerHTML = solvers.map(function (s, i) {
      return '<div class="challenge-solver' + (s.me ? ' me' : '') + '">'
           +   '<span class="solver-rank">' + (i + 1) + '</span>'
           +   '<span class="solver-name">' + esc(s.name) + (s.me ? ' (You)' : '') + '</span>'
           +   '<span class="solver-time">' + s.time + '</span>'
           +   '<span class="solver-pts">+'  + s.points + '</span>'
           + '</div>';
    }).join('');
  }

  /** Disable the solve button and show the confirmation banner. */
  function lockSolveBtn() {
    var btn = document.getElementById('solveBtn');
    btn.disabled    = true;
    btn.textContent = '✓ Solved!';
    document.getElementById('challengeSolvedWrap').classList.add('show');
  }

  /** Show/hide the hint box. */
  window.toggleHint = function () {
    hintShown = !hintShown;
    document.getElementById('challengeHint').classList.toggle('show', hintShown);
    document.getElementById('hintBtn').textContent = hintShown ? '🙈 Hide Hint' : '💡 Hint';
  };

  /** Mark the challenge as solved and add the user to the leaderboard. */
  window.markSolved = function () {
    if (mySolved) return;

    var now  = new Date();
    var time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    var pts  = hintShown ? PTS_HINT : PTS_FULL;

    solvers.push({ name:'You', time: time, points: pts, me: true });
    save('sb_ch_solvers', solvers);
    save('sb_ch_solved',  true);
    mySolved = true;

    document.getElementById('challengeSolvedPts').textContent = '+' + pts;
    renderSolvers();
    lockSolveBtn();

    var r = document.getElementById('solveBtn').getBoundingClientRect();
    fireConfetti(r.left + r.width / 2, r.top);
  };

  renderSolvers();
  if (mySolved) lockSolveBtn();
}


/* ══════════════════════════════════════════════
   8. MEME OF THE WEEK
   localStorage keys:
     sb_meme_votes – { candId: 'fire'|'dead' }
══════════════════════════════════════════════ */

function initMeme(cfg) {
  var CANDS = cfg ? cfg.candidates : [
    { id:1, emoji:'📖😭', title:'When you realise Stats has calculus in it', author:'anon_24f', fire:34, dead:12 },
    { id:2, emoji:'🐱💻', title:'My laptop at 1AM during submission week',   author:'anon_22f', fire:28, dead:45 },
    { id:3, emoji:'🧠✨', title:'Brain 10 mins before vs during an exam',    author:'anon_23f', fire:61, dead:8  }
  ];

  var votes = load('sb_meme_votes', {});

  /** Re-render the candidate voting list. */
  function render() {
    document.getElementById('memeCandidates').innerHTML = CANDS.map(function (c) {
      var mv = votes[c.id];
      return '<div class="meme-candidate">'
           +   '<div class="meme-cand-emoji">' + c.emoji + '</div>'
           +   '<div class="meme-cand-info">'
           +     '<div class="meme-cand-title">' + esc(c.title) + '</div>'
           +     '<div class="meme-cand-by">by ' + esc(c.author) + '</div>'
           +   '</div>'
           +   '<div class="meme-cand-btns">'
           +     '<button class="meme-cand-v' + (mv === 'fire' ? ' fire-voted' : '') + '" onclick="memeVote(' + c.id + ',\'fire\')">🔥 ' + c.fire + '</button>'
           +     '<button class="meme-cand-v' + (mv === 'dead' ? ' dead-voted' : '') + '" onclick="memeVote(' + c.id + ',\'dead\')">💀 ' + c.dead + '</button>'
           +   '</div>'
           + '</div>';
    }).join('');
  }

  /**
   * Cast a vote for a candidate.
   * Clicking the same type again removes the vote (toggle).
   */
  window.memeVote = function (id, type) {
    var c = CANDS.find(function (x) { return x.id === id; });
    if (!c) return;

    var prev = votes[id];
    if (prev) c[prev] = Math.max(0, c[prev] - 1);   // undo previous vote

    if (prev !== type) {
      c[type]++;
      votes[id] = type;
    } else {
      delete votes[id];                               // toggle off
    }

    save('sb_meme_votes', votes);
    render();
  };

  /**
   * Handle a file (either from drag-drop or file picker).
   * Reads it as a DataURL and shows a preview image.
   */
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    var reader = new FileReader();
    reader.onload = function (ev) {
      var preview = document.getElementById('memePreview');
      document.getElementById('memePreviewImg').src = ev.target.result;
      preview.style.display = 'block';
      document.getElementById('memeSubmitMsg').style.display = 'block';

      // Replace drop zone with a confirmation message
      var dz = document.getElementById('memeDropZone');
      dz.innerHTML = '<div class="meme-drop-icon">✅</div>'
                   + '<div class="meme-drop-text"><strong>Meme received!</strong> Judges are reviewing…</div>';
      dz.onclick     = null;
      dz.ondragover  = null;
      dz.ondrop      = null;
    };
    reader.readAsDataURL(file);
  }

  window.handleMemeDrop = function (e) {
    e.preventDefault();
    document.getElementById('memeDropZone').classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
  };

  window.handleMemeFile = function (file) { handleFile(file); };

  render();
}
