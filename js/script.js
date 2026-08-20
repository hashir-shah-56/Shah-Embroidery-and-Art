/**
 * Shah Embroidery & Art - Main Interactive Logic
 * Syeda Tauseefa Abrar (16 Years Craftsmanship)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar & Scroll Effects
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation Toggle
  const hamburger = document.getElementById('hamburgerToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeDrawer = () => {
      mobileDrawer.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeDrawer));
  }

  // 3. Search Modal Trigger
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchInput) searchInput.focus();
    });

    if (searchClose) {
      searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 4. Custom Order Modal
  const customOrderBtns = document.querySelectorAll('.trigger-custom-modal');
  const customModal = document.getElementById('customOrderModal');
  const customModalClose = document.getElementById('customModalClose');
  const customForm = document.getElementById('customOrderForm');
  const customFeedback = document.getElementById('customFormFeedback');

  customOrderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (customModal) {
        customModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (customModalClose && customModal) {
    customModalClose.addEventListener('click', () => {
      customModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    customModal.addEventListener('click', (e) => {
      if (e.target === customModal) {
        customModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (customFeedback) {
        customFeedback.style.display = 'block';
        customFeedback.innerHTML = `
          <div style="background-color: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 14px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; text-align: center;">
            ✨ Thank you! Your custom order request has been received. Syeda Tauseefa Abrar will personally get back to you shortly.
          </div>
        `;
        customForm.reset();
        setTimeout(() => {
          if (customModal) customModal.classList.remove('active');
          document.body.style.overflow = '';
          customFeedback.style.display = 'none';
        }, 3500);
      }
    });
  }

  // 5. Artwork Quick View Modal
  const quickViewBtns = document.querySelectorAll('.trigger-quick-view');
  const quickViewModal = document.getElementById('quickViewModal');
  const quickViewClose = document.getElementById('quickViewClose');
  const modalImg = document.getElementById('quickViewImg');
  const modalTitle = document.getElementById('quickViewTitle');
  const modalCategory = document.getElementById('quickViewCategory');
  const modalPrice = document.getElementById('quickViewPrice');

  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.artwork-card');
      if (card && quickViewModal) {
        const title = card.getAttribute('data-title') || 'Handcrafted Artwork';
        const category = card.getAttribute('data-category') || 'Hand Embroidery';
        const price = card.getAttribute('data-price') || 'Custom Quote';
        const imgSrc = card.querySelector('.artwork-img')?.src || '';

        if (modalTitle) modalTitle.textContent = title;
        if (modalCategory) modalCategory.textContent = category;
        if (modalPrice) modalPrice.textContent = price;
        if (modalImg) modalImg.src = imgSrc;

        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (quickViewClose && quickViewModal) {
    quickViewClose.addEventListener('click', () => {
      quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. Gallery Category Filtering
  const tabBtns = document.querySelectorAll('.tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });

  // 7. Contact Form Simulation
  const contactForm = document.getElementById('mainContactForm');
  const contactFeedback = document.getElementById('contactFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (contactFeedback) {
        contactFeedback.style.display = 'block';
        contactFeedback.innerHTML = `
          <div style="background-color: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 14px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: 15px;">
            Thank you for reaching out to Shah Embroidery & Art! We will respond within 24 hours.
          </div>
        `;
        contactForm.reset();
        setTimeout(() => {
          contactFeedback.style.display = 'none';
        }, 4000);
      }
    });
  }

  // 8. Active Nav Link Scroll Highlight
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  });

  // 9. Scroll Reveal Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.artwork-card, .feature-card, .category-card, .banner-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver.observe(el);
  });
});
