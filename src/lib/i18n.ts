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

export type ServiceItem = { title: string; body: string; meta?: string };

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
  hero: { line1: string; line2: string; sub: string; cta: string };
  statement: { lines: string[] };
  services: { label: string; items: ServiceItem[] };
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
      location: string;
      locationHint: string;
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
      "Private chef and catering for weddings, celebrations and events. Menus built around your table, cooked in your kitchen.",
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
    line1: "No fixed address.",
    line2: "Cooking without limits.",
    sub: "Private chef for celebrations and events. Menus built around your table, cooked in your kitchen.",
    cta: "Reserve your date",
  },

  statement: {
    lines: [
      "An experience begins long before you reach the table.",
      "We learn the room, the people, the reason. Then we cook something that only",
      "makes sense at your table.",
    ],
  },


  services: {
    label: "What we do",
    items: [
      {
        title: "Private dinner",
        body: "One table, one evening. We arrive with everything, cook in your kitchen, serve each course and take care of every last detail.",
        meta: "2 to 14 guests",
      },
      {
        title: "Celebration catering",
        body: "Weddings, baptisms, birthdays and other special occasions. We handle everything, from the first delivery to the last plate, with a team dedicated to every detail of the celebration.",
      },
      {
        title: "Chef in residence",
        body: "A chef with you for a weekend, a week or a season. In your home, on your boat or wherever you choose to be. Every meal, or only the ones worth remembering.",
        meta: "by arrangement",
      },
    ],
  },


  galleryTeaser: {
    heading: "Evenings we have cooked",
    body: "Private houses, quintas and terraces across the country.",
  },

  contact: {
    label: "Enquiries",
    heading: "Tell us about the celebration.",
    body: "Send us the date, the number of people and anything that matters. We answer every enquiry personally, usually within a day.",
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      phoneOptional: "optional",
      date: "Date of the event",
      location: "Location",
      locationHint: "town or venue",
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
        message: "Please tell us a little about the celebration.",
      },
    },
  },

  story: {
    heroLine1: "Cooking is",
    heroLine2: "the easy part.",
    intro:
      "bravio is a private chef and events kitchen based in Porto - founded by Rafa and João. We bring the kitchen to where things happen. Because the food is only half the job. The other half is reading a room, knowing who is at the table, knowing when to fill the space and when to disappear into it.",
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
    based: "Porto, Portugal",
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
      "Chef privado e catering para casamentos, celebrações e eventos. Menus criados à volta da sua mesa, cozinhados na sua cozinha.",
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
    line1: "Sem morada.",
    line2: "Cozinha sem limites.",
    sub: "Chef privado para celebrações e eventos. Menus criados à volta da sua mesa, cozinhados na sua cozinha.",
    cta: "Reserve a sua data",
  },

  statement: {
    lines: [
      "Uma experiência começa muito antes de chegar à mesa.",
      "Conhecemos a sala, as pessoas, o motivo. Depois, cozinhamos algo que só faz",
      "sentido à sua mesa.",
    ],
  },


  services: {
    label: "O que fazemos",
    items: [
      {
        title: "Jantar privado",
        body: "Uma mesa, uma noite. Chegamos com tudo, cozinhamos na sua cozinha, servimos cada prato e cuidamos de tudo até ao último detalhe.",
        meta: "2 a 14 pessoas",
      },
      {
        title: "Catering de celebração",
        body: "Casamentos, batizados, aniversários e outras ocasiões especiais. Tratamos de tudo, da primeira entrega ao último prato, com uma equipa dedicada a cada detalhe da celebração.",
      },
      {
        title: "Chef em residência",
        body: "Um chef consigo durante um fim de semana, uma semana ou uma estação. Na sua casa, no seu barco ou onde escolher estar. Todas as refeições, ou apenas aquelas que merecem ser lembradas.",
        meta: "sob consulta",
      },
    ],
  },


  galleryTeaser: {
    heading: "Noites que cozinhámos",
    body: "Casas particulares, quintas e terraços por todo o país.",
  },

  contact: {
    label: "Pedidos",
    heading: "Conte-nos sobre a celebração.",
    body: "Envie a data, o número de pessoas e tudo o que for importante. Respondemos pessoalmente a todos os pedidos, normalmente dentro de um dia.",
    form: {
      name: "Nome",
      email: "Email",
      phone: "Telemóvel",
      phoneOptional: "opcional",
      date: "Data do evento",
      location: "Local",
      locationHint: "localidade ou espaço",
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
        message: "Conte-nos um pouco sobre a celebração.",
      },
    },
  },

  story: {
    heroLine1: "Cozinhar é",
    heroLine2: "a parte fácil.",
    intro:
      "O bravio é uma cozinha de chef privado e eventos, sediada no Porto - fundada pelo Rafa e pelo João. Levamos a cozinha até onde as coisas acontecem. Porque a comida é apenas metade do trabalho. A outra metade é ler uma sala, perceber quem está à mesa, saber quando ocupar o espaço e quando desaparecer dentro dele.",
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
    based: "Porto, Portugal",
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
 * Contact details. The email and phone are live. The phone is spaced for
 * display; the tel: links strip the spaces at the call site, so keep the
 * format readable here. The contact form posts to /api/contact, which reads
 * the destination from the CONTACT_TO environment variable.
 */
export const CONTACT_DETAILS = {
  email: "hello@wearebravio.pt",
  phone: "+351 939 474 126",
  instagram: "@weare.bravio",
  instagramUrl: "https://instagram.com/weare.bravio",
};
