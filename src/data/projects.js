/**
 * Contenu réel SEVEN7 — source unique bilingue FR/EN.
 */

export const PROJECTS = [
  {
    variant: 'comptable',
    featured: true,
    status: 'live',
    tags: ['Firebase', 'SYSCOHADA'],
    url: 'https://seven7-ptit-comptable.vercel.app/',
    image: '/projects/comptable.jpg',
    title: "SEVEN7 P'tit Comptable",
    desc: {
      fr: "Logiciel de comptabilité simplifiée pour petites structures : saisie, tiers & stock, clôture avec états financiers SYSCOHADA (bilan, compte de résultat) et déclarations fiscales.",
      en: "Simplified accounting software for small organizations: entries, third parties & inventory, closing with SYSCOHADA financial statements (balance sheet, income statement) and tax filings.",
    },
  },
  {
    variant: 'audit',
    featured: true,
    status: 'live',
    tags: ['Firebase', 'Audit'],
    url: 'https://seven7-audit.vercel.app/',
    image: '/projects/audit.jpg',
    title: 'SEVEN7 Audit',
    desc: {
      fr: "Outil d'audit externe automatisé. Programme détaillé conforme au référentiel de mission : suivi des cycles d'audit, procédures, documents requis et statuts en temps réel.",
      en: "Automated external audit tool. Detailed program compliant with the mission framework: audit cycle tracking, procedures, required documents and real-time statuses.",
    },
  },
  {
    variant: 'hydra',
    featured: true,
    status: 'live',
    tags: ['Firebase', 'SaaS'],
    url: 'https://seven7-hydra.vercel.app/',
    image: '/projects/hydra.jpg',
    title: 'SEVEN7 Hydra',
    desc: {
      fr: "Plateforme SaaS de gestion multi-activités pour PME en Côte d'Ivoire — stock, ventes et suivi d'activité centralisés.",
      en: "Multi-business management SaaS platform for SMEs in Côte d'Ivoire — centralized inventory, sales and activity tracking.",
    },
  },
  {
    variant: 'metamorphose',
    featured: true,
    status: 'dev',
    tags: ['Three.js', '3D'],
    url: null,
    image: '/projects/metamorphose.jpg',
    title: 'Atelier // Métamorphose',
    desc: {
      fr: "Boutique 3D immersive en temps réel avec essayage virtuel de produits, portail d'entrée animé et expérience brutaliste organique. Prototype phase 1.",
      en: "Immersive real-time 3D boutique with virtual product try-on, animated entrance portal and organic brutalist experience. Phase 1 prototype.",
    },
  },
  {
    variant: 'formation',
    featured: false,
    status: 'live',
    tags: ['Formation', 'IA'],
    url: 'https://seven7-portfolio-site.vercel.app/formation.html',
    image: null,
    title: 'Formation IA',
    desc: {
      fr: "Formation professionnelle individuelle pour intégrer l'IA dans son métier — comptabilité, audit, finance. Sans exposer les données de vos clients.",
      en: "Individual professional training to integrate AI into your work — accounting, audit, finance. Without exposing your clients' data.",
    },
  },
  {
    variant: 'backend',
    featured: false,
    status: 'dev',
    tags: ['Node.js', 'API'],
    url: null,
    image: null,
    title: 'SEVEN7 Backend',
    desc: {
      fr: "Architecture backend modulaire : API REST, authentification, base de données Firebase et structure scalable.",
      en: "Modular backend architecture: REST API, authentication, Firebase database and scalable structure.",
    },
  },
]
