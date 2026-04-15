<template>
  <div class="members-lounge-page">
    <!-- PAGE LOADER (optional simple loader for transition) -->
    <transition name="fade-slow">
      <div id="page-loader" v-if="pageLoading">
        <div class="loader-logo">🌿</div>
        <div class="loader-bar"><div class="loader-fill"></div></div>
      </div>
    </transition>

    <div class="grain"></div>

    <!-- NAVBAR -->
    <MembersNavbar
      :member-email="memberEmail"
      @leave-lounge="leaveLounge"
      @logout="logout"
    />

    <!-- HERO -->
    <section class="hero">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Exclusive Members Lounge
        </div>
        <h1 class="hero-greeting">
          Welcome Back, <br /><em>{{ memberRoll }}</em>
        </h1>
        <p class="hero-sub" style="animation-delay: 0.5s;">Grow Together. Lead Together. Build Together.</p>
        <div class="hero-stats" style="animation-delay: 0.65s;">
          <div class="stat">
            <div class="stat-val">{{ memberCountText }}</div>
            <div class="stat-lbl">Members</div>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <div class="stat-val">{{ countdownText }}</div>
            <div class="stat-lbl">Next Event In</div>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <div class="stat-val">5</div>
            <div class="stat-lbl">Weekly Events</div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- EVENTS -->
    <section id="events">
      <div class="container">
        <div class="reveal" v-observe>
          <div class="section-label">Weekly Schedule</div>
          <h2 class="section-title">Live Events</h2>
        </div>
        <div class="events-grid">
          <div
            v-for="(ev, index) in events"
            :key="index"
            class="event-card"
            :class="{ 'today-event': ev.isToday }"
            v-observe
            :style="{ transitionDelay: `${(index % 5) * 0.08}s` }"
          >
            <span class="event-icon">{{ ev.icon }}</span>
            <h3>{{ ev.title }}</h3>
            <p>{{ ev.desc }}</p>
            <a href="#" class="join-btn" @click.prevent>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 10l5 5-5 5"/>
                <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
              </svg>
              Join GMeet
            </a>
            <div v-if="ev.isToday" class="today-tag">Today's Event</div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- NIGHT OWL / READING LOUNGE -->
    <section id="lounge" class="night-section">
      <div class="container">
        <div class="reveal" v-observe>
          <div class="section-label">Night Owl</div>
          <h2 class="section-title">
            Reading Lounge<br />
            <span style="font-size:0.65em;color:var(--muted);font-weight:300">9:30 PM — Every Night</span>
          </h2>
        </div>
        <div class="reading-grid">
          <div class="reading-card" v-observe>
            <span class="reading-icon">📘</span>
            <h3>English Room</h3>
            <p>Tonight's genre: <em>Fiction</em>. Join fellow readers for a quiet, focused session.</p>
            <a href="#" class="join-btn" @click.prevent>Join Room</a>
          </div>
          <div class="reading-card" v-observe>
            <span class="reading-icon">📙</span>
            <h3>Hindi Room</h3>
            <p>Tonight's genre: <em>Sahitya</em>. Explore Hindi literature with like-minded readers.</p>
            <a href="#" class="join-btn" @click.prevent>Join Room</a>
          </div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <!-- LEADERBOARD -->
    <section id="leaderboard">
      <div class="container">
        <div class="reveal" v-observe>
          <div class="section-label">Recognition</div>
          <h2 class="section-title">Top Performers</h2>
        </div>
        <ul class="leaderboard-list">
          <template v-for="(member, index) in leaderboard" :key="member.roll">
            <li class="leaderboard-item" v-observe :style="{ transitionDelay: `${index * 0.08}s` }">
              <div class="lb-rank" :class="getMedalClass(index)">{{ index + 1 }}</div>
              <div class="lb-info">
                <div class="lb-name">{{ member.name }}</div>
                <div class="lb-roll">{{ member.roll }}</div>
              </div>
              <div>
                <div class="lb-pts">{{ member.pts }}</div>
                <div class="lb-pts-lbl">points</div>
              </div>
            </li>
            <div class="lb-divider" v-if="index < leaderboard.length - 1"></div>
          </template>
        </ul>
      </div>
    </section>

    <!-- FOOTER -->
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import membersData from "../../sundarbans/members.json";
import MembersNavbar from "../components/MembersNavbar.vue";

