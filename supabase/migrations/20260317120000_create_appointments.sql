-- TT-5: turnos ocupados para cálculo de disponibilidad
-- Ejecutar en Supabase SQL Editor si no usás CLI

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT appointment_time_order CHECK (end_at > start_at)
);

CREATE INDEX IF NOT EXISTS idx_appointments_professional_time
  ON public.appointments(professional_id, start_at);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profesional ve sus turnos" ON public.appointments
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Profesional crea sus turnos" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profesional actualiza sus turnos" ON public.appointments
  FOR UPDATE USING (auth.uid() = professional_id);

CREATE POLICY "Profesional elimina sus turnos" ON public.appointments
  FOR DELETE USING (auth.uid() = professional_id);
