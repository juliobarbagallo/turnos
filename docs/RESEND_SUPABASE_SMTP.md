# Configurar Resend en Supabase (emails de auth)

Para que los emails de Magic Link, recuperar contraseña y confirmación usen Resend en lugar del SMTP limitado de Supabase:

1. Ir a **Supabase Dashboard** → tu proyecto → **Authentication** → **SMTP Settings**
2. Activar **Enable Custom SMTP**
3. Completar:
   - **Sender email:** `onboarding@resend.dev` (o un dominio verificado en Resend)
   - **Sender name:** `SuperTurnos`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** tu API key de Resend (`re_xxx`)

4. Guardar

Con esto, Supabase usará Resend para enviar todos los emails de autenticación.