const router = useRouter();

// memberInitial is now handled inside MembersNavbar; keep memberEmail for passing as prop

// --- STATE ---
const pageLoading = ref(true);
const memberEmail = ref("");
const memberRoll = ref("");
const countdownText = ref("—");
let countdownInterval = null;

const memberCountText = computed(() => {
  const count = membersData?.members?.length || 0;
  return count >= 1000 ? Math.floor(count / 100) / 10 + "K+" : count + "+";
});

// --- DATA ---
const today = new Date().getDay();
const events = ref([
  { day: 1, icon: "🧠", title: "Monday — Technical", desc: "Advanced DSA, system design, and competitive programming sessions with live mentors.", isToday: today === 1 },
  { day: 2, icon: "❓", title: "Tuesday — Doubt Session", desc: "Live mentor Q&A. Bring your questions, leave with clarity. No question is too small.", isToday: today === 2 },
  { day: 4, icon: "🎭", title: "Thursday — Cultural", desc: "Debate nights, open mic, talent showcase. Express yourself with your Sundarbans family.", isToday: today === 4 },
  { day: 5, icon: "🏏", title: "Friday — Sports", desc: "House matches, fitness challenges, and friendly competitions. Stay active, stay sharp.", isToday: today === 5 },
  { day: 0, icon: "🎤", title: "Sunday — Talk with Senior", desc: "Career guidance, strategy sessions, and real stories from seniors who've been there.", isToday: today === 0 },
]);

const leaderboard = [
  { name: 'Aditi Sharma',  roll: '23f1000052@ds.study.iitm.ac.in', pts: 120 },
  { name: 'Rohan Verma',   roll: '22f1000119@ds.study.iitm.ac.in', pts: 110 },
  { name: 'Mehak Singh',   roll: '24f1000093@ds.study.iitm.ac.in', pts: 102 },
  { name: 'Dev Patel',     roll: '23f2000114@ds.study.iitm.ac.in', pts: 98 },
  { name: 'Priya Nair',    roll: '24f2000050@ds.study.iitm.ac.in', pts: 91 },
];

function getMedalClass(index) {
  if (index === 0) return "gold";
  if (index === 1) return "silver";
  if (index === 2) return "bronze";
  return "";
}

// --- LOGIC ---
function updateCountdown() {
  const now = new Date();
  const target = new Date();
  target.setHours(21, 30, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = target - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  countdownText.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}


function leaveLounge() {
  document.querySelector('.members-lounge-page').style.opacity = '0';
  document.querySelector('.members-lounge-page').style.transition = 'opacity 0.4s';
  setTimeout(() => {
    router.push("/");
  }, 400);
}

function logout() {
  // Add a mild delay for aesthetics before routing out
  document.querySelector('.members-lounge-page').style.opacity = '0';
  document.querySelector('.members-lounge-page').style.transition = 'opacity 0.5s';
  setTimeout(() => {
    localStorage.removeItem("sundarbans_auth_token");
    router.push("/members");
  }, 500);
}

// Custom directive for intersection observer (scroll reveal)
const vObserve = {
  mounted(el) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    observer.observe(el);
  }
};

onMounted(() => {
  const token = localStorage.getItem("sundarbans_auth_token");
  if (!token) {
    router.push("/members");
    return;
  }
  
  memberEmail.value = token;
  memberRoll.value = token.split("@")[0] || token;

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);

  setTimeout(() => {
    pageLoading.value = false;
  }, 1400);

  // Quick fade in 
  const page = document.querySelector('.members-lounge-page');
  if (page) {
    page.style.opacity = '0';
    page.style.transition = 'opacity 0.6s';
    setTimeout(() => { page.style.opacity = '1'; }, 100);
  }
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.members-lounge-page {
  /* Scope CSS Custom Properties to this view */
  --black: #060808;
  --deep: #0a0f0a;
  --forest: #131d13;
  --panel: rgba(15,22,15,0.85);
  --border: rgba(201,168,76,0.15);
  --border-soft: rgba(255,255,255,0.07);
  --gold: #c9a84c;
  --gold-light: #e8c97a;
  --gold-dim: rgba(201,168,76,0.12);
  --cream: #f5f0e8;
  --muted: rgba(245,240,232,0.5);
  --subtle: rgba(245,240,232,0.12);
  --green-glow: rgba(45,100,45,0.25);

  background: var(--black);
  color: var(--cream);
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  /* Prevent horizontal scroll issues */
  position: relative;
  width: 100%;
}

/* ── PAGE TRANSITION ── */
#page-loader {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--black);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 24px;
}
.fade-slow-leave-active { transition: opacity 0.8s ease, visibility 0.8s ease; }
.fade-slow-leave-to { opacity: 0; visibility: hidden; }

