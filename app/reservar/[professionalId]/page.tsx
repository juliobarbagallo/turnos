import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/BookingFlow";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const metadata = {
  title: "Reservar turno - SuperTurnos",
  description: "Elegí día y horario para tu turno",
};

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ professionalId: string }>;
}) {
  const { professionalId } = await params;
  if (!professionalId || !UUID_RE.test(professionalId)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 pb-28 dark:from-slate-950 dark:to-slate-900 sm:px-6">
      <div className="mx-auto max-w-md">
        <BookingFlow professionalId={professionalId} />
      </div>
    </div>
  );
}
