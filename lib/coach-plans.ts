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
