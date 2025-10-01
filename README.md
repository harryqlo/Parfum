# Perfume ERP Pro

Sistema ERP local-first para perfumerías construido con React + TypeScript y Vite. El objetivo de este documento es explicar la estructura actual del proyecto, cómo trabajar en él de forma local y qué pasos seguir para desplegarlo en Netlify utilizando la nueva configuración incluida en el repositorio.

## 🗂️ Estructura del proyecto

```text
.
├── App.tsx                # Punto de entrada de la aplicación
├── components/            # Componentes reutilizables
├── context/               # Providers y hooks de contexto global
├── data/                  # Datos estáticos semilla
├── hooks/                 # Hooks personalizados
├── pages/                 # Vistas principales del sistema
├── services/              # Servicios (APIs locales/externas)
├── utils/                 # Utilidades y helpers
├── types.ts               # Tipos compartidos
├── vite.config.ts         # Configuración de Vite
├── netlify.toml           # Configuración de build/redirects para Netlify
└── _headers               # Directivas HTTP para Netlify (seguridad y cache)
```

## ✅ Requisitos previos

- Node.js 18 LTS o superior (se probó con Node 18.20).
- npm 9 o superior.
- Acceso a una cuenta de Netlify para desplegar el sitio estático.

## 🧑‍💻 Uso local

1. Clonar el repositorio y entrar en la carpeta del proyecto.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el entorno de desarrollo con recarga en caliente:
   ```bash
   npm run dev
   ```
   La aplicación quedará disponible normalmente en `http://localhost:5173`.

### Scripts disponibles

| Script         | Descripción                                                       |
| -------------- | ----------------------------------------------------------------- |
| `npm run dev`  | Levanta el servidor de desarrollo de Vite.                        |
| `npm run build`| Genera la versión optimizada en la carpeta `dist/`.               |
| `npm run preview` | Sirve localmente la build generada para validación manual.  |

## 🚀 Proceso de build y despliegue

1. Ejecutar `npm run build`; la carpeta `dist/` contendrá los archivos estáticos.
2. Netlify utilizará `netlify.toml` para:
   - Ejecutar `npm run build` durante el deploy.
   - Publicar los archivos de `dist/`.
   - Redirigir todas las rutas SPA a `index.html` (`/* → /index.html`).
3. El archivo `_headers` define:
   - Directivas de seguridad mínimas (`X-Frame-Options`, `Content-Security-Policy`, etc.).
   - Cache agresivo para recursos dentro de `/assets/`.

### Variables de entorno sensibles

Si se utilizan integraciones externas, defina las variables desde **Site settings → Build & deploy → Environment** en Netlify.

| Variable                | Descripción                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `VITE_GEMINI_API_KEY`   | Clave de acceso para el servicio Gemini (se requiere si se mantiene activo el módulo correspondiente). |

1. Ingrese a la UI de Netlify, seleccione el sitio y abra **Site configuration → Environment variables**.
2. Añada cada variable con su valor. Recuerde prefijar con `VITE_` para exponerla al cliente (Vite).
3. Salve los cambios y vuelva a desplegar.

### Flujo recomendado de CI/CD

1. Crear una rama de trabajo (`feature/...`).
2. Abrir un **Branch Deploy** manual en Netlify apuntando a esa rama y verificar que la build complete correctamente.
3. Una vez validado, abrir un Pull Request y esperar el deploy automático.
4. Si el pipeline fallara, realizar rollback eliminando temporalmente `netlify.toml` y restaurando el `README.md` hasta corregir el problema.

> ℹ️ Desde este entorno no es posible ejecutar un deploy a Netlify. Se recomienda seguir los pasos anteriores manualmente para validar la primera publicación.

## 🧾 Licencia

Distribuido bajo la Licencia MIT. Consulte el archivo `LICENSE` para más información.
