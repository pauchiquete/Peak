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
    name: "Sergio González",
    role: "Coach",
    age: 34,
    image: "/sergio-gonzales.jpeg",
    imageAlt: "Sergio González entrenando en gimnasio",
    intro:
      "Coach en línea especializado en fuerza, hipertrofia, calistenia, acondicionamiento físico y entrenamiento personalizado.",
    biography: [
      "Sergio suma 10 años como coach y ha acompañado a más de 500 personas de distintos niveles. Su objetivo es que cada cliente entrene con motivación, certeza y una guía clara para empezar, avanzar y mantener el hábito.",
      "Su experiencia como nadador y su participación en Habilidad Física 100 México complementan una formación enfocada en salud, deporte y rendimiento. Cada programa se adapta mediante un cuestionario, videos detallados, contacto directo y ajustes según el progreso.",
    ],
    experience: [
      "10 años como coach",
      "+500 personas acompañadas",
      "Ex atleta de natación",
      "Habilidad Física 100 México",
    ],
    specialties: [
      "Fuerza e hipertrofia",
      "Calistenia",
      "Acondicionamiento físico",
      "Rendimiento deportivo",
      "Entrenamiento personalizado",
    ],
    certifications: [
      "Lic. en Ciencias de la Salud",
      "Lic. en Ciencias del Deporte",
      "Coach IFBB PRO",
      "Docente registrado en la SEP",
    ],
    contact: {
      phoneDisplay: "+52 56 1110 5881",
      whatsapp: "525611105881",
      email: "sergio.ber.gr@gmail.com",
      instagram: "@chechegnzlz",
      instagramUrl: "https://instagram.com/chechegnzlz",
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
