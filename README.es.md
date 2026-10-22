# Mr Games

Mr Games es una tienda en línea enfocada en Colombia para videojuegos digitales y suscripciones. El sitio presenta un catálogo navegable y permite armar un combo para solicitar una cotización. Está construido con Next.js y Supabase, y se despliega en Cloudflare mediante OpenNext.

**Sitio en producción:** [mrgames.com.co](https://mrgames.com.co)

**In English:** [README.md](README.md)

## Tecnologías

- Next.js 16, React 19 y TypeScript
- Tailwind CSS 4
- Supabase para el catálogo y los datos de la aplicación
- OpenNext y Cloudflare Workers para el despliegue
- Vitest para las pruebas automatizadas

## Ejecución local

Usa una versión actual de Node.js y npm. Instala las dependencias y configura las variables de entorno necesarias en un archivo local `.env.local` con valores de tu entorno de desarrollo:

```bash
npm install
npm run dev
```

La aplicación usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para conectarse a Supabase. Algunas operaciones administrativas y de gestión del catálogo también requieren credenciales exclusivas del servidor, como `SUPABASE_SECRET_KEY` y `STEAMGRIDDB_API_KEY`. Mantén las credenciales privadas y no las incluyas en el repositorio. La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

Ejecuta la suite de pruebas con:

```bash
npm test
```

Para previsualizar y desplegar en Cloudflare, el proyecto incluye `npm run preview` y `npm run deploy`.

## Estructura del proyecto

- `app/` — páginas de la tienda, detalles de productos, carrito, checkout, privacidad y administración
- `components/` — componentes compartidos de la tienda y administración
- `utils/` — clientes de Supabase y utilidades de la aplicación
- `context/` — estado compartido del carrito
- `supabase/` — migraciones de base de datos y pruebas SQL
- `tests/` — pruebas con Vitest
- `docs/` — documentos técnicos y de seguridad

El contexto del producto y el diseño está en [PRODUCT.md](PRODUCT.md) y [DESIGN.md](DESIGN.md).
