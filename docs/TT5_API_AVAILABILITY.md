# TT-5: API de disponibilidad

## Migración

Ejecutá el SQL en **Supabase → SQL Editor** (o `supabase db push`):

- [`supabase/migrations/20260317120000_create_appointments.sql`](../supabase/migrations/20260317120000_create_appointments.sql)

Crea la tabla `appointments` (turnos ocupados). Sin filas, todos los huecos dentro del horario del día quedan libres.

## Variable de entorno

`SUPABASE_SERVICE_ROLE_KEY` — la **service role** del proyecto (no exponer al cliente). Configurar en `.env.local` y en Vercel.

## Endpoint

`GET /api/availability?professional_id=<uuid>&service_id=<uuid>&date=YYYY-MM-DD`

### Respuesta

```json
{
  "slots": ["09:00", "09:15", "09:30"],
  "date": "2026-03-20",
  "duration_minutes": 30,
  "step_minutes": 15
}
```

- `slots`: horarios de **inicio** posibles (caben `duration_minutes` completos dentro del horario y sin solapar turnos `confirmed`/`pending`).
- `date` se interpreta en **UTC** para el día de la semana (alineado con `business_hours.day_of_week`).
- Días pasados: `slots: []`.
- Hoy: no se devuelven slots que ya pasaron (minuto actual, UTC).

## Criterios TT-5

- Array de horarios disponibles.
- Sin slots en el pasado (para la fecha pedida).
- Un servicio de 60 min solo genera inicios donde quepan 60 minutos continuos libres (no “medio hueco” de 30 min).
