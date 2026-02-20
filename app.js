// =============================================
// StarStore – Telegram Stars Purchase Website
// JavaScript Application Logic
// =============================================

/* ---- Sticky Mobile Buy Bar ---- */
const mobileBuyBar = document.getElementById('mobileBuyBar');
const heroSection = document.getElementById('hero');

function updateMobileBuyBar() {
  if (!mobileBuyBar || !heroSection) return;
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  if (heroBottom < 0) {
    mobileBuyBar.classList.add('visible');
  } else {
    mobileBuyBar.classList.remove('visible');
  }
}

window.addEventListener('scroll', updateMobileBuyBar, { passive: true });

/* ---- Navbar Scroll Effect ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ---- Mobile Menu ---- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.classList.add('open');
    hamburger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    hamburger.children[1].style.opacity = '0';
    hamburger.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    closeMobileMenu();
  }
});

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  hamburger.children[0].style.transform = '';
  hamburger.children[1].style.opacity = '';
  hamburger.children[2].style.transform = '';
}

/* ---- Floating Stars Background ---- */
function createStarParticles() {
  const container = document.getElementById('starsBg');
  if (!container) return;
  const starChars = ['✦', '✧', '★', '☆', '✩', '⭐'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.style.cssText = `
      position: absolute;
      color: rgba(255,215,0,${Math.random() * 0.3 + 0.05});
      font-size: ${Math.random() * 14 + 6}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: twinkle ${Math.random() * 4 + 3}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      user-select: none;
    `;
    star.textContent = starChars[Math.floor(Math.random() * starChars.length)];
    container.appendChild(star);
  }

  // Add twinkle keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes twinkle {
      0%, 100% { opacity: 0.1; transform: scale(0.8); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
}

createStarParticles();

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    if (target >= 1000000) {
      el.textContent = (current / 1000000).toFixed(1) + 'M+';
    } else if (target >= 1000) {
      el.textContent = (current / 1000).toFixed(0) + 'K+';
    } else {
      el.textContent = Math.floor(current).toLocaleString() + '+';
    }
  }, 16);
}

// Intersection Observer for counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---- Scroll Reveal Animation ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function addRevealAnimation() {
  const elements = document.querySelectorAll(
    '.package-card, .step-card, .testimonial-card, .trust-item, .faq-item'
  );
  elements.forEach((el, index) => {
    el.style.cssText += `
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s, background 0.3s, border-color 0.3s, box-shadow 0.3s;
    `;
    revealObserver.observe(el);
  });
}

addRevealAnimation();

/* ---- Custom Calculator ---- */
const customStarsInput = document.getElementById('customStars');
const calcPrice = document.getElementById('calcPrice');

const PRICE_PER_STAR = 1.4; // 1 звезда = 1.4 ₽

function calculateCustomPrice(stars) {
  return Math.round(stars * PRICE_PER_STAR);
}

if (customStarsInput) {
  customStarsInput.addEventListener('input', () => {
    const stars = parseInt(customStarsInput.value) || 0;
    if (stars < 10) {
      calcPrice.textContent = '--';
      return;
    }
    calcPrice.textContent = calculateCustomPrice(stars).toLocaleString('ru-RU') + ' ₽';
  });
  // Initialize
  calcPrice.textContent = calculateCustomPrice(200).toLocaleString('ru-RU') + ' ₽';
}

function orderCustom() {
  const stars = parseInt(customStarsInput.value) || 0;
  if (stars < 10) {
    customStarsInput.focus();
    customStarsInput.style.borderColor = '#EF4444';
    setTimeout(() => { customStarsInput.style.borderColor = ''; }, 1500);
    return;
  }
  const price = calculateCustomPrice(stars);
  openModal(stars, price);
}

/* ---- FAQ Toggle ---- */
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
  });

  // Open clicked if it wasn't open
  if (!isOpen) {
    item.classList.add('open');
  }
}

/* ---- Modal ---- */
const modalOverlay = document.getElementById('modalOverlay');
let currentStars = 0;
let currentPrice = 0;

