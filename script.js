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

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPJnNoun3Z2Rf5mo14-CL0lc7CC3cQFOxgbQbyVYjjy6J8DZxHAma9vavfLs6pUhfOlA/exec";

const stars = document.querySelectorAll('.star');
const starCaption = document.getElementById('starCaption');
const submitReview = document.getElementById('submitReview');
const thankMsg = document.getElementById('thankMsg');
const reviewsAverage = document.getElementById('reviewsAverage');
const reviewsCount = document.getElementById('reviewsCount');
const reviewsList = document.getElementById('reviewsList');
const consultBtn = document.getElementById('consultReviewsBtn');
const captions = ['', 'Décevant…', 'Peut mieux faire', 'Bien !', 'Très bien !', 'Excellent ! ✦'];

const reviewPanel = document.getElementById('reviewPanel');
const reviewPanelOverlay = document.getElementById('reviewPanelOverlay');
const reviewPanelClose = document.getElementById('reviewPanelClose');
const panelStars = document.getElementById('panelStars');

const reviewModal = document.getElementById('reviewModal');
const reviewModalOverlay = document.getElementById('reviewModalOverlay');
const reviewModalClose = document.getElementById('reviewModalClose');
const modalSubmit = document.getElementById('modalSubmit');
const modalError = document.getElementById('modalError');
const modalName = document.getElementById('modalName');
const modalEmail = document.getElementById('modalEmail');
const modalAge = document.getElementById('modalAge');
const modalCity = document.getElementById('modalCity');

let selectedRating = 0;

function renderStarsText(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function openReviewPanel() {
  panelStars.textContent = renderStarsText(selectedRating);
  reviewPanel.classList.add('open');
  reviewPanelOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReviewPanel(resetRating) {
  reviewPanel.classList.remove('open');
  reviewPanelOverlay.classList.remove('active');
  document.body.style.overflow = '';
  if (resetRating) {
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('selected'));
    starCaption.textContent = 'Cliquez pour noter';
  }
}

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
  thankMsg.textContent = '';
  setTimeout(openReviewPanel, 180);
});
});

reviewPanelClose.addEventListener('click', () => closeReviewPanel(true));
reviewPanelOverlay.addEventListener('click', () => closeReviewPanel(true));

if (submitReview) {
  submitReview.addEventListener('click', () => {
    closeReviewPanel(false);
    openReviewModal();
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function avatarColor(name) {
  const colors = ['#c49b49', '#2d6a4f', '#7a4f35', '#4a2c1a', '#40916c'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function updateBars(reviews) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
  });
  const max = Math.max(...counts, 1);
  for (let level = 1; level <= 5; level++) {
    const bar = document.getElementById(`bar-${level}`);
    const countLabel = document.getElementById(`count-${level}`);
    const pct = (counts[level - 1] / max) * 100;
    bar.style.height = Math.max(pct, 4) + '%';
    countLabel.textContent = counts[level - 1];
  }
}

async function loadReviews() {
  if (!reviewsList) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const reviews = await res.json();

    if (reviews.length === 0) {
      reviewsAverage.textContent = '–';
      reviewsCount.textContent = '(0)';
      updateBars([]);
      reviewsList.innerHTML = '<p style="text-align:center; color: var(--brown-light); font-size: 13px;">Aucun avis pour le moment — soyez le premier !</p>';
      return;
    }

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    reviewsAverage.textContent = avg.toFixed(1).replace('.', ',');
    reviewsCount.textContent = `(${reviews.length})`;
    updateBars(reviews);

    reviewsList.innerHTML = reviews.map(r => {
      const initial = (r.name || '?').trim().charAt(0).toUpperCase();
      return `
      <div class="review-item">
        <div class="review-item__header">
          <div class="review-item__avatar" style="background:${avatarColor(r.name || '')}">${initial}</div>
          <span class="review-item__name">${escapeHtml(r.name || 'Client')}</span>
        </div>
        <div class="review-item__meta">
          <span class="review-item__stars">${renderStarsText(r.rating)}</span>
          <span class="review-item__date">${new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        ${r.comment ? `<p class="review-item__comment">${escapeHtml(r.comment)}</p>` : ''}
      </div>
    `;
    }).join('');
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

function openReviewModal() {
  reviewModal.classList.add('open');
  reviewModalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  modalError.textContent = '';
}

function closeReviewModal(resetRating) {
  reviewModal.classList.remove('open');
  reviewModalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  if (resetRating) {
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('selected'));
    starCaption.textContent = 'Cliquez pour noter';
  }
}
reviewModalClose.addEventListener('click',() => closeReviewModal(true));
reviewModalOverlay.addEventListener('click',()=> closeReviewModal(true));

modalSubmit.addEventListener('click', async () => {
  const name = modalName.value.trim();
  const email = modalEmail.value.trim();
  const age = modalAge.value.trim();
  const city = modalCity.value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name) {
    modalError.textContent = 'Le nom est obligatoire.';
    return;
  }
  if (!email || !emailValid) {
    modalError.textContent = 'Une adresse email valide est obligatoire.';
    return;
  }

  modalSubmit.disabled = true;
  modalError.textContent = '';

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        name: name,
        email: email,
        age: age,
        ville: city,
        rating: selectedRating,
        comment: document.getElementById('reviewText').value.trim()
      })
    });

    closeReviewModal(false);
    thankMsg.textContent = 'Merci pour votre avis, cela nous touche ! ✦';
    thankMsg.style.color = '';
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    stars.forEach(s => s.classList.remove('selected'));
    starCaption.textContent = 'Cliquez pour noter';
    modalName.value = '';
    modalEmail.value = '';
    modalAge.value = '';
    modalCity.value = '';
    loadReviews();
  } catch (err) {
    modalError.textContent = "Une erreur est survenue, réessayez.";
  } finally {
    modalSubmit.disabled = false;
  }
});

loadReviews();
