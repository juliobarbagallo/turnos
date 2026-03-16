# Configurar GitHub MCP para SuperTurnos

Para que el agente pueda crear issues, clonar el repo y trabajar con GitHub, necesitás agregar el **GitHub MCP Server** a Cursor.

## Opción 1: Desde Cursor (recomendada)

1. Abrí **Cursor Settings** (`Cmd/Ctrl + Shift + J`)
2. Andá a **Tools & MCP**
3. Buscá **"GitHub"** en el marketplace
4. Instalá con un clic
5. Cuando te pida, ingresá tu **GitHub Personal Access Token**

## Opción 2: Manual en mcp.json

1. Creá un token en: https://github.com/settings/tokens/new  
   - Scopes necesarios: `repo` (acceso completo a repositorios)

2. Editá `~/.cursor/mcp.json` y agregá este bloque dentro de `mcpServers`:

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "TU_TOKEN_ACA"
  }
}
```

3. Reiniciá Cursor

## Verificar

Cuando esté configurado, el agente tendrá acceso a herramientas como:
- `create_issue` – crear issues/tickets
- `get_file_contents` – leer archivos del repo
- `list_issues` – listar issues
- Y más de 100 herramientas de GitHub

## Repo del proyecto

- **URL:** https://github.com/juliobarbagallo/turnos.aso
- **Owner:** juliobarbagallo
- **Repo:** turnos.aso

Una vez configurado, decime y creo los 11 tickets del plan en GitHub y clono el repo para empezar a trabajar.
