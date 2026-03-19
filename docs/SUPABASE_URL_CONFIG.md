# Configurar URLs en Supabase (auth redirect)

Si los links de recuperar contraseña / Magic Link te llevan a localhost en vez de producción, hay que configurar las URLs en Supabase.

## Pasos

1. Ir a **Supabase Dashboard** → tu proyecto → **Authentication** → **URL Configuration**
2. **Site URL:** debe ser exactamente `https://super-turnos.vercel.app`
   - Sin barra final
   - Sin path (no `/auth/callback`)
   - Sin espacios
   - Si aparece "site url is improperly formatted", revisar que no haya caracteres extra
3. **Redirect URLs:** agregar:
   - `https://super-turnos.vercel.app/**` (cubre /auth/callback y cualquier path)
   - `http://localhost:3000/**` (para desarrollo local)
4. Guardar

Si la URL que pasamos en `redirectTo` no está en la lista, Supabase la rechaza y usa la Site URL (por eso terminaba en localhost).

## Error "site url is improperly formatted"

- Verificar que Site URL sea solo el origen: `https://super-turnos.vercel.app`
- No usar wildcards en Site URL (solo en Redirect URLs)
- Borrar y volver a escribir la URL por si hay caracteres invisibles
