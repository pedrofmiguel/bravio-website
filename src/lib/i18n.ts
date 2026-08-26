/**
 * Copy dictionary. Every visible string on the site lives here.
 *
 * Language is a client preference persisted to localStorage rather than a URL
 * segment, so the routes stay /, /story and /contact in both languages. If PT
 * ever needs to rank separately in search, this dictionary is already the hard
 * part: the routes would move to /[lang]/... and read the segment instead.
 *
 * Portuguese is European Portuguese, written formally (o seu / a sua).
 */

export const LANGS = ["en", "pt"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export type Course = { name: string; note: string };
export type ServiceItem = { title: string; body: string; meta: string };

export type Dict = {
  meta: { title: string; description: string };
  nav: {
    home: string;
    story: string;
    contact: string;
    menuOpen: string;
    menuClose: string;
    langLabel: string;
  };
  cta: { book: string; work: string };
  hero: { line1: string; line2: string; sub: string };
  statement: { lines: string[] };
  table: { heading: string; body: string; courses: Course[] };
  services: { label: string; items: ServiceItem[] };
  sourcing: { heading: string; body: string };
  galleryTeaser: { heading: string; body: string };
  contact: {
    label: string;
    heading: string;
    body: string;
    form: {
      name: string;
      email: string;
      phone: string;
      phoneOptional: string;
      date: string;
      guests: string;
      occasion: string;
      occasions: string[];
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
      successTitle: string;
      successBody: string;
      errorGeneric: string;
      again: string;
      required: {
        name: string;
        email: string;
        emailInvalid: string;
        message: string;
      };
    };
  };
  story: {
    heroLine1: string;
    heroLine2: string;
    intro: string;
    chefHeading: string;
    chefBody: string;
    galleryHeading: string;
    galleryBody: string;
  };
  contactPage: {
    heroLine1: string;
    heroLine2: string;
    directHeading: string;
    responseNote: string;
  };
  footer: {
    tagline: string;
    based: string;
    rights: string;
    credits: string;
  };
  a11y: { skip: string; home: string; loading: string };
};

const en: Dict = {
  meta: {
    title: "bravio | Private chef and catering",
    description:
      "Private chef and catering for dinners, celebrations and events. Menus built around your table, cooked in your kitchen.",
  },

  nav: {
    home: "Home",
    story: "Story",
    contact: "Contact",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    langLabel: "Language",
  },

  // One label per intent, reused in the nav, the hero and the footer.
  cta: {
    book: "Book a date",
    work: "See the work",
  },

  hero: {
    line1: "We cook",
    line2: "where you live.",
    sub: "Private chef and catering for dinners, celebrations and events. Menus built around your table, cooked in your kitchen.",
  },

  statement: {
    lines: [
      "A dinner starts long before the night itself.",
      "We learn the room, the people, the reason.",
      "Then we cook something that only makes",
      "sense at your table.",
    ],
  },

  table: {
    heading: "What reaches the table",
    body: "No fixed menu. This is one evening, written for one table and cooked once. Yours will read differently.",
    courses: [
      { name: "Robalo curado", note: "Cured sea bass, citrus, green oil" },
      { name: "Ameijoas", note: "Clams, hand cut pasta, new garlic" },
      { name: "Carabineiro", note: "Scarlet prawn, burnt tomato, bisque" },
      { name: "Polvo lagareiro", note: "Octopus, crushed potato, garlic" },
      { name: "Borrego", note: "Lamb, river mint, young onion" },
      { name: "Costela assada", note: "Slow roast beef rib, charred onion" },
      { name: "Queijo da Serra", note: "Raw sheep cheese, quince, walnut" },
      { name: "Figo assado", note: "Roast fig, olive oil, sheep curd" },
    ],
  },

  services: {
    label: "What we do",
    items: [
      {
        title: "Private dinner",
        body: "One table, one evening. We arrive with everything, cook in your kitchen, serve each course and leave it cleaner than we found it.",
        meta: "2 to 14 guests",
      },
      {
        title: "Celebration catering",
        body: "Baptisms, birthdays, weddings at home. Full service from the first delivery to the last plate cleared, with a team we have worked with for years.",
        meta: "up to 120 guests",
      },
      {
        title: "Chef in residence",
        body: "A chef with you for a weekend or a season. Villas, boats and second homes, cooking every meal or only the ones that matter.",
        meta: "by arrangement",
      },
    ],
  },

  sourcing: {
    heading: "We buy small.",
    body: "Boats out of Sesimbra, growers in the Oeste, a cheese room in Seia. The list of suppliers is short because we only buy what we would put on our own table.",
  },

  galleryTeaser: {
    heading: "Evenings we have cooked",
    body: "Private houses, quintas and terraces across the country.",
  },

  contact: {
    label: "Enquiries",
    heading: "Tell us about the night.",
    body: "Send us the date, the number of people and anything that matters. We answer every enquiry personally, usually within a day.",
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      phoneOptional: "optional",
      date: "Date of the event",
      guests: "Guests",
      occasion: "Occasion",
      occasions: [
        "Private dinner",
        "Celebration catering",
        "Chef in residence",
        "Something else",
      ],
      message: "Tell us about it",
      messagePlaceholder:
        "The room, the people, anything you already know you want on the table.",
      submit: "Send enquiry",
      sending: "Sending",
      successTitle: "Thank you.",
      successBody:
        "Your enquiry is with us. We will come back to you personally, usually within a day.",
      errorGeneric:
        "Something went wrong at our end. Please try again, or write to us directly.",
      again: "Send another enquiry",
      required: {
        name: "Please tell us your name.",
        email: "Please add an email so we can reply.",
        emailInvalid: "That email address does not look right.",
        message: "Please tell us a little about the night.",
      },
    },
  },

  story: {
    heroLine1: "Cooking is",
    heroLine2: "the easy part.",
    intro:
      "bravio is a private chef and catering kitchen working out of Lisbon. We cook in other people's homes, which makes the food only half the job. The other half is reading a room and disappearing into it.",
    chefHeading: "In the kitchen",
    chefBody:
      "Years in restaurant kitchens taught us how to cook. Cooking in houses taught us the rest: how to work quietly around a party, how to time a course to a conversation, how to leave a kitchen the way we found it.",
    galleryHeading: "Selected evenings",
    galleryBody: "A working archive. Private houses, quintas and terraces.",
  },

  contactPage: {
    heroLine1: "Let us talk",
    heroLine2: "about the date.",
    directHeading: "Direct",
    responseNote:
      "We answer every enquiry personally, usually within a day.",
  },

  footer: {
    tagline: "Private chef and catering",
    based: "Lisbon, Portugal",
    rights: "All rights reserved.",
    credits: "Site by",
  },

  a11y: {
    skip: "Skip to content",
    home: "bravio, back to home",
    loading: "Loading",
  },
};

