# Guía de contribución

¡Gracias por tu interés en mejorar Perfume ERP Pro! Sigue estas pautas para mantener un flujo de trabajo ordenado y seguro.

## Requisitos

- Node.js 18 LTS o superior.
- npm 9 o superior.
- Acceso a una cuenta de Netlify para validar branch deploys.

## Flujo de trabajo

1. **Fork o clon:** crea tu propia copia del repositorio.
2. **Ramas feature:** trabaja siempre en ramas con el prefijo `feature/` o `fix/` según corresponda.
3. **Instala dependencias:** `npm install`.
4. **Desarrollo local:** ejecuta `npm run dev` y asegúrate de que la funcionalidad nueva/no regresiva funcione.
5. **Pruebas manuales:** valida los flujos principales (dashboard, inventario, POS, reportes) y, si aplica, ejecuta `npm run build` para asegurar que la compilación pase.
6. **Branch Deploy:** publica la rama en Netlify mediante un deploy manual y documenta la URL en el Pull Request.
7. **Pull Request:** abre el PR hacia `main`, completa la plantilla y solicita revisión.

## Estándares de código

- Mantén el código tipado con TypeScript y evita `any` cuando sea posible.
- Sigue la estructura de carpetas existente; crea subdirectorios sólo si aportan claridad.
- Prefiere funciones puras y hooks reutilizables sobre lógica duplicada.
- No subas archivos generados (`dist/`, `node_modules/`, etc.).

## Checklist antes de abrir un PR

- [ ] Código formateado y sin errores de compilación.
- [ ] Se ejecutó `npm run build` sin errores.
- [ ] Se validó manualmente la funcionalidad principal.
- [ ] Se documentaron cambios relevantes en el README u otros manuales.
- [ ] Se proporcionó la URL del branch deploy de Netlify.

Gracias por contribuir 💙
