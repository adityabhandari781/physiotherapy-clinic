/* ============================================
   PhysioCare — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== NAVBAR SCROLL EFFECT ==========
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.navbar-links a:not(.navbar-cta)');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll();

  // ========== ACTIVE SECTION HIGHLIGHTING ==========
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveSection() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveSection);

  // ========== SMOOTH SCROLL FOR NAV LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        document.getElementById('navLinks').classList.remove('open');
        document.getElementById('hamburger').classList.remove('active');
      }
    });
  });

  // ========== MOBILE HAMBURGER MENU ==========
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('open');
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinksContainer.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('open');
    }
  });

  // ========== SCROLL-TRIGGERED ANIMATIONS ==========
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animationObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => animationObserver.observe(el));

  // ========== FLATPICKR DATE PICKER ==========
  if (typeof flatpickr !== 'undefined') {
    flatpickr('#appointmentDate', {
      minDate: 'today',
      maxDate: new Date().fp_incr(90),
      dateFormat: 'F j, Y',
      disableMobile: true,
      disable: [
        function(date) {
          // Disable Sundays
          return date.getDay() === 0;
        }
      ],
      theme: 'dark',
      animate: true,
    });
  }

  // ========== BOOKING FORM VALIDATION & SUBMISSION ==========
  const bookingForm = document.getElementById('bookingForm');
  const confirmModal = document.getElementById('confirmModal');
  const closeModal = document.getElementById('closeModal');

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    let isValid = true;
    const requiredFields = ['fullName', 'email', 'phone', 'doctor', 'appointmentDate', 'appointmentTime', 'service'];

    requiredFields.forEach(field => {
      const input = document.getElementById(field);
      if (!data[field] || data[field].trim() === '') {
        input.style.borderColor = '#EF4444';
        isValid = false;
      } else {
        input.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInput = document.getElementById('email');
    if (!emailRegex.test(data.email)) {
      emailInput.style.borderColor = '#EF4444';
      isValid = false;
    }

    if (isValid) {
      // Show confirmation modal
      confirmModal.classList.add('active');

      // Reset form
      bookingForm.reset();

      const data_ = new URLSearchParams(data);

      fetch("https://script.google.com/macros/s/AKfycbwEA7GlK7f63EVYlMtqvItM0ZrjE30UodFDWfDXmzU2imFg-0cuWy3ARUAKzotFZofWrQ/exec", {
        method: "POST",
        // body: JSON.stringify(data),
        body: data_,
        // headers: {
        //   "Content-Type": "application/json"
        // }
      })
      .then(res => res.json())
      .then(data => console.log("Success:", data));
    }
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      confirmModal.classList.remove('active');
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
      confirmModal.classList.remove('active');
    }
  });

  // ========== TESTIMONIALS CAROUSEL ==========
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentSlide = 0;
  const totalSlides = dots.length;
  let autoPlayInterval;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % totalSlides);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetAutoPlay();
    });
  });

  // Auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  startAutoPlay();

  // Pause on hover
  const slider = document.getElementById('testimonialSlider');
  slider.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  slider.addEventListener('mouseleave', startAutoPlay);

  // Touch/swipe support for carousel
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      resetAutoPlay();
    }
  }, { passive: true });

  // ========== NEWSLETTER FORM ==========
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    if (email) {
      newsletterForm.querySelector('button').textContent = 'Subscribed ✓';
      newsletterForm.querySelector('button').style.background = 'linear-gradient(135deg, #10B981, #34D399)';
      newsletterForm.querySelector('input').value = '';
      setTimeout(() => {
        newsletterForm.querySelector('button').textContent = 'Subscribe';
        newsletterForm.querySelector('button').style.background = '';
      }, 3000);
    }
  });

  // ========== PARALLAX EFFECT ON HERO ==========
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-bg img');
    if (hero) {
      const scrolled = window.scrollY;
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  });

  // ========== INPUT FOCUS ANIMATIONS ==========
  const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.querySelector('label').style.color = '#14B8A6';
    });
    input.addEventListener('blur', () => {
      input.parentElement.querySelector('label').style.color = '';
    });
  });

  // ========== COUNTER ANIMATION FOR STATS ==========
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateCount(el, target, suffix = '') {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.innerHTML = Math.floor(current) + `<span>${suffix}</span>`;
    }, 25);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCount(statNumbers[0], 7, '+');
        animateCount(statNumbers[1], 2000, '+');
        animateCount(statNumbers[2], 300, '+');
      }
    });
  }, { threshold: 0.5 });

  if (statNumbers.length) {
    statsObserver.observe(statNumbers[0].closest('.hero-stats'));
  }

});
