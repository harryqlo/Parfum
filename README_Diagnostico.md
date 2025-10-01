# Diagnóstico del Proyecto

## 🧩 Mapa de dependencias

### Dependencias de producción

| Paquete             | Uso principal                                          | Riesgo | Comentarios |
| ------------------- | ------------------------------------------------------ | ------ | ----------- |
| `react`             | Librería base para la UI.                              | Medio  | Necesita seguimiento de cambios mayores (18 → 19). |
| `react-dom`         | Renderizado en el navegador.                           | Bajo   | Empaquetado con React 19. |
| `react-router-dom`  | Enrutamiento del SPA.                                  | Medio  | Mayor frecuencia de actualizaciones; revisar breaking changes. |
| `recharts`          | Gráficos estadísticos.                                 | Medio  | Mantener revisiones de vulnerabilidades en dependencias transitivas. |

### Dependencias de desarrollo

| Paquete                 | Uso principal                              | Riesgo | Comentarios |
| ----------------------- | ------------------------------------------ | ------ | ----------- |
| `vite`                  | Bundler y servidor de desarrollo.          | Bajo   | Mantener actualizado para parches de seguridad. |
| `@vitejs/plugin-react`  | Soporte para Fast Refresh y JSX.           | Bajo   | Alineado con Vite 6. |
| `typescript`            | Tipado estático.                           | Bajo   | Revisar compatibilidad con React 19. |
| `@types/node`           | Tipos para Node en scripts de build.       | Bajo   | Actualizar según LTS utilizada. |

## ⚠️ Riesgos identificados

1. **Exposición de claves API en el cliente**: cualquier variable `VITE_*` se inyecta en el bundle. Limitarse a datos que puedan ser públicos.
2. **Política CSP restrictiva**: la cabecera propuesta bloquea dominios externos. Si se agregan servicios (por ejemplo, CDNs o APIs), actualizar la directiva.
3. **Branch Deploy obligatorio**: omitir la verificación manual puede ocasionar deploys fallidos en producción. Documentar el paso en cada release.
4. **Datos locales sin respaldo**: la app almacena en `localStorage`; considerar exportaciones periódicas para usuarios finales.

## 🧮 Matriz impacto/esfuerzo

| Ítem                                      | Impacto | Esfuerzo | Estrategia |
| ----------------------------------------- | ------- | -------- | ---------- |
| Automatizar backups del `localStorage`    | Alto    | Medio    | Investigar sincronización opcional con archivo descargable o API propia. |
| Integrar tests end-to-end                 | Alto    | Alto     | Priorizar cuando existan flujos críticos definidos. |
| Ajustar CSP para servicios adicionales    | Medio   | Bajo     | Actualizar `_headers` y documentar excepciones. |
| Actualizar dependencias trimestralmente   | Medio   | Bajo     | Agendar revisión y aplicar `npm update` controlado. |
| Configurar escaneo de vulnerabilidades    | Alto    | Medio    | Integrar Dependabot o `npm audit` en CI. |
