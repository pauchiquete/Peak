export type CoachPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export const coachPlans: CoachPlan[] = [
  {
    name: "Mensual",
    price: "$1,600",
    period: "1 mes",
    description: "Ideal para comenzar y probar el método con seguimiento real.",
    features: [
      "Rutinas semanales",
      "Seguimiento personalizado",
      "Ajustes según progreso",
      "Acceso a plataforma",
    ],
  },
  {
    name: "Bimestral",
    price: "$2,100",
    period: "2 meses",
    description: "Mejor para construir constancia y notar cambios visibles.",
    features: [
      "8 semanas de entrenamiento",
      "Seguimiento 24/7",
      "Chequeo mensual",
      "Acceso a plataforma",
    ],
    featured: true,
  },
  {
    name: "Trimestral",
    price: "$2,500",
    period: "3 meses",
    description: "La mejor opción para un proceso completo y medible.",
    features: [
      "12 semanas de entrenamiento",
      "Progresión completa",
      "Mayor estructura",
      "Acceso a plataforma",
    ],
  },
];

export const sergioCoachPlans: CoachPlan[] = [
  {
    name: "Mensual",
    price: "$900",
    period: "MXN · 1 mes",
    description: "Un mes de entrenamiento en línea adaptado a tu punto de partida.",
    features: [
      "Plan personalizado desde cuestionario",
      "Videos y explicaciones detalladas",
      "Chat directo 24/7",
      "Ajustes según progreso",
    ],
  },
  {
    name: "Bimestral",
    price: "$1,600",
    period: "MXN · 2 meses",
    description: "Dos meses para construir constancia y avanzar con seguimiento continuo.",
    features: [
      "Plan personalizado desde cuestionario",
      "Videos y explicaciones detalladas",
      "Chat directo 24/7",
      "Ajustes según progreso",
    ],
    featured: true,
  },
  {
    name: "Trimestral",
    price: "$2,100",
    period: "MXN · 3 meses",
    description: "Tres meses de acompañamiento para consolidar tu proceso.",
    features: [
      "Plan personalizado desde cuestionario",
      "Videos y explicaciones detalladas",
      "Chat directo 24/7",
      "Ajustes según progreso",
    ],
  },
];

export function getCoachPlans(coachSlug: string) {
  if (coachSlug === "sergio-gonzales") return sergioCoachPlans;
  if (coachSlug === "sebastian-gonzalez") return coachPlans;
  return [];
}
