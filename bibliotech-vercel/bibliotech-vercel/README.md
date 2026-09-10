# Bibliotech — versión para Vercel

Esto es tu proyecto PHP reescrito como funciones serverless de Node.js,
listo para desplegar en Vercel usando la misma base de datos de Neon.

## Estructura

```
bibliotech-vercel/
├── index.html              # tu página original (sin cambios)
├── proyecto.html           # tu página original, con los fetch() apuntando a /api/*
├── api/
│   ├── login.js
│   ├── get_recursos.js
│   ├── get_pedidos.js
│   ├── get_reportes.js
│   ├── hacer_pedido.js
│   ├── hacer_reporte.js
│   └── accion_pedido.js
├── lib/
│   └── db.js                # conexión a Neon (usa la variable DATABASE_URL)
├── package.json
└── .env.example
```

Cada archivo en `api/` reemplaza a su equivalente `.php` (mismo nombre,
misma lógica, mismos campos de entrada/salida en el JSON). El navegador
ahora pide `/api/login`, `/api/get_recursos`, etc. en vez de `login.php`,
`get_recursos.php`, etc.

## ⚠️ Antes que nada: rotá la contraseña de Neon

Tu `config.php` tenía la contraseña de la base en texto plano y ya
quedó expuesta. Andá a tu proyecto en https://console.neon.tech →
tu base → **Reset password**, y usá la contraseña nueva en el paso
siguiente. Nunca vuelvas a poner una contraseña directamente en el código.

## Pasos para desplegar

1. **Conseguí tu connection string de Neon**
   En el dashboard de Neon, copiá el "Connection string" (pooled), algo como:
   `postgresql://usuario:password@ep-xxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`

2. **Subí esta carpeta a un repo de GitHub**
   ```bash
   cd bibliotech-vercel
   git init
   git add .
   git commit -m "Migración a Vercel"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/bibliotech.git
   git push -u origin main
   ```

3. **Importá el repo en Vercel**
   - Entrá a https://vercel.com/new
   - Elegí tu repo de GitHub
   - Framework Preset: dejalo en "Other" (no hace falta build command)

4. **Configurá la variable de entorno**
   - En el proyecto de Vercel: Settings → Environment Variables
   - Nombre: `DATABASE_URL`
   - Valor: el connection string del paso 1
   - Aplicala a Production, Preview y Development

5. **Deploy**
   Vercel construye automáticamente. Cuando termine, tu app va a estar en
   `https://tu-proyecto.vercel.app`, con `index.html`/`proyecto.html`
   serviditas como estáticas y cada archivo de `api/` como función serverless.

## Probar en local (opcional)

```bash
npm install -g vercel
cd bibliotech-vercel
npm install
vercel dev
```
Esto levanta un servidor local que simula el entorno de Vercel
(usa el `.env` que armes a partir de `.env.example`).

## `proyecto.html` ya está alineado con el backend real

`proyecto.html` tenía código mezclado: parte usaba datos inventados
en memoria (un objeto `DATA` con equipos/pedidos de ejemplo) y parte
llamaba a los `.php` pero con nombres de campo de una versión anterior
del proyecto (`idPrestamo`, `idRecurso`, `Estado: 'Y'/'N'`, etc.) que
no coincidían con lo que tu base realmente devuelve.

Reescribí todo el `<script>` de `proyecto.html` para que:
- No use datos inventados en ningún lado — todo sale de la base vía `/api/*`.
- Use los nombres de campo reales: `ID_reserva`, `id_equipo`, `estado_reserva`
  (`pendiente`/`aceptado`/`rechazado`/`entregado`), `Estado_actual`
  (`Libre`/`En uso`), `Tipo`, `modelo`, `num_serie`, `fecha_uso`,
  `turno_horario`, `nombreDocente`, etc.
- Agregué 2 endpoints que antes solo existían como mock local, para que
  el panel "Gestión de equipos" del bibliotecario funcione de verdad:
  - `api/actualizar_equipo.js` — marca un equipo como Libre / En uso
  - `api/agregar_equipo.js` — da de alta un equipo nuevo

## ⚠️ Una suposición que hice: el campo "Rol"

No tengo forma de ver qué valores guarda exactamente la columna
`"Rol"` de tu tabla `Usuario` (por ejemplo, si un bibliotecario tiene
`Rol = 'bibliotecario'`, `'biblio'`, `'admin'`, etc.). Para no
romper nada, el login asume que **cualquier valor de Rol que contenga
la palabra "biblio" (sin importar mayúsculas/minúsculas)** es un
bibliotecario, y todo lo demás se trata como docente. Esa lógica está
en `doLogin()` dentro de `proyecto.html`:

```js
const rolNorm = (data.rol || '').toLowerCase().includes('biblio') ? 'biblio' : 'docente';
```

Si tus roles en la base se llaman distinto (p. ej. "profesor" /
"admin"), avisame el valor exacto y te ajusto esa línea.

También saqué el botón de "ver como bibliotecario/docente" que había
en el header: no tenía sentido mantenerlo ahora que el rol viene de
verdad del login, no de un truco de demo.
