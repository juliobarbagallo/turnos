# Configurar Google OAuth en SuperTurnos

## 1. Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Crear proyecto o usar uno existente
3. **OAuth consent screen**: configurar si falta (tipo External, nombre de app, email de soporte)
4. **Credentials** → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - **Authorized JavaScript origins:**
     - `https://super-turnos.vercel.app`
     - `http://localhost:3000` (desarrollo)
   - **Authorized redirect URIs:**
     - `https://bycksprngqvebhjiprih.supabase.co/auth/v1/callback`
     - `http://127.0.0.1:54321/auth/v1/callback` (si usás Supabase local)
5. Copiar **Client ID** y **Client Secret**

## 2. Supabase Dashboard

1. **Authentication** → **Providers** → **Google**
2. Activar Google
3. Pegar Client ID y Client Secret
4. Guardar

## 3. Perfiles para usuarios OAuth

El trigger que crea `profiles` al registrarse debe manejar usuarios de OAuth. Google envía `user_metadata` con `name` (no `full_name`). Si el trigger falla con usuarios Google, actualizar para usar:

```sql
COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
```

para el campo de nombre.
