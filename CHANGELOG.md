# Historial de cambios

## 0.3.0 — 2026-10-16

### Mejoras
- Sergio Gonzales cuenta con un perfil ampliado que incorpora su trayectoria como nadador, su participación en Los 100, enfoque y formación.
- Cada entrenador dispone de un dashboard privado con sus propios clientes, plantillas y ejercicios.
- La biblioteca original de Sebastián se comparte como base sin duplicarse; cada coach puede crear ejercicios privados o personalizar la base sin cambiarla para los demás.
- Nueva supervisión privada para el Head Coach con entrenadores, clientes, accesos, rutinas, adherencia y actividad de bitácora.
- Los clientes dejan de ver la navegación pública dentro de su cuenta y el botón de WhatsApp abre conversación con su coach asignado.
- Se incluye un proceso seguro e idempotente para preparar una cuenta demo de coach y su cliente muestra.
- Las credenciales demo quedan protegidas desde Supabase, el restablecimiento limpia todo su espacio de prueba y el seed nunca reutiliza una cuenta real.
- La portada utiliza una imagen general de entrenamiento adaptada para conservar su encuadre y la legibilidad del texto en computadora y teléfono.
- Los logotipos oficiales de Peak Level Training identifican la navegación, el pie de página y la pestaña del navegador sin saturar el diseño.
- La portada presenta a Peak como una marca y un equipo de entrenadores enfocado en salud, fuerza y rendimiento.
- Nueva sección Head Coach con la experiencia, contacto, planes y galería de Sebastián González.
- Nuevo catálogo de coaches con perfiles de Sebastián González, Sergio Gonzales y Fátima Bastida.
- El catálogo permite filtrar entrenadores por especialidad.
- Contacto y WhatsApp dirigen cada mensaje al entrenador seleccionado.
- Las rutas anteriores de Planes y Sobre mí redirigen a las nuevas secciones para conservar enlaces existentes.

### Base de datos
- supabase/multi-coach-platform.sql

## 0.2.2 — 2026-09-28

### Correcciones
- El calendario conserva sus puntos históricos aunque el entrenador edite, cambie de día, vacíe, reemplace o elimine una rutina.
- El respaldo inicial conserva las palomitas existentes y materializa los puntos pendientes que actualmente se calculan desde la rutina.

### Base de datos
- supabase/persistent-workout-calendar.sql

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
