# 📅 Backlog de Desarrollo: "SuperTurnos" (Next-Gen TomoTurnos)

## Epic 1: Infraestructura y Auth (Fundamentos)

### [TT-1] Configuración del Entorno y Arquitectura Base
**Descripción:** Inicializar el proyecto con las tecnologías core para asegurar escalabilidad.
**Tareas:**
- Setup de Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- Configurar `supabase-js` y variables de entorno.
- Crear estructura de carpetas: `/components`, `/lib`, `/hooks`, `/services`.
**Criterios de Aceptación:**
- [ ] El proyecto compila sin errores.
- [ ] Landing page básica desplegada en Vercel.
- [ ] Conexión exitosa con Supabase verificada en consola.

### [TT-2] Autenticación de Usuarios (Auth v1)
**Descripción:** Implementar el flujo de ingreso para Profesionales y Clientes.
**Tareas:**
- Configurar Supabase Auth (Email/Magic Link).
- Crear tabla `profiles` con campos: `id, email, full_name, role (admin/customer)`.
- Middleware para proteger rutas `/dashboard/*`.
**Criterios de Aceptación:**
- [ ] Registro e inicio de sesión funcional.
- [ ] El sistema distingue entre un Profesional y un Cliente al loguear.

---

## Epic 2: Configuración del Negocio

### [TT-3] CRUD de Servicios y Perfil
**Descripción:** Permitir al profesional definir qué ofrece.
**Tareas:**
- Crear tabla `services`: `id, user_id, name, duration_minutes, price, deposit_amount`.
- UI para crear/editar servicios.
**Criterios de Aceptación:**
- [ ] El profesional puede guardar al menos un servicio (ej: "Corte Barba - 30 min").
- [ ] Validaciones de campos obligatorios activas.

### [TT-4] Motor de Disponibilidad Horaria
**Descripción:** Configuración de la agenda semanal del profesional.
**Tareas:**
- Crear tabla `business_hours`: `day_of_week, start_time, end_time, is_closed`.
- UI de "Horarios de Atención".
**Criterios de Aceptación:**
- [ ] El profesional puede marcar días como no laborables.
- [ ] Soporte para rangos partidos (ej: 09:00-12:00 y 16:00-20:00).

---

## Epic 3: El Motor de Turnos (Core UX)

### [TT-5] Algoritmo de Generación de Slots Libres
**Descripción:** Lógica de backend para calcular huecos disponibles.
**Tareas:**
- Crear Edge Function o API Route `/api/availability`.
- Lógica: `Horas de atención` - `Turnos ocupados` = `Slots disponibles`.
**Criterios de Aceptación:**
- [ ] La API devuelve un array de horarios disponibles basados en la duración del servicio seleccionado.
- [ ] No se muestran turnos en el pasado.

### [TT-6] Flujo de Reserva Mobile-First
**Descripción:** Interfaz de usuario para que el cliente final reserve.
**Tareas:**
- Vista pública del calendario.
- Selector de día y hora con feedback instantáneo.
**Criterios de Aceptación:**
- [ ] Reserva completada en menos de 3 clics tras elegir el servicio.
- [ ] Responsive 100% en pantallas menores a 375px.

---

## Epic 4: Monetización y Retención

### [TT-7] Integración de Pasarela de Pagos (Señas)
**Descripción:** Implementar cobro preventivo para evitar cancelaciones.
**Tareas:**
- Integrar SDK de Mercado Pago o Stripe.
- Webhook para actualizar estado del turno de `pending_payment` a `confirmed`.
**Criterios de Aceptación:**
- [ ] El turno solo se confirma si el pago es exitoso.
- [ ] El cliente recibe comprobante de pago.

### [TT-8] Notificaciones Automáticas (WhatsApp/SMS)
**Descripción:** Recordatorios automáticos para reducir el No-Show.
**Tareas:**
- Conectar con API de WhatsApp (Twilio o similar).
- Configurar CRON job para avisos 2 horas antes de la cita.
**Criterios de Aceptación:**
- [ ] Envío de mensaje al confirmar reserva.
- [ ] Envío de recordatorio automático sin intervención humana.

---

## Epic 5: Plus de Calidad y PWA

### [TT-9] Configuración PWA (Instalable)
**Descripción:** Convertir la web en una App para iOS/Android.
**Tareas:**
- Configurar next-pwa y manifest.json.
- Crear iconos para diferentes densidades de pantalla.
**Criterios de Aceptación:**
- [ ] El navegador ofrece "Instalar en pantalla de inicio".
- [ ] Funciona en modo pantalla completa (sin barra de navegador).

### [TT-10] Dashboard de IA y Optimización
**Descripción:** Sugerencias inteligentes para el profesional.
**Tareas:**
- Analizar huecos vacíos y proponer "Ofertas Relámpago" vía push.
**Criterios de Aceptación:**
- [ ] El sistema detecta huecos mayores a 30 min y los resalta en el dashboard.