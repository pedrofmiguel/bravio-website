import type { Lang } from "./i18n";

/**
 * Cookie policy copy, in both languages.
 *
 * Kept out of the main dictionary because it is a document rather than
 * interface copy, and long enough to drown everything else in i18n.ts.
 *
 * Some passages only apply when Google Analytics is configured. They carry
 * `when`, and CookiePolicyContent drops whichever side does not match the
 * build, so the page never describes a tracker the site is not running - or
 * leaves out one it is.
 *
 * Paragraphs can carry tokens that the page fills in:
 *   {email}   the contact address, as a link
 *
 * Bump `updated` whenever the substance changes. The page promises to.
 */

export type Condition = "analytics" | "no-analytics";

export type Block =
  | { kind: "p"; text: string; when?: Condition }
  | { kind: "storage" }
  | { kind: "cookie-settings"; when?: Condition };

export type PolicySection = { id: string; title: string; blocks: Block[]; when?: Condition };

export type StorageRow = {
  name: string;
  where: string;
  purpose: string;
  duration: string;
  kind: string;
  when?: Condition;
};

export type PolicyCopy = {
  meta: { title: string; description: string };
  eyebrow: string;
  heroLine1: string;
  heroLine2: string;
  updatedLabel: string;
  updated: string;
  summary: Record<Condition, string>;
  contentsLabel: string;
  storageHeaders: { name: string; purpose: string; duration: string };
  storage: StorageRow[];
  cookieSettings: string;
  sections: PolicySection[];
};

