<template>
  <footer class="footer">
    <div class="footer-wave-top">
      <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#040302" />
      </svg>
    </div>
    <div class="container">
      <div class="footer-grid">
        <div class="fbrand">
          <div class="flogo">
            <img src="../assets/LOGO.JPEG" alt="Logo" class="flogo-img" />
            <div>
              <span class="fbrand-name">SUNDARBANS</span>
              <span class="fbrand-sub">IIT Madras BS</span>
            </div>
          </div>
          <p class="ftagline">Empowering minds, building futures — one student at a time.</p>
          <div class="fsocial">
            <a href="https://www.linkedin.com/company/sundarbans-iitm/" class="soc-btn" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/sundarbansiitm/" class="soc-btn" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@sundarbansiitm" class="soc-btn" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="flinks">
          <h4>Quick Links</h4>
          <router-link to="/about">About Us</router-link>
          <router-link to="/teams">Our Teams</router-link>
          <router-link to="/events">Events</router-link>
          <router-link to="/contact">Contact</router-link>
        </div>
        <div class="flinks">
          <h4>Resources</h4>
          <router-link to="/study">Study Corner</router-link>
          <router-link to="/meetups">Meetups</router-link>
          <router-link to="/community">Communities</router-link>
          <router-link to="/members">Members Lounge</router-link>
        </div>
        <div class="fnewsletter">
          <h4>Stay Updated</h4>
          <p>Get the latest news and events from Sundarbans House</p>
          <div class="nform">
            <input type="email" v-model="email" placeholder="Enter your email" class="ninput" />
            <button class="nbtn" @click="subscribe">→</button>
          </div>
          <div class="iit-badge">
            <img src="../assets/IITM-Logo.png" alt="IIT Madras" class="iit-logo" />
            <span>IIT Madras Affiliated</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Sundarbans House WebOps Team.All Rights Reserved.</p>
        <div class="fbl">
          <a href="#">Privacy</a><span>·</span><a href="#">Terms</a><span>·</span>
          <router-link to="/contact">Contact</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
function subscribe() {
  if (email.value) { alert('Thanks for subscribing!'); email.value = '' }
}
</script>
