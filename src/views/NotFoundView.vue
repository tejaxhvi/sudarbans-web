<template>
  <section class="notfound-section">
    <div class="notfound-glow notfound-glow-1"></div>
    <div class="notfound-glow notfound-glow-2"></div>

    <div class="notfound-content">
      <div class="notfound-badge animate-in" style="--delay: 0.1s">
        <span class="badge-dot"></span>
        Page Not Found
      </div>

      <h1 class="notfound-code animate-in" style="--delay: 0.3s">404</h1>

      <h2 class="notfound-title animate-in" style="--delay: 0.5s">
        Lost in the <span class="tg">Sundarbans</span>?
      </h2>

      <p class="notfound-desc animate-in" style="--delay: 0.7s">
        The page you're looking for doesn't exist or has been moved.<br />
        Let's get you back on track.
      </p>

      <div class="notfound-actions animate-in" style="--delay: 0.9s">
        <router-link to="/" class="btn-hero-primary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Back to Home</span>
        </router-link>

        <router-link to="/contact" class="btn-hero-secondary">
          <span>Contact Us</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div class="notfound-links animate-in" style="--delay: 1.1s">
        <span class="notfound-links-label">Popular pages:</span>
        <router-link to="/study">Study Corner</router-link>
        <router-link to="/events">Events</router-link>
        <router-link to="/community">Community</router-link>
        <router-link to="/meetups">Meetups</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.notfound-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 2rem 4rem;
  overflow: hidden;
}

/* Ambient glow blobs */
.notfound-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(120px);
  opacity: 0.3;
}

.notfound-glow-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(212, 160, 23, 0.35), transparent 70%);
  top: -10%;
  left: -10%;
  animation: glow-drift 8s ease-in-out infinite alternate;
}

.notfound-glow-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(240, 192, 64, 0.25), transparent 70%);
  bottom: -10%;
  right: -10%;
  animation: glow-drift 8s ease-in-out infinite alternate-reverse;
}

@keyframes glow-drift {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, -30px) scale(1.15); }
}

.notfound-content {
  position: relative;
  z-index: 2;
  max-width: 680px;
}

/* Badge */
.notfound-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(212, 160, 23, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 160, 23, 0.2);
  color: var(--accent);
  padding: 0.45rem 1.1rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

/* Giant 404 */
.notfound-code {
  font-family: "Cinzel", serif;
  font-weight: 900;
  font-size: clamp(7rem, 18vw, 14rem);
  line-height: 1;
  letter-spacing: 0.04em;
  background: linear-gradient(
    135deg,
    var(--gold-light) 0%,
    var(--accent) 40%,
    var(--gold-dark) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 60px rgba(212, 160, 23, 0.25));
  animation: num-pulse 4s ease-in-out infinite;
}

@keyframes num-pulse {
  0%, 100% { filter: drop-shadow(0 0 40px rgba(212, 160, 23, 0.2)); }
  50% { filter: drop-shadow(0 0 80px rgba(212, 160, 23, 0.4)); }
}

/* Subtitle */
.notfound-title {
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  color: var(--text);
  margin-bottom: 1.25rem;
  line-height: 1.3;
}

.notfound-title .tg {
  background: linear-gradient(135deg, var(--gold-light), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Description */
.notfound-desc {
  font-size: 1.05rem;
  color: var(--text2);
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

/* Actions */
.notfound-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

/* Quick links */
.notfound-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.notfound-links-label {
  font-size: 0.82rem;
  color: var(--text3);
  margin-right: 0.25rem;
}

.notfound-links a {
  color: var(--text2);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.25s ease;
}

.notfound-links a:hover {
  color: var(--accent);
  border-color: rgba(212, 160, 23, 0.4);
  background: var(--surface);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .notfound-section {
    padding: 100px 1.25rem 3rem;
  }

  .notfound-code {
    font-size: 6rem;
  }

  .notfound-desc br {
    display: none;
  }
}
</style>
