// ============================================================================
// Catalogue, panier & recherche — indépendant de la scène Three.js.
// Gère : grille produits, recherche instantanée, modale détails/tailles,
// panier flottant (drawer) et commande groupée via WhatsApp.
// ============================================================================

import { PRODUCTS, SIZE_GUIDE } from './products.js';

// Numéro WhatsApp de la boutique, au format international sans "+" ni espaces.
// À remplacer par le vrai numéro avant mise en production.
const WHATSAPP_NUMBER = '221000000000';

function formatPrice(amount) {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

// ----------------------------------------------------------------------------
// ÉTAT DU PANIER
// ----------------------------------------------------------------------------

const cart = [];

function addToCart(product, size) {
  const existing = cart.find((item) => item.productId === product.id && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      cartItemId: `${product.id}-${size}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      qty: 1,
    });
  }
  renderCart();
  openCartDrawer();
}

function removeFromCart(cartItemId) {
  const index = cart.findIndex((item) => item.cartItemId === cartItemId);
  if (index !== -1) cart.splice(index, 1);
  renderCart();
}

function updateQuantity(cartItemId, delta) {
  const item = cart.find((entry) => entry.cartItemId === cartItemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(cartItemId);
  } else {
    renderCart();
  }
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ----------------------------------------------------------------------------
// RENDU DOM
// ----------------------------------------------------------------------------

const cartBadge = document.querySelector('#cart-badge');
const navCartBadge = document.querySelector('#nav-cart-badge');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotalEl = document.querySelector('#cart-total');
const cartEmptyMessage = document.querySelector('#cart-empty');
const whatsappCheckoutBtn = document.querySelector('#whatsapp-checkout');

function renderCart() {
  cartBadge.textContent = String(getCartCount());
  cartBadge.hidden = getCartCount() === 0;
  navCartBadge.textContent = String(getCartCount());
  navCartBadge.hidden = getCartCount() === 0;

  cartItemsContainer.innerHTML = '';
  cartEmptyMessage.hidden = cart.length > 0;
  whatsappCheckoutBtn.disabled = cart.length === 0;

  for (const item of cart) {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item__image" />
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">Taille ${item.size} — ${formatPrice(item.price)}</p>
        <div class="cart-item__qty">
          <button type="button" data-action="decrease" aria-label="Diminuer la quantité">−</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase" aria-label="Augmenter la quantité">+</button>
        </div>
      </div>
      <button type="button" class="cart-item__remove" aria-label="Supprimer l'article">✕</button>
    `;

    row.querySelector('[data-action="decrease"]').addEventListener('click', () =>
      updateQuantity(item.cartItemId, -1)
    );
    row.querySelector('[data-action="increase"]').addEventListener('click', () =>
      updateQuantity(item.cartItemId, 1)
    );
    row.querySelector('.cart-item__remove').addEventListener('click', () =>
      removeFromCart(item.cartItemId)
    );

    cartItemsContainer.appendChild(row);
  }

  cartTotalEl.textContent = formatPrice(getCartTotal());
}

// ----------------------------------------------------------------------------
// DRAWER PANIER (ouverture / fermeture)
// ----------------------------------------------------------------------------

const cartDrawer = document.querySelector('#cart-drawer');
const cartOverlay = document.querySelector('#cart-overlay');

function openCartDrawer() {
  cartDrawer.classList.add('is-open');
  cartOverlay.classList.add('is-visible');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('is-open');
  cartOverlay.classList.remove('is-visible');
}

document.querySelector('#cart-toggle').addEventListener('click', openCartDrawer);
document.querySelector('#nav-cart-btn').addEventListener('click', openCartDrawer);
document.querySelector('#cart-close').addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

// ----------------------------------------------------------------------------
// COMMANDE GROUPÉE WHATSAPP
// ----------------------------------------------------------------------------

function buildWhatsAppMessage() {
  const lines = ['Bonjour ATELIER // MÉTAMORPHOSE, je souhaite commander :', ''];

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    lines.push(
      `${index + 1}. ${item.name} — Taille ${item.size} — Qté ${item.qty} — ${formatPrice(item.price)} x${item.qty} = ${formatPrice(lineTotal)}`
    );
  });

  lines.push('', `Total : ${formatPrice(getCartTotal())}`, '', 'Merci !');
  return lines.join('\n');
}

whatsappCheckoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  const message = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener');
});

// ----------------------------------------------------------------------------
// MODALE DÉTAILS PRODUIT & GUIDE DES TAILLES
// ----------------------------------------------------------------------------

const productModal = document.querySelector('#product-modal');
const productModalOverlay = document.querySelector('#product-modal-overlay');
const productModalBody = document.querySelector('#product-modal-body');

function renderSizeGuideTable() {
  const headerRow = SIZE_GUIDE.headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = SIZE_GUIDE.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');
  return `
    <table class="size-guide-table">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
}

function openProductModal(product) {
  const sizeOptions = product.sizes.map((size) => `<option value="${size}">${size}</option>`).join('');

  productModalBody.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-modal__image" />
    <div class="product-modal__details">
      <h3>${product.name}</h3>
      <p class="product-modal__price">${formatPrice(product.price)}</p>
      <p class="product-modal__description">${product.description}</p>

      <div class="product-modal__tabs">
        <button type="button" class="product-modal__tab is-active" data-tab="details">Détails</button>
        <button type="button" class="product-modal__tab" data-tab="sizes">Guide des tailles</button>
      </div>

      <div class="product-modal__panel" data-panel="details">
        <label for="modal-size-select">Taille</label>
        <select id="modal-size-select">${sizeOptions}</select>
        <button type="button" class="btn-primary" id="modal-add-to-cart">Ajouter au panier</button>
      </div>

      <div class="product-modal__panel" data-panel="sizes" hidden>
        ${renderSizeGuideTable()}
      </div>
    </div>
  `;

  productModalBody.querySelectorAll('.product-modal__tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      productModalBody.querySelectorAll('.product-modal__tab').forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const targetTab = tab.dataset.tab;
      productModalBody.querySelectorAll('.product-modal__panel').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== targetTab;
      });
    });
  });

  productModalBody.querySelector('#modal-add-to-cart').addEventListener('click', () => {
    const size = productModalBody.querySelector('#modal-size-select').value;
    addToCart(product, size);
    closeProductModal();
  });

  productModal.classList.add('is-open');
  productModalOverlay.classList.add('is-visible');
}

function closeProductModal() {
  productModal.classList.remove('is-open');
  productModalOverlay.classList.remove('is-visible');
}

document.querySelector('#product-modal-close').addEventListener('click', closeProductModal);
productModalOverlay.addEventListener('click', closeProductModal);

// ----------------------------------------------------------------------------
// GRILLE PRODUITS & RECHERCHE INSTANTANÉE
// ----------------------------------------------------------------------------

const productGrid = document.querySelector('#product-grid');
const searchInput = document.querySelector('#product-search');
const noResultsMessage = document.querySelector('#no-results');

function renderProductGrid(products) {
  productGrid.innerHTML = '';
  noResultsMessage.hidden = products.length > 0;

  for (const product of products) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <button type="button" class="product-card__image-btn" aria-label="Voir les détails de ${product.name}">
        <img src="${product.image}" alt="${product.name}" class="product-card__image" />
      </button>
      <button type="button" class="product-card__title">${product.name}</button>
      <p class="product-card__price">${formatPrice(product.price)}</p>
      <div class="product-card__actions">
        <select class="product-card__size" aria-label="Taille">
          ${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join('')}
        </select>
        <button type="button" class="btn-primary product-card__add">Ajouter au panier</button>
      </div>
    `;

    card.querySelector('.product-card__image-btn').addEventListener('click', () => openProductModal(product));
    card.querySelector('.product-card__title').addEventListener('click', () => openProductModal(product));
    card.querySelector('.product-card__add').addEventListener('click', () => {
      const size = card.querySelector('.product-card__size').value;
      addToCart(product, size);
    });

    productGrid.appendChild(card);
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query)
  );
  renderProductGrid(filtered);
});

// ----------------------------------------------------------------------------
// INITIALISATION
// ----------------------------------------------------------------------------

renderProductGrid(PRODUCTS);
renderCart();
