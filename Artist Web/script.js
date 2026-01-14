// ---------- Small utilities ----------
const qs = (s, el = document) => el.querySelector(s)
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s))

// ---------------- Optimization Utilities ----------------
function debounce(func, wait = 10, immediate = true) {
  let timeout
  return function () {
    const context = this, args = arguments
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

// Nav mobile toggle (robust for mobile tap)
const menuBtn = qs('#menuBtn')
const navMenu = qs('nav ul')
let justToggled = false

if (menuBtn && navMenu) {
  // Reflect state in aria-expanded
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    navMenu.classList.toggle('show')
    const isOpen = navMenu.classList.contains('show')
    menuBtn.textContent = isOpen ? '✕' : '☰'
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    // Prevent immediate outside-click from closing on iOS
    justToggled = true
    setTimeout(() => justToggled = false, 120)
  })

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (justToggled) return
    if (window.innerWidth <= 900) {
      if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        navMenu.classList.remove('show')
        menuBtn.textContent = '☰'
        menuBtn.setAttribute('aria-expanded', 'false')
      }
    }
  }, { passive: true })
}

// Close mobile nav on link click
qsa('nav ul li a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      const nav = qs('nav ul')
      if (nav) {
        nav.classList.remove('show')
        if (menuBtn) menuBtn.textContent = '☰'
      }
    }
  })
})

// Year
qs('#year').textContent = new Date().getFullYear()

// Gallery filter
const filters = qsa('.filter-btn')
const cards = qsa('#galleryGrid .card')

filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  const f = btn.getAttribute('data-filter')
  cards.forEach(c => {
    const cat = c.getAttribute('data-cat')
    c.style.display = (f === 'all' || cat === f) ? '' : 'none'
  })
}))

// Lightbox for multiple images
const lightbox = qs('#lightbox')
const lightboxImg = qs('#lightboxImage')
const prevBtn = qs('#prevBtn')
const nextBtn = qs('#nextBtn')
const closeLight = qs('#closeLight')

let currentImages = []
let currentIndex = 0

function setupLightbox() {
  qsa('#galleryGrid .card').forEach(card => {
    card.addEventListener('click', () => {
      const imagesAttr = card.getAttribute('data-images')
      currentImages = imagesAttr ? imagesAttr.split(',').map(s => s.trim()) : [card.querySelector('img').src]
      currentIndex = 0
      lightboxImg.src = currentImages[currentIndex]
      lightbox.classList.add('open')
      document.body.style.overflow = 'hidden'
    })
  })
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentImages.length > 1) {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length
      lightboxImg.src = currentImages[currentIndex]
    }
  })
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentImages.length > 1) {
      currentIndex = (currentIndex + 1) % currentImages.length
      lightboxImg.src = currentImages[currentIndex]
    }
  })
}

function closeLightbox() {
  lightbox.classList.remove('open')
  document.body.style.overflow = ''
}

if (closeLight) closeLight.addEventListener('click', closeLightbox)
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox() })

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight' && currentImages.length > 1) {
    currentIndex = (currentIndex + 1) % currentImages.length
    lightboxImg.src = currentImages[currentIndex]
  }
  if (e.key === 'ArrowLeft' && currentImages.length > 1) {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length
    lightboxImg.src = currentImages[currentIndex]
  }
})

// Initialize lightbox
setupLightbox()

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  })
}, observerOptions)

qsa('.scroll-reveal').forEach(el => {
  observer.observe(el)
})

// ---------------- Contact Form via Formspree ----------------
const form = qs('#contactForm')
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = form.querySelector('button[type=submit]')
    const originalText = submitBtn.textContent
    submitBtn.textContent = 'Sending...'
    submitBtn.disabled = true

    const formData = new FormData(form)

    try {
      const response = await fetch('https://formspree.io/f/myznenjk', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })

      const msgEl = qs('#formMsg')
      if (response.ok) {
        msgEl.textContent = '🎉 Message sent successfully! We\'ll reply soon.'
        msgEl.style.color = 'green'
        msgEl.style.display = 'block'
        form.reset()

        // Trigger confetti explosion
        createConfetti()

        setTimeout(() => msgEl.style.display = 'none', 4000)
      } else {
        const data = await response.json().catch(() => ({}))
        msgEl.textContent = data.error || 'Oops! There was a problem.'
        msgEl.style.color = 'red'
        msgEl.style.display = 'block'
      }
    } catch (err) {
      const msgEl = qs('#formMsg')
      msgEl.textContent = 'Network error. Please try again later.'
      msgEl.style.color = 'red'
      msgEl.style.display = 'block'
    } finally {
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    }
  })
}