const en: PolicyCopy = {
  meta: {
    title: "Cookie policy",
    description: "What the bravio website keeps in your browser, why, and for how long.",
  },
  eyebrow: "Cookie policy",
  heroLine1: "What we keep,",
  heroLine2: "and why.",
  updatedLabel: "Last updated",
  updated: "25 November 2026",
  summary: {
    "no-analytics":
      "The short version: the site keeps only what it needs to work. No analytics, no advertising, nothing to accept.",
    analytics:
      "The short version: the site keeps only what it needs to work. Analytics cookies are set only if you accept them, and you can change your mind at any time.",
  },
  contentsLabel: "On this page",
  storageHeaders: { name: "Name", purpose: "Purpose", duration: "Duration" },
  storage: [
    {
      name: "bravio.lang",
      where: "Local storage",
      purpose: "Remembers the language you chose.",
      duration: "Until you clear it",
      kind: "Essential",
    },
    {
      name: "bravio.intro-seen",
      where: "Session storage",
      purpose: "Plays the opening animation only once per visit.",
      duration: "Until you close the tab",
      kind: "Essential",
    },
    {
      name: "bravio.consent",
      where: "Local storage",
      purpose: "Remembers your answer to the cookie question.",
      duration: "6 months",
      kind: "Essential",
      when: "analytics",
    },
    {
      name: "KP_…",
      where: "Cookies",
      purpose:
        "Part of the security check that tells people from automated spam on the enquiry form (Vercel BotID). May be set when you use the form.",
      duration: "Set by the provider",
      kind: "Essential",
    },
    {
      name: "_ga, _ga_…",
      where: "Cookies",
      purpose: "Google Analytics. Tells visits apart so they can be counted.",
      duration: "13 months",
      kind: "Analytics, only if you accept",
      when: "analytics",
    },
  ],
  cookieSettings: "Change cookie settings",
  sections: [
    {
      id: "what-we-keep",
      title: "Cookies and browser storage",
      blocks: [
        {
          kind: "p",
          text: "The site stores only what it needs to work. It does not use analytics or advertising cookies, so there is nothing to accept or decline.",
          when: "no-analytics",
        },
        {
          kind: "p",
          text: "The site stores what it needs to work, which does not need your consent. Analytics cookies are different: they are set only if you accept them, and you can change your mind at any time.",
          when: "analytics",
        },
        { kind: "storage" },
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      when: "analytics",
      blocks: [
        {
          kind: "p",
          text: "If you accept, the site loads Google Analytics, provided by Google Ireland Limited, to understand how the site is used: the pages viewed, how long they were open, the type of device and an approximate location at city level. Nothing from Google loads before you accept, and if you decline it does not load at all.",
        },
        {
          kind: "p",
          text: "Google may process this data in the United States. That transfer relies on the safeguards the GDPR provides: the EU-US Data Privacy Framework, or the European Commission's standard contractual clauses. Analytics data is deleted automatically after 14 months at most.",
        },
      ],
    },
    {
      id: "your-choices",
      title: "Your choices",
      blocks: [
        {
          kind: "p",
          text: "You can change your answer at any time, here or from Cookie settings at the bottom of every page. Declining also removes the analytics cookies already set.",
          when: "analytics",
        },
        { kind: "cookie-settings", when: "analytics" },
        {
          kind: "p",
          text: "You can also clear or block cookies and site data in your browser settings. The site will forget your language if you do, and blocking cookies entirely may stop the enquiry form from sending, since its security check relies on one.",
        },
      ],
    },
    {
      id: "questions",
      title: "Questions",
      blocks: [{ kind: "p", text: "For anything about cookies on this site, write to {email}." }],
    },
    {
      id: "changes",
      title: "Changes to this page",
      blocks: [
        {
          kind: "p",
          text: "If we change what the site stores, we will update this page and the date at the top of it.",
        },
      ],
    },
  ],
};

const pt: PolicyCopy = {
  meta: {
    title: "Política de cookies",
    description: "O que o site do bravio guarda no seu navegador, porquê e durante quanto tempo.",
  },
  eyebrow: "Política de cookies",
  heroLine1: "O que guardamos,",
  heroLine2: "e porquê.",
  updatedLabel: "Última atualização",
  updated: "25 de novembro de 2026",
  summary: {
    "no-analytics":
      "Em resumo: o site guarda apenas o que precisa para funcionar. Sem análise de utilização, sem publicidade, nada para aceitar.",
    analytics:
      "Em resumo: o site guarda apenas o que precisa para funcionar. Os cookies de análise só são definidos se os aceitar, e pode mudar de ideias a qualquer momento.",
  },
  contentsLabel: "Nesta página",
  storageHeaders: { name: "Nome", purpose: "Finalidade", duration: "Duração" },
  storage: [
    {
      name: "bravio.lang",
      where: "Armazenamento local",
      purpose: "Lembra o idioma que escolheu.",
      duration: "Até o apagar",
      kind: "Essencial",
    },
    {
      name: "bravio.intro-seen",
      where: "Armazenamento de sessão",
      purpose: "Mostra a animação de abertura apenas uma vez por visita.",
      duration: "Até fechar o separador",
      kind: "Essencial",
    },
    {
      name: "bravio.consent",
      where: "Armazenamento local",
      purpose: "Lembra a sua resposta sobre cookies.",
      duration: "6 meses",
      kind: "Essencial",
      when: "analytics",
    },
    {
      name: "KP_…",
      where: "Cookies",
      purpose:
        "Parte da verificação de segurança que distingue pessoas de spam automático no formulário de pedidos (Vercel BotID). Pode ser definido quando usa o formulário.",
      duration: "Definida pelo fornecedor",
      kind: "Essencial",
    },
    {
      name: "_ga, _ga_…",
      where: "Cookies",
      purpose: "Google Analytics. Distingue visitas para as poder contar.",
      duration: "13 meses",
      kind: "Análise, apenas se aceitar",
      when: "analytics",
    },
  ],
  cookieSettings: "Alterar definições de cookies",
  sections: [
    {
      id: "what-we-keep",
      title: "Cookies e armazenamento no navegador",
      blocks: [
        {
          kind: "p",
          text: "O site guarda apenas o que precisa para funcionar. Não usa cookies de análise nem de publicidade, por isso não há nada para aceitar ou recusar.",
          when: "no-analytics",
        },
        {
          kind: "p",
          text: "O site guarda o que precisa para funcionar, o que não requer o seu consentimento. Os cookies de análise são diferentes: só são definidos se os aceitar, e pode mudar de ideias a qualquer momento.",
          when: "analytics",
        },
        { kind: "storage" },
      ],
    },
    {
      id: "analytics",
      title: "Análise de utilização",
      when: "analytics",
      blocks: [
        {
          kind: "p",
          text: "Se aceitar, o site carrega o Google Analytics, fornecido pela Google Ireland Limited, para perceber como o site é usado: as páginas vistas, quanto tempo estiveram abertas, o tipo de dispositivo e uma localização aproximada, ao nível da cidade. Nada da Google é carregado antes de aceitar, e se recusar não é carregado de todo.",
        },
        {
          kind: "p",
          text: "A Google pode tratar estes dados nos Estados Unidos. Essa transferência assenta nas garantias previstas no RGPD: o Quadro de Privacidade de Dados UE-EUA, ou as cláusulas contratuais-tipo da Comissão Europeia. Os dados de análise são apagados automaticamente ao fim de, no máximo, 14 meses.",
        },
      ],
    },
    {
      id: "your-choices",
      title: "As suas escolhas",
      blocks: [
        {
          kind: "p",
          text: "Pode mudar a sua resposta a qualquer momento, aqui ou em Definições de cookies, no fundo de cada página. Ao recusar, os cookies de análise já definidos são também apagados.",
          when: "analytics",
        },
        { kind: "cookie-settings", when: "analytics" },
        {
          kind: "p",
          text: "Pode também apagar ou bloquear os cookies e os dados do site nas definições do seu navegador. Se o fizer, o site esquece o idioma que escolheu, e bloquear todos os cookies pode impedir o envio do formulário de pedidos, cuja verificação de segurança depende de um deles.",
        },
      ],
    },
    {
      id: "questions",
      title: "Questões",
      blocks: [
        {
          kind: "p",
          text: "Para qualquer questão sobre os cookies deste site, escreva para {email}.",
        },
      ],
    },
    {
      id: "changes",
      title: "Alterações a esta página",
      blocks: [
        {
          kind: "p",
          text: "Se mudarmos o que o site guarda, atualizaremos esta página e a data no topo.",
        },
      ],
    },
  ],
};

export const COOKIE_POLICY: Record<Lang, PolicyCopy> = { en, pt };
