import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.rs, .rc').forEach(el => observer.observe(el))
  })

  onUnmounted(() => { if (observer) observer.disconnect() })
}

export function useCounters() {
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-count]').forEach(el => {
            const t = parseInt(el.getAttribute('data-count'))
            let c = 0
            const step = t / (2000 / 16)
            const timer = setInterval(() => {
              c = Math.min(c + step, t)
              el.textContent = Math.floor(c).toLocaleString()
              if (c >= t) { el.textContent = t.toLocaleString() + '+'; clearInterval(timer) }
            }, 16)
          })
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.5 })

    document.querySelectorAll('.hero-stats, .stats-row, .stats-band').forEach(el => observer.observe(el))
  })

  onUnmounted(() => { if (observer) observer.disconnect() })
}

export function useCountdown(targetDate, elementId) {
  let timer = null

  function update() {
    const el = document.getElementById(elementId)
    if (!el) return
    const now = new Date()
    const diff = targetDate - now
    if (diff <= 0) { el.innerHTML = '<span class="cd-over">Event Started!</span>'; return }
    const d = Math.floor(diff / 86400000)
    const h = Math.floor((diff % 86400000) / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    el.innerHTML = `
      <div class="cd-unit"><span class="cd-num">${String(d).padStart(2,'0')}</span><span class="cd-label">days</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(h).padStart(2,'0')}</span><span class="cd-label">hrs</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(m).padStart(2,'0')}</span><span class="cd-label">min</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num">${String(s).padStart(2,'0')}</span><span class="cd-label">sec</span></div>`
  }

  onMounted(() => { update(); timer = setInterval(update, 1000) })
  onUnmounted(() => clearInterval(timer))
}