function openModal(stars, price) {
  currentStars = stars;
  currentPrice = price;

  document.getElementById('modalTitle').textContent = `Купить ${stars.toLocaleString('ru-RU')} Звёзд`;
  document.getElementById('modalSubtitle').textContent = `Оформите заказ: ⭐ ${stars.toLocaleString('ru-RU')} Telegram Stars`;
  document.getElementById('starQuantity').value = stars.toLocaleString('ru-RU') + ' ⭐';
  document.getElementById('summaryStars').textContent = stars.toLocaleString('ru-RU') + ' ⭐';
  document.getElementById('summaryPrice').textContent = price.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('summaryTotal').textContent = price.toLocaleString('ru-RU') + ' ₽';

  // Reset form
  document.getElementById('orderForm').style.display = 'flex';
  document.getElementById('modalSuccess').classList.add('hidden');
  document.getElementById('telegramUsername').value = '';
  document.getElementById('email').value = '';

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus username
  setTimeout(() => {
    document.getElementById('telegramUsername').focus();
  }, 300);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Telegram Mini App API ────────────────────────────────────────────────
// URL твоего бота на Railway (замени после деплоя!)
const BOT_API_URL = 'https://web-production-89245.up.railway.app';

const tg = window.Telegram?.WebApp;

// Инициализируем Mini App если открыто в Telegram
if (tg) {
  tg.ready();
  tg.expand(); // Раскрываем на весь экран
}

/* ---- Order Form Submit ---- */
async function submitOrder(event) {
  event.preventDefault();

  const btn      = document.getElementById('submitBtn');
  const username = document.getElementById('telegramUsername').value.trim();
  const email    = document.getElementById('email').value.trim();

  if (!username || !email) return;

  btn.disabled    = true;
  btn.textContent = 'Создаём счёт...';
  btn.style.opacity = '0.7';

  try {
    // Запрашиваем invoice link у бота
    const response = await fetch(`${BOT_API_URL}/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stars: currentStars,
        email: email,
        username: username,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.invoice_url) {
      throw new Error(data.error || 'Ошибка создания счёта');
    }

    // Открываем окно оплаты Telegram прямо в Mini App
    if (tg) {
      tg.openInvoice(data.invoice_url, (status) => {
        if (status === 'paid') {
          // Оплата прошла успешно!
          document.getElementById('orderForm').style.display = 'none';
          document.getElementById('modalSuccess').classList.remove('hidden');
          launchStarCelebration();
        } else if (status === 'cancelled') {
          // Пользователь отменил
          btn.disabled    = false;
          btn.textContent = 'Перейти к оплате';
          btn.style.opacity = '';
        } else if (status === 'failed') {
          alert('Ошибка оплаты. Попробуйте ещё раз.');
          btn.disabled    = false;
          btn.textContent = 'Перейти к оплате';
          btn.style.opacity = '';
        }
      });
    } else {
      // Если открыто не в Telegram — открываем ссылку в новой вкладке
      window.open(data.invoice_url, '_blank');
      btn.disabled    = false;
      btn.textContent = 'Перейти к оплате';
      btn.style.opacity = '';
    }

  } catch (err) {
    console.error('Ошибка оплаты:', err);
    alert('Не удалось создать счёт: ' + err.message);
    btn.disabled    = false;
    btn.textContent = 'Перейти к оплате';
    btn.style.opacity = '';
  }
}

/* ---- Star Celebration ---- */
function launchStarCelebration() {
  const modal = document.getElementById('modal');
  const emojis = ['⭐', '✨', '🌟', '💫', '✦'];

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight + 20}px;
        font-size: ${Math.random() * 20 + 14}px;
        pointer-events: none;
        z-index: 9999;
        animation: celebrationRise 1.5s ease-out forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }, i * 80);
  }

  if (!document.getElementById('celebStyle')) {
    const style = document.createElement('style');
    style.id = 'celebStyle';
    style.textContent = `
      @keyframes celebrationRise {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-${window.innerHeight + 100}px) rotate(${Math.random() > 0.5 ? 360 : -360}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ---- Smooth scroll for nav links ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Package card shine effect ---- */
document.querySelectorAll('.package-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `
      radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.06) 0%, transparent 60%),
      var(--bg-card)
    `;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ---- Parallax on Hero Orbs ---- */
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.orb');
  const xOffset = (e.clientX / window.innerWidth - 0.5) * 30;
  const yOffset = (e.clientY / window.innerHeight - 0.5) * 30;

  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${xOffset * factor}px, ${yOffset * factor}px)`;
  });
});

