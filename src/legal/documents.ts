import { COMPANY as C } from "@/legal/company";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

// ---------------------------------------------------------------- Terms (EN)
const termsEn: LegalDoc = {
  title: "Terms of Use",
  intro: `These terms govern your use of FinLens, a financial news and analysis app provided by ${C.name} ("FinLens", "we"). By creating an account you accept them.`,
  sections: [
    {
      title: "1. What FinLens is — and is not",
      paragraphs: [
        "FinLens summarises publicly available financial news and uses artificial intelligence to explain it and to indicate which companies a story could be good or bad news for (\"signals\").",
        "FinLens provides general information only. It is not investment, financial, legal or tax advice, and it is not a recommendation to buy, sell or hold any security. We are not a registered adviser, dealer or portfolio manager. You are solely responsible for your investment decisions; consider consulting a registered professional.",
        "Signals and analyses are generated automatically, can be wrong or incomplete, and do not predict prices. A stock can fall after good news. Market data may be delayed or unavailable. Past accuracy, including any hit rate we publish, does not guarantee future results.",
      ],
    },
    {
      title: "2. Your account",
      list: [
        "You must be at least 18 years old and able to enter into a contract.",
        "Keep your password confidential. You are responsible for activity on your account.",
        "One account is personal to one person; do not share or resell access.",
        "Give accurate information and keep your email address up to date.",
      ],
    },
    {
      title: "3. Subscription, free trial and cancellation",
      list: [
        "Access requires a paid subscription (monthly or yearly), billed in advance through our payment provider, Stripe. Prices are shown before you subscribe, in US dollars, plus any applicable taxes.",
        "New customers may get one free trial (currently 7 days). Unless you cancel before it ends, the subscription starts and you are charged automatically.",
        "Subscriptions renew automatically at the end of each period until cancelled. You can cancel anytime in Settings → Manage subscription; access continues until the end of the period already paid.",
        "Except where the law that protects you as a consumer requires otherwise, payments are non-refundable and we do not provide refunds for partial periods.",
        "We may change prices for future periods. We will tell you in advance, and you can cancel before the new price applies.",
      ],
    },
    {
      title: "4. Acceptable use",
      list: [
        "Do not copy, scrape, resell or redistribute FinLens content or data, or use it to build a competing service.",
        "Do not attempt to bypass security, usage limits or payment, or to disrupt the service.",
        "Do not use FinLens for unlawful purposes, including market manipulation.",
      ],
    },
    {
      title: "5. Content and intellectual property",
      paragraphs: [
        "FinLens, its design, software, analyses and signals belong to us or our licensors. We grant you a personal, non-transferable, revocable licence to use them for your own non-commercial purposes while your subscription is active.",
        "News headlines and summaries come from third-party sources and remain their property; we link to the original source.",
      ],
    },
    {
      title: "6. Availability and changes",
      paragraphs: [
        "We work to keep FinLens available and accurate but do not guarantee uninterrupted or error-free service. We may add, change or remove features. If a change materially reduces what you paid for, you may cancel.",
      ],
    },
    {
      title: "7. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, FinLens is provided \"as is\", and we are not liable for any investment losses or for indirect, incidental or consequential damages arising from your use of the service. Our total liability for any claim is limited to the amount you paid us in the 12 months before the claim.",
        "Nothing in these terms limits rights you have under consumer protection laws that cannot be waived.",
      ],
    },
    {
      title: "8. Suspension and termination",
      paragraphs: [
        "You can delete your account at any time in Settings. We may suspend or close an account that breaches these terms, after notice where reasonable.",
      ],
    },
    {
      title: "9. Changes to these terms",
      paragraphs: [
        "We may update these terms. For important changes we will notify you in the app or by email before they take effect. Continuing to use FinLens after that means you accept the new terms.",
      ],
    },
    {
      title: "10. Governing law and contact",
      paragraphs: [
        `These terms are governed by ${C.jurisdictionEn}, without depriving consumers of the protection of the mandatory laws of the place where they live.`,
        `Questions: ${C.email} — ${C.name}, ${C.address}.`,
      ],
    },
  ],
};

