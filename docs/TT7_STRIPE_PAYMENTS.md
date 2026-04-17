# TT-7: Seña con Stripe (issue #8)

## Migración Supabase

Aplicar en SQL Editor o vía CLI:

- [`supabase/migrations/20260318120000_appointments_pending_payment_stripe.sql`](../supabase/migrations/20260318120000_appointments_pending_payment_stripe.sql)

Agrega estado `pending_payment` y columna `stripe_checkout_session_id`.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `STRIPE_SECRET_KEY` | Servidor: crear Checkout Session |
| `STRIPE_WEBHOOK_SECRET` | Verificar firma en `POST /api/webhooks/stripe` |
| `NEXT_PUBLIC_SITE_URL` | URLs de éxito/cancel en producción (opcional en dev: se usa `Origin`) |

## Flujo

1. Servicio con **`deposit_amount` > 0** → al confirmar en `/reservar/...` se crea turno `pending_payment` (bloquea el slot) y se redirige a **Stripe Checkout** (ARS).
2. **`deposit_amount` = 0** → turno `confirmed` directo (como antes).
3. Webhook **`checkout.session.completed`** → pasa el turno a `confirmed`.
4. Página **`/reservar/[id]/exito`** tras pago exitoso.

## Webhook en local

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Usá el `whsec_...` que imprime Stripe como `STRIPE_WEBHOOK_SECRET`.

## Webhook en Vercel

Stripe Dashboard → Developers → Webhooks → endpoint `https://tu-dominio/api/webhooks/stripe`, evento `checkout.session.completed`.

## Comprobante

Stripe puede enviar **recibo por email** al pagador si lo activás en el Dashboard (Customer emails / Receipts). No está duplicado en la app en esta versión.

## Criterios issue

- Turno con seña queda confirmado solo tras pago exitoso (webhook).
- Sin Stripe configurado + seña > 0 → error 503 claro.
- `pending_payment` cuenta como ocupado en disponibilidad.