console.log('⭐ StarStore loaded! Ready to sell some Stars.');
hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.classList.add('open');
    hamburger.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    hamburger.children[1].style.opacity = '0';
    hamburger.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    closeMobileMenu();
  }
});

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  hamburger.children[0].style.transform = '';
  hamburger.children[1].style.opacity = '';
  hamburger.children[2].style.transform = '';
}

/* ---- Floating Stars Background ---- */
function createStarParticles() {
  const container = document.getElementById('starsBg');
  if (!container) return;
  const starChars = ['✦', '✧', '★', '☆', '✩', '⭐'];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.style.cssText = `
      position: absolute;
      color: rgba(255,215,0,${Math.random() * 0.3 + 0.05});
      font-size: ${Math.random() * 14 + 6}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: twinkle ${Math.random() * 4 + 3}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      user-select: none;
    `;
    star.textContent = starChars[Math.floor(Math.random() * starChars.length)];
    container.appendChild(star);
  }

  // Add twinkle keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes twinkle {
      0%, 100% { opacity: 0.1; transform: scale(0.8); }
      50% { opacity: 0.7; transform: scale(1.2); }
    }
  `;
  document.head.appendChild(style);
}

createStarParticles();

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    if (target >= 1000000) {
      el.textContent = (current / 1000000).toFixed(1) + 'M+';
    } else if (target >= 1000) {
      el.textContent = (current / 1000).toFixed(0) + 'K+';
    } else {
      el.textContent = Math.floor(current).toLocaleString() + '+';
    }
  }, 16);
}

// Intersection Observer for counters
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---- Scroll Reveal Animation ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function addRevealAnimation() {
  const elements = document.querySelectorAll(
    '.package-card, .step-card, .testimonial-card, .trust-item, .faq-item'
  );
  elements.forEach((el, index) => {
    el.style.cssText += `
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s, background 0.3s, border-color 0.3s, box-shadow 0.3s;
    `;
    revealObserver.observe(el);
  });
}

addRevealAnimation();

/* ---- Custom Calculator ---- */
const customStarsInput = document.getElementById('customStars');
const calcPrice = document.getElementById('calcPrice');

const PRICE_PER_STAR = 1.4; // 1 звезда = 1.4 ₽

function calculateCustomPrice(stars) {
  return Math.round(stars * PRICE_PER_STAR);
}

if (customStarsInput) {
  customStarsInput.addEventListener('input', () => {
    const stars = parseInt(customStarsInput.value) || 0;
    if (stars < 10) {
      calcPrice.textContent = '--';
      return;
    }
    calcPrice.textContent = calculateCustomPrice(stars).toLocaleString('ru-RU') + ' ₽';
  });
  // Initialize
  calcPrice.textContent = calculateCustomPrice(200).toLocaleString('ru-RU') + ' ₽';
}

function orderCustom() {
  const stars = parseInt(customStarsInput.value) || 0;
  if (stars < 10) {
    customStarsInput.focus();
    customStarsInput.style.borderColor = '#EF4444';
    setTimeout(() => { customStarsInput.style.borderColor = ''; }, 1500);
    return;
  }
  const price = calculateCustomPrice(stars);
  openModal(stars, price);
}

/* ---- FAQ Toggle ---- */
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
  });

  // Open clicked if it wasn't open
  if (!isOpen) {
    item.classList.add('open');
  }
}

/* ---- Modal ---- */
const modalOverlay = document.getElementById('modalOverlay');
let currentStars = 0;
let currentPrice = 0;

function openModal(stars, price) {
  currentStars = stars;
  currentPrice = price;

  document.getElementById('modalTitle').textContent = `Купить ${stars.toLocaleString('ru-RU')} Звёзд`;
  document.getElementById('modalSubtitle').textContent = `Оформите заказ: ⭐ ${stars.toLocaleString('ru-RU')} Telegram Stars`;
  document.getElementById('starQuantity').value = stars.toLocaleString('ru-RU') + ' ⭐';
  document.getElementById('summaryStars').textContent = stars.toLocaleString('ru-RU') + ' ⭐';
  document.getElementById('summaryPrice').textContent = price.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('summaryTotal').textContent = price.toLocaleString('ru-RU') + ' ₽';

  // Reset form
  document.getElementById('orderForm').style.display = 'flex';
  document.getElementById('modalSuccess').classList.add('hidden');
  document.getElementById('telegramUsername').value = '';
  document.getElementById('email').value = '';

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus username
  setTimeout(() => {
    document.getElementById('telegramUsername').focus();
  }, 300);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Telegram Mini App API ────────────────────────────────────────────────
// URL твоего бота на Railway (замени после деплоя!)
const BOT_API_URL = 'https://ВАШ_ПРОЕКТ.up.railway.app';

const tg = window.Telegram?.WebApp;

// Инициализируем Mini App если открыто в Telegram
if (tg) {
  tg.ready();
  tg.expand(); // Раскрываем на весь экран
}

/* ---- Order Form Submit ---- */
async function submitOrder(event) {
  event.preventDefault();

  const btn      = document.getElementById('submitBtn');
  const username = document.getElementById('telegramUsername').value.trim();
  const email    = document.getElementById('email').value.trim();

  if (!username || !email) return;

  btn.disabled    = true;
  btn.textContent = 'Создаём счёт...';
  btn.style.opacity = '0.7';

  try {
    // Запрашиваем invoice link у бота
    const response = await fetch(`${BOT_API_URL}/create-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stars: currentStars,
        email: email,
        username: username,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.invoice_url) {
      throw new Error(data.error || 'Ошибка создания счёта');
    }

    // Открываем окно оплаты Telegram прямо в Mini App
    if (tg) {
      tg.openInvoice(data.invoice_url, (status) => {
        if (status === 'paid') {
          // Оплата прошла успешно!
          document.getElementById('orderForm').style.display = 'none';
          document.getElementById('modalSuccess').classList.remove('hidden');
          launchStarCelebration();
        } else if (status === 'cancelled') {
          // Пользователь отменил
          btn.disabled    = false;
          btn.textContent = 'Перейти к оплате';
          btn.style.opacity = '';
        } else if (status === 'failed') {
          alert('Ошибка оплаты. Попробуйте ещё раз.');
          btn.disabled    = false;
          btn.textContent = 'Перейти к оплате';
          btn.style.opacity = '';
        }
      });
    } else {
      // Если открыто не в Telegram — открываем ссылку в новой вкладке
      window.open(data.invoice_url, '_blank');
      btn.disabled    = false;
      btn.textContent = 'Перейти к оплате';
      btn.style.opacity = '';
    }

  } catch (err) {
    console.error('Ошибка оплаты:', err);
    alert('Не удалось создать счёт: ' + err.message);
    btn.disabled    = false;
    btn.textContent = 'Перейти к оплате';
    btn.style.opacity = '';
  }
}

/* ---- Star Celebration ---- */
function launchStarCelebration() {
  const modal = document.getElementById('modal');
  const emojis = ['⭐', '✨', '🌟', '💫', '✦'];

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight + 20}px;
        font-size: ${Math.random() * 20 + 14}px;
        pointer-events: none;
        z-index: 9999;
        animation: celebrationRise 1.5s ease-out forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }, i * 80);
  }

  if (!document.getElementById('celebStyle')) {
    const style = document.createElement('style');
    style.id = 'celebStyle';
    style.textContent = `
      @keyframes celebrationRise {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-${window.innerHeight + 100}px) rotate(${Math.random() > 0.5 ? 360 : -360}deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ---- Smooth scroll for nav links ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Package card shine effect ---- */
document.querySelectorAll('.package-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `
      radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.06) 0%, transparent 60%),
      var(--bg-card)
    `;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ---- Parallax on Hero Orbs ---- */
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.orb');
  const xOffset = (e.clientX / window.innerWidth - 0.5) * 30;
  const yOffset = (e.clientY / window.innerHeight - 0.5) * 30;

  orbs.forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${xOffset * factor}px, ${yOffset * factor}px)`;
  });
});

console.log('⭐ StarStore loaded! Ready to sell some Stars.');