// ---------------------------------------------------------------- Terms (FR)
const termsFr: LegalDoc = {
  title: "Conditions d'utilisation",
  intro: `Les présentes conditions encadrent l'utilisation de FinLens, une application d'actualité et d'analyse financières offerte par ${C.name} (« FinLens », « nous »). En créant un compte, tu les acceptes.`,
  sections: [
    {
      title: "1. Ce que FinLens est — et n'est pas",
      paragraphs: [
        "FinLens résume l'actualité financière publique et utilise l'intelligence artificielle pour l'expliquer et indiquer pour quelles entreprises une nouvelle pourrait être bonne ou mauvaise (les « signaux »).",
        "FinLens fournit uniquement de l'information générale. Ce n'est pas un conseil en placement, financier, juridique ou fiscal, ni une recommandation d'acheter, de vendre ou de conserver un titre. Nous ne sommes pas un conseiller, un courtier ou un gestionnaire de portefeuille inscrit. Tu es seul responsable de tes décisions de placement; envisage de consulter un professionnel inscrit.",
        "Les signaux et analyses sont générés automatiquement, peuvent être erronés ou incomplets et ne prédisent pas les cours. Une action peut baisser après une bonne nouvelle. Les données de marché peuvent être différées ou indisponibles. L'exactitude passée, y compris tout taux de réussite publié, ne garantit pas les résultats futurs.",
      ],
    },
    {
      title: "2. Ton compte",
      list: [
        "Tu dois avoir au moins 18 ans et être capable de conclure un contrat.",
        "Garde ton mot de passe confidentiel. Tu es responsable de l'activité de ton compte.",
        "Un compte est personnel à une seule personne; ne partage pas et ne revends pas l'accès.",
        "Fournis des renseignements exacts et garde ton adresse courriel à jour.",
      ],
    },
    {
      title: "3. Abonnement, essai gratuit et annulation",
      list: [
        "L'accès requiert un abonnement payant (mensuel ou annuel), facturé d'avance par notre fournisseur de paiement, Stripe. Les prix sont affichés avant l'abonnement, en dollars américains, taxes applicables en sus.",
        "Les nouveaux clients peuvent bénéficier d'un seul essai gratuit (actuellement 7 jours). Si tu n'annules pas avant la fin, l'abonnement commence et tu es facturé automatiquement.",
        "L'abonnement se renouvelle automatiquement à la fin de chaque période jusqu'à son annulation. Tu peux annuler en tout temps dans Réglages → Gérer l'abonnement; l'accès se poursuit jusqu'à la fin de la période déjà payée.",
        "Sauf si la loi qui te protège comme consommateur en dispose autrement, les paiements ne sont pas remboursables et aucune période partielle n'est remboursée.",
        "Nous pouvons modifier les prix pour les périodes futures. Nous t'en informerons à l'avance et tu pourras annuler avant l'application du nouveau prix.",
      ],
    },
    {
      title: "4. Utilisation acceptable",
      list: [
        "Ne copie pas, n'extrais pas automatiquement, ne revends pas et ne redistribue pas le contenu ou les données de FinLens, et ne t'en sers pas pour créer un service concurrent.",
        "Ne tente pas de contourner la sécurité, les limites d'utilisation ou le paiement, ni de perturber le service.",
        "N'utilise pas FinLens à des fins illégales, notamment la manipulation de marché.",
      ],
    },
    {
      title: "5. Contenu et propriété intellectuelle",
      paragraphs: [
        "FinLens, son design, son logiciel, ses analyses et ses signaux nous appartiennent ou appartiennent à nos concédants. Nous t'accordons une licence personnelle, incessible et révocable pour les utiliser à des fins personnelles et non commerciales pendant que ton abonnement est actif.",
        "Les titres et résumés d'actualité proviennent de sources tierces et demeurent leur propriété; nous renvoyons à la source originale.",
      ],
    },
    {
      title: "6. Disponibilité et modifications",
      paragraphs: [
        "Nous faisons de notre mieux pour que FinLens soit disponible et exact, sans garantir un service ininterrompu ou exempt d'erreurs. Nous pouvons ajouter, modifier ou retirer des fonctionnalités. Si un changement réduit de façon importante ce pour quoi tu as payé, tu peux annuler.",
      ],
    },
    {
      title: "7. Limitation de responsabilité",
      paragraphs: [
        "Dans toute la mesure permise par la loi, FinLens est fourni « tel quel », et nous ne sommes pas responsables des pertes de placement ni des dommages indirects, accessoires ou consécutifs découlant de l'utilisation du service. Notre responsabilité totale pour toute réclamation est limitée au montant que tu nous as payé au cours des 12 mois précédant la réclamation.",
        "Rien dans les présentes ne limite les droits que te confèrent les lois sur la protection du consommateur auxquels on ne peut renoncer.",
      ],
    },
    {
      title: "8. Suspension et fermeture",
      paragraphs: [
        "Tu peux supprimer ton compte en tout temps dans les Réglages. Nous pouvons suspendre ou fermer un compte qui enfreint les présentes conditions, après préavis lorsque c'est raisonnable.",
      ],
    },
    {
      title: "9. Modifications des conditions",
      paragraphs: [
        "Nous pouvons mettre à jour ces conditions. Pour tout changement important, nous t'aviserons dans l'app ou par courriel avant son entrée en vigueur. Continuer d'utiliser FinLens ensuite signifie que tu acceptes les nouvelles conditions.",
      ],
    },
    {
      title: "10. Loi applicable et contact",
      paragraphs: [
        `Les présentes conditions sont régies par ${C.jurisdictionFr}, sans priver le consommateur de la protection des lois impératives du lieu où il réside.`,
        `Questions : ${C.email} — ${C.name}, ${C.address}.`,
      ],
    },
  ],
};

