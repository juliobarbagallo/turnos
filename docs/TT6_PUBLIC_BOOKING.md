# TT-6: Reserva pública (mobile-first)

## Rutas

- **Página:** `/reservar/[professionalId]` — `professionalId` es el UUID del usuario profesional (mismo que en Supabase Auth).

## APIs (servidor, service role)

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/api/public/booking-context?professional_id=` | Nombre + lista de servicios |
| POST | `/api/public/bookings` | Crear turno confirmado |
| GET | `/api/availability?...` | Slots (ya existía en TT-5) |

### POST `/api/public/bookings`

Body JSON:

```json
{
  "professional_id": "uuid",
  "service_id": "uuid",
  "date": "YYYY-MM-DD",
  "slot": "HH:MM"
}
```

- `date` y `slot` siguen la misma convención **UTC** que [TT-5](./TT5_API_AVAILABILITY.md).
- Solo se acepta si el `slot` sigue figurando en el resultado actual de disponibilidad (evita doble reserva obvia).

## Profesional

En **Dashboard** aparece el bloque “Link público de reservas” con abrir en nueva pestaña y copiar URL.

## Criterios TT-6

- Vista pública con selector de servicio, día (14 días) y hora.
- Touch targets ≥ 44px, layout pensado para ~375px.
- Tras elegir servicio: día + hora + confirmar en pocos pasos.

## Siguientes mejoras (fuera de TT-6)

- Zona horaria local vs UTC en UI.
- Datos del cliente en `appointments` (email/tel).
- Slug legible en lugar de UUID en la URL.
