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
    caseStudy: {
      problem: {
        fr: "Les petites structures et indépendants en Côte d'Ivoire ont rarement les moyens d'un cabinet comptable à temps plein, et les logiciels occidentaux sont coûteux et mal adaptés au référentiel SYSCOHADA. Beaucoup gèrent encore leur comptabilité sur papier ou tableur, avec un risque d'erreur élevé à la clôture.",
        en: "Small businesses and freelancers in Côte d'Ivoire rarely have the budget for a full-time accounting firm, and Western software is expensive and poorly suited to the SYSCOHADA framework. Many still manage their books on paper or spreadsheets, with a high risk of error at closing time.",
      },
      approach: {
        fr: "Un logiciel de comptabilité simplifiée pensé pour un non-expert : saisie guidée des écritures, gestion des tiers et du stock, puis clôture automatisée générant directement les états financiers conformes au Système Normal SYSCOHADA révisé (bilan, compte de résultat, table de correspondance) et les déclarations fiscales. Hébergé sur Firebase pour rester accessible et économique.",
        en: "A simplified accounting tool designed for non-experts: guided entries, third-party and inventory management, then automated closing that directly generates SYSCOHADA-compliant financial statements (balance sheet, income statement, correspondence table) and tax filings. Hosted on Firebase to stay accessible and affordable.",
      },
      result: {
        fr: "Une petite structure peut produire ses états financiers réglementaires sans recruter un comptable à temps plein, avec une saisie centralisée qui réduit le risque d'erreur de report entre les documents.",
        en: "A small business can produce its regulatory financial statements without hiring a full-time accountant, with centralized entry that reduces transcription errors between documents.",
      },
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
    caseStudy: {
      problem: {
        fr: "Les missions d'audit externe reposent souvent sur des feuilles de calcul dispersées et un suivi manuel des cycles, procédures et pièces justificatives — un processus chronophage et propice aux oublis, surtout sur des missions multi-cycles.",
        en: "External audit engagements often rely on scattered spreadsheets and manual tracking of cycles, procedures and supporting documents — time-consuming and prone to oversights, especially on multi-cycle engagements.",
      },
      approach: {
        fr: "Un outil d'audit externe automatisé structuré autour du référentiel de mission : programme détaillé par cycle, suivi des procédures et des documents requis, statuts mis à jour en temps réel pour toute l'équipe.",
        en: "An automated external audit tool structured around the mission framework: a detailed program per cycle, tracking of procedures and required documents, and real-time statuses for the whole team.",
      },
      result: {
        fr: "L'équipe de mission dispose d'une vue centralisée et à jour de l'avancement de l'audit, ce qui facilite la coordination entre collaborateurs et la préparation du rapport final.",
        en: "The engagement team gets a centralized, up-to-date view of audit progress, easing coordination between staff and final report preparation.",
      },
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
    caseStudy: {
      problem: {
        fr: "Les PME ivoiriennes multi-activités jonglent souvent entre plusieurs outils disparates (carnet, tableur, logiciel de caisse) pour suivre leur stock, leurs ventes et leur activité globale, ce qui complique la vision d'ensemble.",
        en: "Multi-business Ivorian SMEs often juggle several disconnected tools (notebooks, spreadsheets, POS software) to track inventory, sales and overall activity, making it hard to get the full picture.",
      },
      approach: {
        fr: "Une plateforme SaaS unique centralisant stock, ventes et suivi d'activité pour plusieurs métiers en parallèle, sur une architecture Firebase scalable pensée pour accompagner la croissance de l'entreprise.",
        en: "A single SaaS platform centralizing inventory, sales and activity tracking across several business lines in parallel, on a scalable Firebase architecture designed to grow with the company.",
      },
      result: {
        fr: "Une PME peut piloter l'ensemble de ses activités depuis une seule interface, avec une donnée centralisée plutôt qu'éclatée entre plusieurs outils.",
        en: "An SME can run all of its activities from one interface, with centralized data instead of scattered across multiple tools.",
      },
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