// -------------------------------------------------------------- Privacy (EN)
const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  intro: `This policy explains what personal information ${C.name} ("FinLens", "we") collects, why, and your rights. It is written to meet Quebec's Law 25, Canada's PIPEDA, Switzerland's Federal Act on Data Protection (nFADP) and, where applicable, the EU GDPR.`,
  sections: [
    {
      title: "1. Information we collect",
      list: [
        "Account: your email address, a securely hashed password, and sign-in dates.",
        "Questionnaire and preferences: investing experience, goal, sectors of interest, risk comfort, the stocks you follow, event reminders, language, time zone and notification settings.",
        "Subscription: your Stripe customer and subscription identifiers, plan, status and dates. Your card details are handled by Stripe; we never see or store them.",
        "Notifications: if you turn them on, a technical address for your device's browser push service and your browser type.",
        "Questions you ask Ask FinLens: sent to our AI provider to generate the answer; we do not store them.",
        "Technical data: IP address, device and browser information and errors in server logs, kept briefly for security and troubleshooting.",
      ],
    },
    {
      title: "2. Why we use it",
      list: [
        "To create and secure your account and provide the service you pay for.",
        "To personalise FinLens: ranking news and signals around your stocks and interests, and adapting explanations to your experience.",
        "To send the notifications and morning brief you turned on.",
        "To process payments and manage your subscription.",
        "To prevent abuse, keep the service secure and meet legal obligations.",
      ],
      paragraphs: [
        "We do not sell your personal information, do not use it for advertising, and do not use advertising or analytics trackers. We do not make decisions about you based solely on automated processing that have legal effects; the personalisation above only changes what you see first.",
      ],
    },
    {
      title: "3. Service providers",
      paragraphs: [
        "We share information only with providers that help us run FinLens, under contracts that require them to protect it: Supabase (database, sign-in and emails), Vercel (hosting), Stripe (payments) and OpenAI (answers to your questions). Market data providers receive no personal information.",
        "These providers may store and process data outside Quebec, Canada and Switzerland, mainly in the United States. Before transferring information we assess that it will be adequately protected, as required by law.",
      ],
    },
    {
      title: "4. Cookies",
      paragraphs: [
        "We use only essential cookies: one to keep you signed in and one to remember your language. No advertising or tracking cookies.",
      ],
    },
    {
      title: "5. How long we keep it",
      paragraphs: [
        "We keep your information while your account is open. When you delete your account, your profile, preferences, watchlist, reminders and notification settings are deleted immediately from our database; residual copies in encrypted backups are erased on their normal rotation. Stripe keeps billing records as required by law. Server logs are kept for a short period.",
      ],
    },
    {
      title: "6. Security",
      paragraphs: [
        "Data is encrypted in transit; passwords are hashed; each user can only access their own data; access to production systems is restricted. If a confidentiality incident presents a risk of serious harm, we will notify you and the competent authorities as required by law.",
      ],
    },
    {
      title: "7. Your rights",
      list: [
        "Access the personal information we hold about you and receive a copy, including in a structured, commonly used format.",
        "Correct inaccurate information.",
        "Delete your account at any time in Settings → Delete my account, or ask us to.",
        "Withdraw consent, for example by turning off notifications.",
        "Complain to a supervisory authority: the Commission d'accès à l'information du Québec, the Office of the Privacy Commissioner of Canada, the Swiss Federal Data Protection and Information Commissioner (FDPIC), or your EU data protection authority.",
      ],
      paragraphs: [`To exercise your rights, write to ${C.email}. We answer within 30 days.`],
    },
    {
      title: "8. Children",
      paragraphs: ["FinLens is intended for adults (18+). We do not knowingly collect information about minors."],
    },
    {
      title: "9. Person in charge and contact",
      paragraphs: [
        `The person in charge of the protection of personal information is ${C.privacyOfficer}. Contact: ${C.email} — ${C.name}, ${C.address}.`,
        "We will notify you of important changes to this policy in the app or by email.",
      ],
    },
  ],
};

