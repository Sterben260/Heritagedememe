 const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

const burgerBtn  = document.getElementById('burgerBtn');
const navLinks   = document.querySelector('.navbar__links');
const navOverlay = document.getElementById('navOverlay');

function closeMenu() {
  navLinks.classList.remove('open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  navOverlay.classList.remove('active');
}

function openMenu() {
  navLinks.classList.add('open');
  burgerBtn.classList.add('open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  navOverlay.classList.add('active');
}

burgerBtn.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

navOverlay.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
const revealEls = document.querySelectorAll(
  '.about__grid, .menu-card, .value-item, .contact-banner__actions'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzq4lvDQrSXBIELqzIErD6h1DmKZxnXbKZD2NC3BfeOQdjs7dKQRq2vn0Ks4CPHx43lyA/exec";

const stars = document.querySelectorAll('.star');
const starCaption = document.getElementById('starCaption');
const submitReview = document.getElementById('submitReview');
const thankMsg = document.getElementById('thankMsg');
const reviewerName = document.getElementById('reviewerName');
const reviewsAverage = document.getElementById('reviewsAverage');
const reviewsCount = document.getElementById('reviewsCount');
const reviewsList = document.getElementById('reviewsList');
const consultBtn = document.getElementById('consultReviewsBtn');
const captions = ['', 'Décevant…', 'Peut mieux faire', 'Bien !', 'Très bien !', 'Excellent ! ✦'];

let selectedRating = 0;
let allReviews = [];

stars.forEach(star => {
  star.setAttribute('tabindex', '0');
  star.setAttribute('role', 'button');
  star.setAttribute('aria-label', `Noter ${star.dataset.value} étoiles`);

  star.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      star.click();
    }
  });

  star.addEventListener('mouseover', () => {
    const val = +star.dataset.value;
    stars.forEach(s => s.classList.toggle('hovered', +s.dataset.value <= val));
    starCaption.textContent = captions[val];
  });

  star.addEventListener('mouseout', () => {
    stars.forEach(s => s.classList.remove('hovered'));
    starCaption.textContent = selectedRating ? captions[selectedRating] : 'Cliquez pour noter';
  });

  star.addEventListener('click', () => {
    selectedRating = +star.dataset.value;
    stars.forEach(s => s.classList.toggle('selected', +s.dataset.value <= selectedRating));
  });
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderStarsText(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function updateBars(reviews) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
  });
  const max = Math.max(...counts, 1);
  for (let level = 1; level <= 5; level++) {
    const bar = document.getElementById(`bar-${level}`);
    const pct = (counts[level - 1] / max) * 100;
    bar.style.height = Math.max(pct, 4) + '%';
  }
}

async function loadReviews() {
  if (!reviewsList) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    allReviews = await res.json();

    if (allReviews.length === 0) {
      reviewsAverage.textContent = '–';
      reviewsCount.textContent = '(0)';
      updateBars([]);
      reviewsList.innerHTML = '<p style="text-align:center; color: var(--brown-light); font-size: 13px;">Aucun avis pour le moment — soyez le premier !</p>';
      return;
    }

    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    reviewsAverage.textContent = avg.toFixed(1).replace('.', ',');
    reviewsCount.textContent = `(${allReviews.length})`;
    updateBars(allReviews);

    reviewsList.innerHTML = allReviews.map(r => `
      <div class="review-item">
        <div class="review-item__top">
          <span class="review-item__name">${escapeHtml(r.name)}</span>
          <span class="review-item__stars">${renderStarsText(r.rating)}</span>
        </div>
        ${r.comment ? `<p class="review-item__comment">${escapeHtml(r.comment)}</p>` : ''}
        <p class="review-item__date">${new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    `).join('');
  } catch (err) {
    reviewsCount.textContent = 'Erreur de chargement';
  }
}

if (consultBtn) {
  consultBtn.addEventListener('click', () => {
    const isHidden = reviewsList.hasAttribute('hidden');
    if (isHidden) {
      reviewsList.removeAttribute('hidden');
      consultBtn.textContent = 'Masquer les avis';
    } else {
      reviewsList.setAttribute('hidden', '');
      consultBtn.textContent = 'Consulter les avis';
    }
  });
}

if (submitReview) {
  submitReview.addEventListener('click', async () => {
    const name = reviewerName.value.trim();

    if (!name) {
      thankMsg.textContent = 'Veuillez indiquer votre nom ✦';
      thankMsg.style.color = '#c0392b';
      return;
    }
    if (!selectedRating) {
      thankMsg.textContent = 'Veuillez choisir une note ✦';
      thankMsg.style.color = '#c0392b';
      return;
    }

    submitReview.disabled = true;
    thankMsg.textContent = 'Envoi en cours...';
    thankMsg.style.color = '';

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: name,
          rating: selectedRating,
          comment: document.getElementById('reviewText').value.trim()
        })
      });

      thankMsg.textContent = 'Merci pour votre avis, cela nous touche ! ✦';
      reviewerName.value = '';
      document.getElementById('reviewText').value = '';
      selectedRating = 0;
      stars.forEach(s => s.classList.remove('selected'));
      starCaption.textContent = 'Cliquez pour noter';
      loadReviews();
    } catch (err) {
      thankMsg.textContent = "Une erreur est survenue, réessayez.";
      thankMsg.style.color = '#c0392b';
    } finally {
      submitReview.disabled = false;
    }
  });
}

loadReviews();