// ---------------- Dark Mode Toggle ----------------
const themeToggle = qs('#themeToggle')
const htmlEl = document.documentElement

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light'
htmlEl.setAttribute('data-theme', currentTheme)

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const theme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    htmlEl.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  })
}

// ---------------- Scroll Progress Indicator ----------------
const scrollProgress = qs('#scrollProgress')

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  const scrolled = (window.pageYOffset / windowHeight) * 100
  if (scrollProgress) {
    scrollProgress.style.width = scrolled + '%'
  }
}, { passive: true })

// ---------------- Scroll to Top Button ----------------
const scrollTopBtn = qs('#scrollTop')

window.addEventListener('scroll', debounce(() => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.classList.add('visible')
  } else {
    scrollTopBtn.classList.remove('visible')
  }
}, 20), { passive: true })

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// ---------------- Animated Counters ----------------
const statNumbers = qsa('.stat-number')
let hasAnimated = false

function animateCounters() {
  if (hasAnimated) return

  const statsSection = qs('.stats-section')
  if (!statsSection) return

  const rect = statsSection.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const isVisible = rect.top < windowHeight * 0.95 && rect.bottom >= 0

  if (isVisible) {
    hasAnimated = true
    console.log('Stats animation triggered!')

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'))
      if (!target || isNaN(target)) return

      const duration = 2000
      const increment = target / (duration / 16)
      let current = 0

      const updateCounter = () => {
        current += increment
        if (current < target) {
          stat.textContent = Math.floor(current)
          requestAnimationFrame(updateCounter)
        } else {
          stat.textContent = target
        }
      }

      updateCounter()
    })
  }
}

// Use Intersection Observer for better detection
if ('IntersectionObserver' in window) {
  const statsSection = qs('.stats-section')
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          animateCounters()
        }
      })
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -10% 0px'
    })
    observer.observe(statsSection)
  }
}

// Fallback for older browsers
window.addEventListener('scroll', debounce(animateCounters, 50), { passive: true })
window.addEventListener('resize', debounce(animateCounters, 100), { passive: true })

// Check on load with multiple attempts
document.addEventListener('DOMContentLoaded', () => {
  animateCounters()
  setTimeout(animateCounters, 100)
  setTimeout(animateCounters, 300)
  setTimeout(animateCounters, 500)
  setTimeout(animateCounters, 1000)
  setTimeout(animateCounters, 2000)
})

// ---------------- Loading Screen ----------------
window.addEventListener('load', () => {
  const loadingScreen = qs('.loading-screen')
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden')
    }, 800)
  }
})

// ---------------- FAQ Accordion ----------------
const faqItems = qsa('.faq-item')
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question')
  if (question) {
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active')

      // Close all other FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active')
        }
      })

      // Toggle current item
      if (isActive) {
        item.classList.remove('active')
      } else {
        item.classList.add('active')
      }
    })
  }
})

// ---------------- Testimonials Carousel ----------------
const testimonialsGrid = qs('#testimonialsGrid')
const testimonials = qsa('.testimonial')
const testimonialNav = qs('#testimonialNav')