// -------------------------------------------------------------- Privacy (FR)
const privacyFr: LegalDoc = {
  title: "Politique de confidentialité",
  intro: `La présente politique explique quels renseignements personnels ${C.name} (« FinLens », « nous ») recueille, pourquoi, et quels sont tes droits. Elle vise à respecter la Loi 25 du Québec, la LPRPDE du Canada, la Loi fédérale sur la protection des données (nLPD) de la Suisse et, s'il y a lieu, le RGPD de l'Union européenne.`,
  sections: [
    {
      title: "1. Renseignements recueillis",
      list: [
        "Compte : ton adresse courriel, un mot de passe chiffré de façon sécuritaire (hachage) et les dates de connexion.",
        "Questionnaire et préférences : expérience en placement, objectif, secteurs d'intérêt, rapport au risque, actions suivies, rappels d'événements, langue, fuseau horaire et réglages de notification.",
        "Abonnement : tes identifiants client et d'abonnement Stripe, la formule, le statut et les dates. Les données de ta carte sont traitées par Stripe; nous ne les voyons ni ne les conservons jamais.",
        "Notifications : si tu les actives, une adresse technique du service de notification de ton navigateur et le type de navigateur.",
        "Questions posées à « Demander à FinLens » : envoyées à notre fournisseur d'IA pour générer la réponse; nous ne les conservons pas.",
        "Données techniques : adresse IP, informations sur l'appareil et le navigateur et erreurs dans les journaux du serveur, conservées brièvement pour la sécurité et le dépannage.",
      ],
    },
    {
      title: "2. Pourquoi nous les utilisons",
      list: [
        "Créer et sécuriser ton compte et fournir le service pour lequel tu paies.",
        "Personnaliser FinLens : classer les actualités et les signaux selon tes actions et tes intérêts, et adapter les explications à ton expérience.",
        "T'envoyer les notifications et le résumé du matin que tu as activés.",
        "Traiter les paiements et gérer ton abonnement.",
        "Prévenir les abus, assurer la sécurité du service et respecter nos obligations légales.",
      ],
      paragraphs: [
        "Nous ne vendons pas tes renseignements personnels, ne les utilisons pas à des fins publicitaires et n'utilisons aucun outil de suivi publicitaire ou analytique. Nous ne prenons aucune décision te concernant fondée exclusivement sur un traitement automatisé et produisant des effets juridiques; la personnalisation ci-dessus change seulement ce que tu vois en premier.",
      ],
    },
    {
      title: "3. Fournisseurs de services",
      paragraphs: [
        "Nous partageons des renseignements uniquement avec les fournisseurs qui nous aident à exploiter FinLens, en vertu de contrats qui les obligent à les protéger : Supabase (base de données, connexion et courriels), Vercel (hébergement), Stripe (paiements) et OpenAI (réponses à tes questions). Les fournisseurs de données de marché ne reçoivent aucun renseignement personnel.",
        "Ces fournisseurs peuvent conserver et traiter des données à l'extérieur du Québec, du Canada et de la Suisse, principalement aux États-Unis. Avant tout transfert, nous évaluons que les renseignements bénéficieront d'une protection adéquate, comme l'exige la loi.",
      ],
    },
    {
      title: "4. Témoins (cookies)",
      paragraphs: [
        "Nous utilisons uniquement des témoins essentiels : l'un pour te garder connecté, l'autre pour retenir ta langue. Aucun témoin publicitaire ni de suivi.",
      ],
    },
    {
      title: "5. Durée de conservation",
      paragraphs: [
        "Nous conservons tes renseignements tant que ton compte est ouvert. Lorsque tu supprimes ton compte, ton profil, tes préférences, ta liste, tes rappels et tes réglages de notification sont supprimés immédiatement de notre base de données; les copies résiduelles dans les sauvegardes chiffrées sont effacées selon leur rotation normale. Stripe conserve les documents de facturation exigés par la loi. Les journaux du serveur sont conservés peu de temps.",
      ],
    },
    {
      title: "6. Sécurité",
      paragraphs: [
        "Les données sont chiffrées en transit; les mots de passe sont hachés; chaque utilisateur n'a accès qu'à ses propres données; l'accès aux systèmes de production est restreint. Si un incident de confidentialité présente un risque de préjudice sérieux, nous t'aviserons, ainsi que les autorités compétentes, comme l'exige la loi.",
      ],
    },
    {
      title: "7. Tes droits",
      list: [
        "Accéder aux renseignements personnels que nous détenons à ton sujet et en obtenir une copie, y compris dans un format structuré et couramment utilisé.",
        "Faire corriger des renseignements inexacts.",
        "Supprimer ton compte en tout temps dans Réglages → Supprimer mon compte, ou nous le demander.",
        "Retirer ton consentement, par exemple en désactivant les notifications.",
        "Porter plainte auprès d'une autorité de contrôle : la Commission d'accès à l'information du Québec, le Commissariat à la protection de la vie privée du Canada, le Préposé fédéral à la protection des données et à la transparence (PFPDT) en Suisse, ou l'autorité de protection des données de ton pays de l'UE.",
      ],
      paragraphs: [`Pour exercer tes droits, écris à ${C.email}. Nous répondons dans un délai de 30 jours.`],
    },
    {
      title: "8. Mineurs",
      paragraphs: ["FinLens s'adresse aux adultes (18 ans et plus). Nous ne recueillons pas sciemment de renseignements sur des mineurs."],
    },
    {
      title: "9. Responsable et contact",
      paragraphs: [
        `La personne responsable de la protection des renseignements personnels est ${C.privacyOfficer}. Contact : ${C.email} — ${C.name}, ${C.address}.`,
        "Nous t'aviserons de tout changement important à cette politique dans l'app ou par courriel.",
      ],
    },
  ],
};

export const LEGAL = {
  terms: { en: termsEn, fr: termsFr },
  privacy: { en: privacyEn, fr: privacyFr },
} as const;

export type LegalDocKey = keyof typeof LEGAL;
