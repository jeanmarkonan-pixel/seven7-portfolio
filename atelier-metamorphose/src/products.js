// ============================================================================
// Données produits — à remplacer par le vrai catalogue (API, CMS, etc.)
// Les images sont des placeholders SVG générés en local, sans dépendance
// réseau, pour un rendu fiable en attendant les vraies photos.
// ============================================================================

function placeholderImage(label, background) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <rect width="600" height="750" fill="${background}" />
      <rect x="24" y="24" width="552" height="702" fill="none" stroke="#00000033" stroke-width="2" />
      <text x="300" y="385" font-family="monospace" font-size="28" fill="#ffffffcc"
            text-anchor="middle" letter-spacing="2">${label}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const SIZE_GUIDE = {
  headers: ['Taille', 'Tour de poitrine (cm)', 'Tour de taille (cm)', 'Tour de hanches (cm)'],
  rows: [
    ['S', '88 – 92', '72 – 76', '92 – 96'],
    ['M', '92 – 96', '76 – 80', '96 – 100'],
    ['L', '96 – 102', '80 – 86', '100 – 106'],
    ['XL', '102 – 108', '86 – 92', '106 – 112'],
  ],
};

export const PRODUCTS = [
  {
    id: 'trench-beton',
    name: 'Trench-Coat Béton',
    price: 45000,
    sizes: ['S', 'M', 'L', 'XL'],
    description:
      'Silhouette architecturale, tissu technique résistant à la pluie. Coupe droite, épaules structurées.',
    image: placeholderImage('TRENCH-COAT BÉTON', '#3a3a3c'),
  },
  {
    id: 'hoodie-organique',
    name: 'Hoodie Organique',
    price: 28000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Molleton épais, capuche doublée. Le confort du quotidien, sans compromis sur la ligne.',
    image: placeholderImage('HOODIE ORGANIQUE', '#6b6b6d'),
  },
  {
    id: 'pantalon-brut',
    name: 'Pantalon Brut',
    price: 32000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Coupe cargo ajustée, poches utilitaires. Tissu brut, teinture minérale.',
    image: placeholderImage('PANTALON BRUT', '#4a4a4c'),
  },
  {
    id: 'veste-monolithe',
    name: 'Veste Monolithe',
    price: 52000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Pièce signature de la collection. Volume sculptural, fermeture asymétrique.',
    image: placeholderImage('VESTE MONOLITHE', '#2a2a2c'),
  },
  {
    id: 'chemise-fluide',
    name: 'Chemise Fluide',
    price: 21000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Tissu fluide à fort tombé, col brutaliste minimal. Se porte ouverte ou fermée.',
    image: placeholderImage('CHEMISE FLUIDE', '#8a8a8c'),
  },
  {
    id: 'robe-drapee',
    name: 'Robe Drapée',
    price: 38000,
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Drapé asymétrique inspiré du tissu suspendu de l’atelier. Une seconde peau mouvante.',
    image: placeholderImage('ROBE DRAPÉE', '#5a5a5c'),
  },
];
