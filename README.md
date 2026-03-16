# SuperTurnos

Plataforma de turnos online con Next.js y Supabase. Inspirada en TomoTurnos, mejorada.

## Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind
- **Backend/DB:** Supabase (Auth, PostgreSQL, Edge Functions)
- **Pagos:** Stripe / MercadoPago
- **Notificaciones:** WhatsApp API (Twilio / Meta)

## Organización del proyecto

- **[Issues](https://github.com/juliobarbagallo/turnos/issues)** – Tickets TT-1 a TT-11 por Epic
- **[Projects](https://github.com/juliobarbagallo/turnos/projects)** – Tablero Kanban (crear desde la pestaña Projects)

## Sprints

| Sprint | Epics | Tickets |
|--------|-------|--------|
| 1 | Fundamentos | TT-1, TT-2 |
| 2 | Configuración Negocio | TT-3, TT-4 |
| 3 | Motor de Turnos | TT-5, TT-6 |
| 4 | Pagos y Notificaciones | TT-7, TT-8 |
| 5 | Calidad y Extras | TT-9, TT-10, TT-11 |

## Documentación

- [BACKLOG.md](./BACKLOG.md) – Backlog detallado
- [plan.txt](./plan.txt) – Plan original (Gemini)

## Crear GitHub Project (tablero)

1. Ir a https://github.com/juliobarbagallo/turnos
2. Pestaña **Projects** → **New project**
3. Elegir **Board** (Kanban)
4. Nombre: "SuperTurnos"
5. **Add** → **Issues** → vincular los issues del repo

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Desarrollo
npm run dev

# Build
npm run build
```

## Deploy en Vercel

1. Conectar el repo en [vercel.com](https://vercel.com)
2. Agregar variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a `main`

## Estructura del proyecto

```
app/          # App Router (páginas y layouts)
components/   # Componentes React
lib/          # Utilidades, cliente Supabase
hooks/        # Custom hooks
services/     # Servicios y lógica de negocio
```

## Próximos pasos

TT-1 completado. Siguiente: **TT-2: Auth y Roles**.