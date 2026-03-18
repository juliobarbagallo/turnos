# Configurar URLs en Supabase (auth redirect)

Si los links de recuperar contraseña / Magic Link te llevan a localhost en vez de producción, hay que configurar las URLs en Supabase.

## Pasos

1. Ir a **Supabase Dashboard** → tu proyecto → **Authentication** → **URL Configuration**
2. **Site URL:** cambiar de `http://localhost:3000` a `https://super-turnos.vercel.app`
3. **Redirect URLs:** agregar:
   - `https://super-turnos.vercel.app/**` (cubre /auth/callback y cualquier path)
   - `http://localhost:3000/**` (para desarrollo local)
4. Guardar

Si la URL que pasamos en `redirectTo` no está en la lista, Supabase la rechaza y usa la Site URL (por eso terminaba en localhost).
