# BodasEditor V2

Plataforma base para crear invitaciones digitales de boda.

## Incluido

- React + Vite
- React Router
- Dashboard
- Registro/inicio de sesión con Supabase
- Modo demo local si no configuras Supabase
- Crear múltiples invitaciones
- Editar cada invitación
- Plantillas Botanical, Elegant, Romántico y Modern
- Fotos principales
- Galería
- Subida de archivos con Supabase Storage
- Música de fondo
- Google Maps
- Cuenta regresiva
- Colores
- Slug/URL pública
- Publicar/despublicar
- Contador de visitas
- WhatsApp de contacto
- Diseño responsive
- Sin RSVP y sin gestión de invitados

## Ejecutar inmediatamente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

Abre:

http://localhost:5173

Si no existe `.env.local`, la aplicación funciona en modo DEMO:
- no requiere cuenta;
- los datos se guardan en localStorage;
- puedes probar todo el editor;
- las imágenes seleccionadas se muestran durante la sesión.

## Configurar Supabase para producción

1. Crea un proyecto gratuito en Supabase.
2. En Supabase abre SQL Editor.
3. Ejecuta:

```text
supabase/schema.sql
```

4. En Project Settings > API copia:
   - Project URL
   - anon/public key

5. Copia `.env.example` a `.env.local`:

```text
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

6. Reinicia:

```bash
npm run dev
```

## Desplegar en Vercel

```bash
npm run build
```

En Vercel:
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist

Configura también las variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## URLs

Editor:

```text
/editar/ID
```

Invitación pública:

```text
/i/juan-y-maria
```

## Nota importante sobre Vercel y React Router

Si vas a usar rutas como `/i/juan-y-maria`, configura una regla de rewrite en Vercel para que las rutas del frontend regresen a `index.html`.

Crea `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Próximas mejoras recomendadas

Para una plataforma comercial real conviene añadir:

- recuperación de contraseña;
- verificación de correo;
- RPC segura para visitas;
- límites de almacenamiento;
- optimización automática de imágenes;
- generación de QR;
- dominio personalizado;
- selector de fuentes;
- más plantillas;
- editor drag & drop;
- sistema de planes.
