export type Coach = {
  slug: string;
  name: string;
  role: "Head Coach" | "Coach";
  age: number | null;
  image: string | null;
  imageAlt: string;
  intro: string;
  biography: string[];
  experience: string[];
  specialties: string[];
  certifications: string[];
  contact: {
    phoneDisplay: string;
    whatsapp: string;
    email: string | null;
    instagram: string | null;
    instagramUrl: string | null;
  };
};

export const coaches: Coach[] = [
  {
    slug: "sebastian-gonzalez",
    name: "Sebastián González",
    role: "Head Coach",
    age: null,
    image: "/coach2.jpeg",
    imageAlt: "Sebastián González entrenando con una mancuerna",
    intro:
      "Ex atleta de alto rendimiento y entrenador especializado en hipertrofia, calistenia y rendimiento físico.",
    biography: [
      "Sebastián fue atleta de alto rendimiento representando a México en natación. Hoy usa esa experiencia para ayudar a personas reales a mejorar su físico, su salud y su confianza.",
      "Su enfoque combina hipertrofia, calistenia, entrenamiento híbrido y rendimiento deportivo. El objetivo no es solo entrenar más fuerte, sino entrenar con guía certificada.",
    ],
    experience: [
      "+7 años entrenando personas",
      "+280 clientes entrenados",
      "Ex atleta de alto rendimiento",
    ],
    specialties: [
      "Hipertrofia",
      "Calistenia",
      "Entrenamiento híbrido",
      "Rendimiento deportivo",
    ],
    certifications: ["IFBB PRO", "ISSA", "Calisthenics Kings", "SEP"],
    contact: {
      phoneDisplay: "+52 55 4879 2525",
      whatsapp: "525548792525",
      email: "sebgnzlzram@gmail.com",
      instagram: "@sebglezcoach",
      instagramUrl: "https://instagram.com/sebglezcoach",
    },
  },
  {
    slug: "sergio-gonzales",
    name: "Sergio Gonzales",
    role: "Coach",
    age: 34,
    image: "/sergio-gonzales.jpeg",
    imageAlt: "Sergio Gonzales entrenando en gimnasio",
    intro:
      "Ex atleta de natación y coach de fuerza, acondicionamiento y rendimiento. Recientemente participó en el reality deportivo Los 100.",
    biography: [
      "Sergio Gonzales tiene 34 años y construyó su disciplina dentro de la natación competitiva. Esa experiencia como atleta hoy forma parte de su manera de acompañar cada proceso: con técnica, constancia y objetivos claros.",
      "Cuenta con formación y certificaciones afines al estándar técnico del equipo Peak. Su participación reciente en el reality deportivo Los 100 reforzó su experiencia en pruebas de fuerza, resistencia y desempeño bajo presión.",
      "Sus programas combinan trabajo de fuerza, hipertrofia y acondicionamiento físico, siempre adaptados al nivel, historial y metas de cada persona.",
    ],
    experience: [
      "34 años",
      "Ex atleta de natación",
      "Participante en Los 100",
      "Entrenamiento personalizado",
    ],
    specialties: [
      "Fuerza e hipertrofia",
      "Acondicionamiento físico",
      "Rendimiento deportivo",
      "Entrenamiento personalizado",
    ],
    certifications: [
      "Entrenador certificado",
      "Formación técnica bajo el estándar Peak",
    ],
    contact: {
      phoneDisplay: "+52 56 1110 5881",
      whatsapp: "525611105881",
      email: null,
      instagram: null,
      instagramUrl: null,
    },
  },
  {
    slug: "fatima-bastida",
    name: "Fátima Bastida",
    role: "Coach",
    age: 26,
    image: "/fabastida.png",
    imageAlt: "Fátima Bastida impartiendo una sesión de Pilates Reformer",
    intro:
      "Coach de Mat Pilates y Pilates Reformer con un enfoque centrado en movilidad, fuerza y control corporal.",
    biography: [
      "Fátima diseña sesiones de Pilates adaptadas al nivel, las necesidades y los objetivos de cada persona.",
      "Su enfoque integra movilidad, fuerza y control corporal para construir una práctica consciente, progresiva y sostenible.",
    ],
    experience: [
      "Mat Pilates y Reformer",
      "Entrenamiento adaptado",
      "Movilidad y control corporal",
    ],
    specialties: [
      "Mat Pilates",
      "Pilates Reformer",
      "Movilidad",
      "Control corporal",
    ],
    certifications: [],
    contact: {
      phoneDisplay: "+52 55 6803 0748",
      whatsapp: "525568030748",
      email: null,
      instagram: null,
      instagramUrl: null,
    },
  },
];

export const headCoach = coaches[0];

export function getCoachBySlug(slug: string) {
  return coaches.find((coach) => coach.slug === slug);
}
