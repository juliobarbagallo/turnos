import { SupabaseStatus } from "@/components/SupabaseStatus";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 dark:from-slate-950 dark:to-slate-900">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          SuperTurnos
        </h1>
        <p className="text-2xl font-medium text-slate-600 dark:text-slate-400">
          Próximamente
        </p>
        <p className="max-w-md text-slate-500 dark:text-slate-500">
          Plataforma de turnos online para estudios de Pilates y centros de
          bienestar. Next.js + Supabase.
        </p>
        <SupabaseStatus />
      </main>
    </div>
  );
}