.loader-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 42px;
  font-weight: 300;
  color: var(--gold);
  animation: pulse-glow 1.5s ease-in-out infinite;
}
.loader-bar {
  width: 180px; height: 1px;
  background: var(--border-soft);
  position: relative; overflow: hidden;
}
.loader-fill {
  position: absolute; inset-y: 0; left: 0;
  width: 0; height: 100%;
  background: var(--gold);
  animation: load-fill 1.2s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes load-fill { to { width: 100%; } }
@keyframes pulse-glow {
  0%,100% { text-shadow: 0 0 20px rgba(201,168,76,0.3); }
  50% { text-shadow: 0 0 40px rgba(201,168,76,0.7); }
}

/* ── GRAIN ── */
.grain {
  position: fixed; inset: -200%; width: 400%; height: 400%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.035; pointer-events: none; z-index: 1;
  animation: grain-drift 8s steps(10) infinite;
}
@keyframes grain-drift {
  0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(-5%,2%)} 30%{transform:translate(3%,-4%)} 40%{transform:translate(-4%,5%)} 50%{transform:translate(-1%,-2%)} 60%{transform:translate(4%,3%)} 70%{transform:translate(3%,1%)} 80%{transform:translate(-3%,4%)} 90%{transform:translate(2%,-3%)}
}

/* Navbar styles live in MembersNavbar.vue */

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 70vh;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  padding: 100px 60px;
}
.hero-orb {
  position: absolute; border-radius: 50%; pointer-events: none; filter: blur(100px);
}
.hero-orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(45,90,45,0.3), transparent 70%);
  top: -200px; left: -150px;
  animation: orb-drift 14s ease-in-out infinite;
}
.hero-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(201,168,76,0.12), transparent 70%);
  bottom: -100px; right: -100px;
  animation: orb-drift 10s ease-in-out infinite 3s;
}
@keyframes orb-drift {
  0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-30px,20px) scale(1.08)} 66%{transform:translate(20px,-15px) scale(0.95)}
}

.hero-content {
  position: relative; z-index: 2;
  text-align: center; max-width: 800px;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 20px;
  background: var(--gold-dim); border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 36px;
  animation: hero-reveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 8px #4caf50;
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.hero-greeting {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 300;
  font-size: clamp(42px, 6vw, 80px);
  line-height: 1.08;
  color: var(--cream);
  animation: hero-reveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s both;
  margin: 0;
}
.hero-greeting em {
  font-style: italic;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  margin-top: 20px;
  font-size: 16px; font-weight: 300;
  color: var(--muted); letter-spacing: 0.03em;
  animation: hero-reveal 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both;
}

.hero-stats {
  display: flex; align-items: center; justify-content: center;
  gap: 48px; margin-top: 56px;
  animation: hero-reveal 1s cubic-bezier(0.16,1,0.3,1) 0.65s both;
}
.stat { text-align: center; }
.stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px; font-weight: 300;
  color: var(--gold-light); line-height: 1;
}
.stat-lbl {
  font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--muted);
  margin-top: 6px;
}
.stat-sep {
  width: 1px; height: 50px;
  background: linear-gradient(to bottom, transparent, var(--border), transparent);
}

@keyframes hero-reveal {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── SECTIONS ── */
.container { max-width: 1300px; margin: 0 auto; padding: 0 60px; }
section { padding: 100px 0; }
.section-label {
  font-size: 10px; letter-spacing: 0.35em;
  text-transform: uppercase; color: var(--gold);
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 16px;
}
.section-label::before {
  content: ''; display: block;
  width: 32px; height: 1px; background: var(--gold);
}
.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 300; line-height: 1.1;
  margin-bottom: 56px;
}

