-- TT-7: estado pending_payment + id de sesión Stripe para webhook
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (
    status IN (
      'confirmed',
      'cancelled',
      'pending',
      'pending_payment'
    )
  );

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

CREATE INDEX IF NOT EXISTS idx_appointments_stripe_session
  ON public.appointments (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
