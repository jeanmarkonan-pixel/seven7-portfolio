/**
 * Orienteur de projet — questionnaire déterministe (aucun appel IA/API,
 * juste un scoring simple) qui recommande le service le plus adapté.
 */

export const QUESTIONS = [
  {
    fr: { text: 'Quel est votre secteur ?' },
    en: { text: "What's your field?" },
    options: [
      { fr: 'Comptabilité, finance ou audit', en: 'Accounting, finance or audit', score: { audit: 2 } },
      { fr: 'Commerce, PME multi-activités', en: 'Retail, multi-business SME', score: { saas: 2 } },
      { fr: 'Créatif, vitrine, marque', en: 'Creative, showcase, brand', score: { web: 2 } },
      { fr: 'Autre / pas encore défini', en: 'Other / not defined yet', score: {} },
    ],
  },
  {
    fr: { text: 'Quel est votre besoin principal ?' },
    en: { text: 'What is your main need?' },
    options: [
      { fr: 'Automatiser des tâches répétitives (saisie, suivi)', en: 'Automate repetitive tasks (entry, tracking)', score: { audit: 2, saas: 1 } },
      { fr: 'Centraliser stock, ventes et activité', en: 'Centralize inventory, sales and activity', score: { saas: 2 } },
      { fr: 'Une présence web forte et marquante', en: 'A strong, memorable web presence', score: { web: 2 } },
      { fr: "Intégrer l'IA dans mon métier", en: 'Integrate AI into my work', score: { audit: 1, saas: 1 } },
    ],
  },
  {
    fr: { text: 'Où en êtes-vous aujourd\'hui ?' },
    en: { text: 'Where are you today?' },
    options: [
      { fr: 'Je pars de zéro', en: 'Starting from scratch', score: {} },
      { fr: "J'ai un outil, mais il ne suffit plus", en: "I have a tool, but it's not enough anymore", score: { saas: 1, audit: 1 } },
      { fr: 'Je veux explorer ce qui est possible', en: "I'm exploring what's possible", score: { web: 1 } },
    ],
  },
]

export const RESULTS = {
  web: { serviceIndex: 0, exampleVariant: 'metamorphose' },
  audit: { serviceIndex: 1, exampleVariant: 'audit' },
  saas: { serviceIndex: 2, exampleVariant: 'hydra' },
}