const pt: Dict = {
  meta: {
    title: "bravio | Chef privado e catering",
    description:
      "Chef privado e catering para jantares, celebrações e eventos. Menus criados à volta da sua mesa, cozinhados na sua cozinha.",
  },

  nav: {
    home: "Início",
    story: "História",
    contact: "Contacto",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    langLabel: "Idioma",
  },

  cta: {
    book: "Reservar data",
    work: "Ver o trabalho",
  },

  hero: {
    line1: "Cozinhamos",
    line2: "onde vive.",
    sub: "Chef privado e catering para jantares, celebrações e eventos. Menus criados à volta da sua mesa, cozinhados na sua cozinha.",
  },

  statement: {
    lines: [
      "Um jantar começa muito antes da própria noite.",
      "Conhecemos a sala, as pessoas, o motivo.",
      "Depois cozinhamos algo que só faz",
      "sentido à sua mesa.",
    ],
  },

  table: {
    heading: "O que chega à mesa",
    body: "Sem menu fixo. Isto foi uma noite, escrita para uma mesa e cozinhada uma só vez. A sua será outra.",
    courses: [
      { name: "Robalo curado", note: "Robalo curado, citrinos, azeite verde" },
      { name: "Ameijoas", note: "Ameijoas, massa fresca, alho novo" },
      { name: "Carabineiro", note: "Carabineiro, tomate queimado, bisque" },
      { name: "Polvo lagareiro", note: "Polvo, batata a murro, alho" },
      { name: "Borrego", note: "Borrego, hortelã da ribeira, cebola nova" },
      { name: "Costela assada", note: "Costela de vaca assada, cebola queimada" },
      { name: "Queijo da Serra", note: "Queijo de ovelha cru, marmelo, noz" },
      { name: "Figo assado", note: "Figo assado, azeite, requeijão de ovelha" },
    ],
  },

  services: {
    label: "O que fazemos",
    items: [
      {
        title: "Jantar privado",
        body: "Uma mesa, uma noite. Chegamos com tudo, cozinhamos na sua cozinha, servimos cada prato e deixamos tudo mais limpo do que encontrámos.",
        meta: "2 a 14 pessoas",
      },
      {
        title: "Catering de celebração",
        body: "Batizados, aniversários, casamentos em casa. Serviço completo da primeira entrega ao último prato levantado, com uma equipa que trabalha connosco há anos.",
        meta: "até 120 pessoas",
      },
      {
        title: "Chef em residência",
        body: "Um chef consigo durante um fim de semana ou uma estação. Casas de férias, barcos e segundas casas, cozinhando todas as refeições ou apenas as que contam.",
        meta: "sob consulta",
      },
    ],
  },

  sourcing: {
    heading: "Compramos pouco.",
    body: "Barcos de Sesimbra, produtores no Oeste, uma queijaria em Seia. A lista de fornecedores é curta porque só compramos o que poríamos na nossa própria mesa.",
  },

  galleryTeaser: {
    heading: "Noites que cozinhámos",
    body: "Casas particulares, quintas e terraços por todo o país.",
  },

  contact: {
    label: "Pedidos",
    heading: "Conte-nos sobre a noite.",
    body: "Envie a data, o número de pessoas e tudo o que for importante. Respondemos pessoalmente a todos os pedidos, normalmente dentro de um dia.",
    form: {
      name: "Nome",
      email: "Email",
      phone: "Telemóvel",
      phoneOptional: "opcional",
      date: "Data do evento",
      guests: "Pessoas",
      occasion: "Ocasião",
      occasions: [
        "Jantar privado",
        "Catering de celebração",
        "Chef em residência",
        "Outra coisa",
      ],
      message: "Conte-nos mais",
      messagePlaceholder:
        "A sala, as pessoas, o que já sabe que quer ver na mesa.",
      submit: "Enviar pedido",
      sending: "A enviar",
      successTitle: "Obrigado.",
      successBody:
        "Recebemos o seu pedido. Voltaremos ao seu contacto pessoalmente, normalmente dentro de um dia.",
      errorGeneric:
        "Algo correu mal do nosso lado. Tente novamente, ou escreva-nos diretamente.",
      again: "Enviar outro pedido",
      required: {
        name: "Diga-nos o seu nome.",
        email: "Indique um email para lhe respondermos.",
        emailInvalid: "Esse email não parece estar correto.",
        message: "Conte-nos um pouco sobre a noite.",
      },
    },
  },

  story: {
    heroLine1: "Cozinhar é",
    heroLine2: "a parte fácil.",
    intro:
      "A bravio é uma cozinha de chef privado e catering sediada em Lisboa. Cozinhamos em casa dos outros, o que faz da comida apenas metade do trabalho. A outra metade é ler uma sala e desaparecer dentro dela.",
    chefHeading: "Na cozinha",
    chefBody:
      "Anos em cozinhas de restaurante ensinaram-nos a cozinhar. Cozinhar em casas ensinou-nos o resto: trabalhar em silêncio à volta de uma festa, acertar o tempo de um prato ao tempo de uma conversa, deixar a cozinha como a encontrámos.",
    galleryHeading: "Noites selecionadas",
    galleryBody: "Um arquivo de trabalho. Casas particulares, quintas e terraços.",
  },

  contactPage: {
    heroLine1: "Vamos falar",
    heroLine2: "sobre a data.",
    directHeading: "Direto",
    responseNote:
      "Respondemos pessoalmente a todos os pedidos, normalmente dentro de um dia.",
  },

  footer: {
    tagline: "Chef privado e catering",
    based: "Lisboa, Portugal",
    rights: "Todos os direitos reservados.",
    credits: "Site por",
  },

  a11y: {
    skip: "Saltar para o conteúdo",
    home: "bravio, voltar ao início",
    loading: "A carregar",
  },
};

export const DICT: Record<Lang, Dict> = { en, pt };

/**
 * Contact details. These are placeholders: swap them for the real inbox and
 * number before launch. The contact form posts to /api/contact, which reads
 * the destination from the CONTACT_TO environment variable.
 */
export const CONTACT_DETAILS = {
  email: "hello@bravio.pt",
  phone: "+351 912 000 000",
  instagram: "@weare.bravio",
  instagramUrl: "https://instagram.com/weare.bravio",
};