/* ── DIVIDER ── */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border), transparent);
  margin: 0 60px;
}

/* ── EVENT CARDS ── */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.event-card {
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.35s, transform 0.35s, box-shadow 0.35s;
  backdrop-filter: blur(12px);
  opacity: 0;
  transform: translateY(30px);
}
.event-card.visible {
  opacity: 1; transform: translateY(0);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s;
}
.event-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--gold-dim), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.event-card:hover { border-color: var(--border); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
.event-card:hover::before { opacity: 1; }
.event-card.today-event {
  border-color: rgba(201,168,76,0.4);
  box-shadow: 0 0 0 1px rgba(201,168,76,0.15), 0 0 40px rgba(201,168,76,0.08);
}
.today-tag {
  position: absolute; top: 16px; right: 16px;
  padding: 4px 12px;
  background: var(--gold);
  color: var(--black);
  border-radius: 100px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.15em; text-transform: uppercase;
}
.event-icon {
  font-size: 36px; margin-bottom: 20px;
  display: block;
}
.event-card h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-weight: 400;
  margin-bottom: 8px; line-height: 1.2;
}
.event-card p {
  font-size: 13px; color: var(--muted);
  line-height: 1.6; margin-bottom: 28px;
}
.join-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--gold);
  cursor: pointer;
  transition: all 0.25s;
  text-decoration: none;
}
.join-btn:hover {
  background: var(--gold);
  color: var(--black);
  border-color: var(--gold);
}
.join-btn svg { width: 14px; height: 14px; }

/* ── NIGHT OWL ── */
.night-section { background: linear-gradient(180deg, transparent, rgba(20,30,20,0.5), transparent); }
.reading-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.reading-card {
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s, box-shadow 0.3s;
  opacity: 0; transform: translateY(30px);
}
.reading-card.visible {
  opacity: 1; transform: translateY(0);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.3s;
}
.reading-card:hover { border-color: var(--border); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.reading-card::after {
  content: '9:30 PM';
  position: absolute; top: 24px; right: 24px;
  font-size: 11px; letter-spacing: 0.1em;
  color: var(--muted);
}
.reading-icon { font-size: 48px; margin-bottom: 24px; display: block; }
.reading-card h3 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 300;
  margin-bottom: 8px;
}
.reading-card p { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

/* ── LEADERBOARD ── */
.leaderboard-list { list-style: none; padding: 0; margin: 0; }
.leaderboard-item {
  display: flex; align-items: center; gap: 20px;
  padding: 20px 28px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s;
  opacity: 0; transform: translateX(-20px);
}
.leaderboard-item.visible {
  opacity: 1; transform: translateX(0);
  transition: opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1), background 0.2s;
}
.leaderboard-item:hover { background: var(--gold-dim); border-color: var(--border); }
.lb-rank {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 300;
  color: var(--muted);
  min-width: 40px;
}
.lb-rank.gold { color: var(--gold); }
.lb-rank.silver { color: #a8b8c8; }
.lb-rank.bronze { color: #c8a070; }
.lb-info { flex: 1; }
.lb-name { font-size: 16px; font-weight: 500; margin-bottom: 2px; }
.lb-roll { font-size: 12px; color: var(--muted); }
.lb-pts {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 300;
  color: var(--gold-light);
}
.lb-pts-lbl { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); text-align: right; }
.lb-divider { height: 1px; background: var(--border-soft); margin: 4px 0; }

/* ── FOOTER ── */
.footer {
  border-top: 1px solid var(--border-soft);
  padding: 48px 60px;
}
.footer-inner {
  max-width: 1300px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
}
.footer-brand {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; font-weight: 300;
  color: var(--gold);
}
.footer-copy { font-size: 12px; color: var(--muted); letter-spacing: 0.05em; }

/* ── SCROLL REVEAL ── */
.reveal { opacity: 0; transform: translateY(24px); transition: none; }
.reveal.visible {
  opacity: 1; transform: translateY(0);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .navbar { padding: 0 24px; }
  .container { padding: 0 24px; }
  .hero { padding: 80px 24px; }
  section { padding: 70px 0; }
  .divider { margin: 0 24px; }
  .footer { padding: 40px 24px; }
  .hero-stats { gap: 28px; }
  .reading-grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .member-id { display: none; }
}
</style>
