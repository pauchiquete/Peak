import ContactExperience from "@/components/contact/ContactExperience";
import { coachPlans } from "@/lib/coach-plans";
import { getCoachBySlug } from "@/lib/coaches";

type ContactPageProps = {
  searchParams: Promise<{
    coach?: string | string[];
    plan?: string | string[];
  }>;
};

export default async function ContactoPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const requestedCoach = Array.isArray(params.coach)
    ? params.coach[0]
    : params.coach;
  const initialCoach = requestedCoach
    ? getCoachBySlug(requestedCoach)
    : undefined;
  const requestedPlan = Array.isArray(params.plan)
    ? params.plan[0]
    : params.plan;
  const initialPlan = coachPlans.find(
    (plan) => plan.name === requestedPlan
  )?.name;

  return (
    <ContactExperience
      key={`${initialCoach?.slug ?? "default"}:${initialPlan ?? "none"}`}
      initialCoachSlug={initialCoach?.slug ?? null}
      initialPlan={initialPlan ?? null}
    />
  );
}