if (testimonialsGrid && testimonials.length > 0) {
  let currentIndex = 0
  const totalTestimonials = testimonials.length
  let autoSlideInterval

  // Create navigation dots
  testimonials.forEach((_, index) => {
    const dot = document.createElement('button')
    dot.classList.add('testimonial-dot')
    dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`)
    if (index === 0) dot.classList.add('active')
    dot.addEventListener('click', () => goToSlide(index))
    testimonialNav.appendChild(dot)
  })

  const dots = qsa('.testimonial-dot')

  function updateSlide() {
    // Calculate testimonial width including gap
    const testimonialWidth = testimonials[0].offsetWidth + 30 // width + gap
    const wrapperWidth = testimonialsGrid.parentElement.offsetWidth

    // Center the active testimonial
    const centerOffset = (wrapperWidth / 2) - (testimonials[0].offsetWidth / 2)
    const offset = centerOffset - (currentIndex * testimonialWidth)

    testimonialsGrid.style.transform = `translateX(${offset}px)`

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex)
    })

    // Add fade and active effects
    testimonials.forEach((testimonial, index) => {
      testimonial.classList.remove('active', 'fade-out')

      if (index === currentIndex) {
        testimonial.classList.add('active')
      } else {
        testimonial.classList.add('fade-out')
      }
    })
  }

  function goToSlide(index) {
    currentIndex = index
    updateSlide()
    resetAutoSlide()
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalTestimonials
    updateSlide()
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000) // Slide every 4 seconds
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval)
    startAutoSlide()
  }

  // Initialize
  updateSlide()
  startAutoSlide()

  // Pause on hover
  testimonialsGrid.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval)
  })

  testimonialsGrid.addEventListener('mouseleave', () => {
    startAutoSlide()
  })

  // Update on window resize
  window.addEventListener('resize', updateSlide)
}

// Initialize counters check
setTimeout(animateCounters, 100)

// ---------------- Cursor Particle Trail ----------------
let lastParticleTime = 0
const particleDelay = 50 // milliseconds between particles

document.addEventListener('mousemove', (e) => {
  const now = Date.now()
  if (now - lastParticleTime < particleDelay) return
  lastParticleTime = now

  const particle = document.createElement('div')
  particle.classList.add('cursor-particle')
  particle.style.left = e.clientX + 'px'
  particle.style.top = e.clientY + 'px'

  // Random colors from theme
  const colors = ['var(--accent)', 'var(--accent-secondary)', 'var(--accent-gold)']
  particle.style.background = colors[Math.floor(Math.random() * colors.length)]

  document.body.appendChild(particle)

  setTimeout(() => {
    particle.remove()
  }, 1000)
})

// ---------------- Scroll Reveal Animations ----------------
const revealElements = qsa('.reveal, .reveal-left, .reveal-right')

function checkReveal() {
  revealElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top
    const elementBottom = element.getBoundingClientRect().bottom
    const windowHeight = window.innerHeight

    if (elementTop < windowHeight * 0.85 && elementBottom > 0) {
      element.classList.add('active')
    }
  })
}

window.addEventListener('scroll', debounce(checkReveal, 15), { passive: true })
checkReveal() // Check on load

// ---------------- Parallax Effect ----------------
const parallaxShapes = qsa('.parallax-shape')

document.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX / window.innerWidth
  const mouseY = e.clientY / window.innerHeight

  parallaxShapes.forEach((shape, index) => {
    const speed = (index + 1) * 20
    const x = (mouseX - 0.5) * speed
    const y = (mouseY - 0.5) * speed
    shape.style.transform = `translate(${x}px, ${y}px)`
  })
})

// Parallax on scroll
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset
  parallaxShapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.3
    shape.style.transform = `translateY(${scrolled * speed}px)`
  })
})

// ---------------- Floating Art Particles ----------------
const particleBg = qs('#particleBg')
if (particleBg) {
  const particles = ['🎨', '✨', '🖌️', '🖍️', '⭐', '🌟', '🌈', '💜']
  const particleCount = 15

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.classList.add('art-particle')
    particle.textContent = particles[Math.floor(Math.random() * particles.length)]
    particle.style.left = Math.random() * 100 + '%'
    particle.style.top = Math.random() * 100 + '%'
    particle.style.animationDelay = Math.random() * 20 + 's'
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's'
    particleBg.appendChild(particle)
  }
}

// ---------------- Signature Animation on Scroll ----------------
const signatureImg = qs('#signatureImg')
const signatureSection = qs('#signatureSection')
let signatureAnimated = false

function checkSignature() {
  if (signatureAnimated || !signatureSection || !signatureImg) return

  const rect = signatureSection.getBoundingClientRect()
  const isVisible = rect.top < window.innerHeight * 0.75 && rect.bottom >= 0

  if (isVisible) {
    signatureAnimated = true
    signatureImg.classList.add('visible')
    console.log('Signature animation triggered!')
  }
}

window.addEventListener('scroll', debounce(checkSignature, 50), { passive: true })
// Check immediately and after a short delay
setTimeout(checkSignature, 100)
setTimeout(checkSignature, 500)

// ---------------- Confetti Explosion ----------------
function createConfetti() {
  const colors = ['#b78bff', '#ff8bd5', '#ffb86b', '#c9a0ff', '#ff9ed5']
  const confettiCount = 100

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div')
      confetti.classList.add('confetti')

      // Random properties
      confetti.style.left = Math.random() * 100 + 'vw'
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.width = (Math.random() * 10 + 5) + 'px'
      confetti.style.height = (Math.random() * 10 + 5) + 'px'
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0'
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's'
      confetti.style.animationDelay = (Math.random() * 0.5) + 's'

      document.body.appendChild(confetti)

      // Remove after animation
      setTimeout(() => {
        confetti.remove()
      }, 4000)
    }, i * 10)
  }
}
