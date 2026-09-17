# Historial de cambios

## 0.2.1 — 2026-09-17

### Mejoras
- Biseries, triseries y grupos de más ejercicios en rutinas predeterminadas.
- Los grupos de una plantilla se conservan al aplicarla a la rutina de un cliente.
- El entrenador puede consultar la bitácora de progreso de cada cliente en modo de solo lectura.
- El cliente puede registrar cargas en kilogramos o libras; el historial y la vista del entrenador conservan la unidad utilizada.
- Los campos de peso de las rutinas aclaran que aceptan valores en kg o lb.
- El cliente cuenta con un calendario mensual que muestra únicamente los días con rutina: verde al completar, rojo al faltar y gris cuando todavía está pendiente.
- Cada rutina programada puede marcarse con una palomita desde su día o desde el calendario.
- El entrenador puede consultar el calendario de constancia de cada cliente sin cambiar sus palomitas.
- La página de desarrollo puede abrirse desde el teléfono en la misma red local y el formulario de acceso evita enviar credenciales en la URL si falta JavaScript.

### Base de datos
- supabase/template-series-groups.sql
- supabase/progress-weight-units.sql
- supabase/workout-day-completions.sql

## 0.2.0 — 2026-09-03

### Mejoras
- Rutinas organizadas por días para cliente y entrenador.
- Creación de biseries, triseries y grupos de ejercicios.
- Bitácora de cargas e historial de progreso por ejercicio.
- Mensajes de motivación para revisar el progreso.
- Botón de WhatsApp adaptado según el tipo de cuenta.

### Base de datos
- supabase/series-groups.sql
- supabase/exercise-progress.sql
