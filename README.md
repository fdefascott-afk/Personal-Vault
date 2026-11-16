# Personal Vault

Aplicación React para gestionar archivos PDF, imágenes, videos y audios con autenticación de Supabase y almacenamiento privado.

## Requisitos

- Node.js 18 o superior
- npm
- Cuenta en Supabase

## Instalación

```bash
npm install
cp .env.example .env
```

Completa las variables del entorno:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publicable
```

## Ejecución local

```bash
npm run dev
```

La app estará disponible en http://localhost:5173.

## Estructura principal

```bash
src/
  components/
    Layout.jsx
    Navbar.jsx
    Footer.jsx
    Card.jsx
    FileCard.jsx
  pages/
    LoginPage.jsx
    VerificationPage.jsx
    DashboardPage.jsx
    FilesPage.jsx
    ActivitiesPage.jsx
  lib/
    supabase.js
```

## Repositorio

Enlace del repositorio:

```text
https://github.com/tu-usuario/tu-repo
```

> Sustituye este enlace por el repositorio real del proyecto.

## Evidencia de vistas

Se recomienda incluir capturas de pantalla de:

- pantalla de login
- página de verificación
- dashboard principal
- vista de archivos

## Responsabilidad de componentes

- Layout: organiza la estructura general de la app.
- Navbar: muestra navegación principal y estado del usuario.
- Footer: contenido final y pie de la aplicación.
- Card: bloque visual reutilizable para resumen de contenido.
- FileCard: muestra cada archivo con tipo, tamaño y acciones de vista/descarga.
- LoginPage: captura credenciales y simula acceso a la aplicación.
- VerificationPage: presenta el estado de verificación del usuario.
- DashboardPage: muestra indicadores de uso y actividad reciente.
- FilesPage: permite cargar y visualizar archivos por tipo.
- ActivitiesPage: agenda personal para crear, consultar, editar y eliminar actividades.

## Integración con Supabase

La aplicación se conecta con:

- Supabase Auth para login y registro
- Supabase Storage para guardar archivos en los buckets `Docs`, `Video` y `PDF`
- tablas de perfiles para verificación de usuario

Las imágenes y audios se guardan en el bucket `Docs` dentro de `imgane`, en subcarpetas
separadas por tipo y usuario. Videos y PDFs se guardan en los buckets `Video` y `PDF`.
Para habilitar la carga y lectura privada, ejecuta en Supabase SQL Editor las políticas
de Storage de la sección 9 de `supabase-setup.sql`. La aplicación crea enlaces firmados de una hora;
el usuario debe iniciar sesión antes de cargar o ver sus archivos.

La agenda guarda sus actividades en la tabla `public.activities`. Ejecuta también la
sección 10 de `supabase-setup.sql` para crear la tabla y sus políticas de acceso.

## Decisión de organización y reutilización

La decisión clave fue separar la interfaz reutilizable, las páginas específicas y la capa de acceso a Supabase. Esto permite mantener el código legible, reutilizar componentes en distintas vistas y facilitar la escalabilidad a medida que crece la app.

## Flujo sugerido de negocio

1. El usuario inicia sesión.
2. Se valida su verificación.
3. Si está autenticado, entra al dashboard.
4. Puede navegar a la biblioteca de archivos.
5. Puede subir archivos PDF, imágenes, video y audio.
6. Los archivos se almacenan en Supabase Storage y se leen desde la app.
