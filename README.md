This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Actualizaciones de Supabase

Ejecuta las actualizaciones desde el SQL Editor de Supabase antes de usar cada función:

1. [`supabase/series-groups.sql`](supabase/series-groups.sql) activa biseries, triseries y grupos combinados en las rutinas de clientes.
2. [`supabase/template-series-groups.sql`](supabase/template-series-groups.sql) activa esos grupos en las rutinas predeterminadas. Al aplicar una plantilla, cada grupo recibe un identificador nuevo para no mezclar rutinas distintas.
3. [`supabase/exercise-progress.sql`](supabase/exercise-progress.sql) activa la bitácora del cliente y los recordatorios quincenales.
4. [`supabase/progress-weight-units.sql`](supabase/progress-weight-units.sql) permite registrar cada carga en kilogramos o libras y conserva la unidad elegida. Ejecuta este archivo si la bitácora ya estaba instalada.
5. [`supabase/workout-day-completions.sql`](supabase/workout-day-completions.sql) activa las palomitas por rutina y el calendario mensual de entrenamientos realizados o pendientes.
6. [`supabase/persistent-workout-calendar.sql`](supabase/persistent-workout-calendar.sql) respalda los puntos existentes y conserva el historial aunque el entrenador edite, reemplace o elimine rutinas. Ejecútalo después del archivo anterior.
7. [`supabase/multi-coach-platform.sql`](supabase/multi-coach-platform.sql) activa cuentas privadas por entrenador, biblioteca base con personalizaciones privadas, WhatsApp por coach y la supervisión del Head Coach. Conserva los clientes, rutinas, bitácoras y calendarios actuales. Ejecútalo al final.

## Cuentas de demostración

Después de ejecutar `supabase/multi-coach-platform.sql`, agrega estas variables **sólo en `.env.local`**. No subas contraseñas a GitHub ni las conviertas en variables `NEXT_PUBLIC_`:

```bash
DEMO_COACH_EMAIL=coach.demo@peakleveltraining.mx
DEMO_COACH_PASSWORD=elige-una-contrasena-segura
DEMO_CLIENT_EMAIL=cliente.demo@peakleveltraining.mx
DEMO_CLIENT_PASSWORD=elige-otra-contrasena-segura
DEMO_COACH_NAME=Coach Demo Peak
DEMO_CLIENT_NAME=Cliente Demo Peak
DEMO_COACH_WHATSAPP=525548792525
```

Luego prepara o restablece las dos cuentas y sus datos muestra:

```bash
npm run seed:demo
```

El proceso es idempotente: si las cuentas ya existen, sólo actualiza sus credenciales cuando sus perfiles ya están marcados como demo; nunca convierte ni reasigna una cuenta real. La migración también impide que un visitante cambie el correo, teléfono o contraseña de las cuentas compartidas. La cuenta demo coach no puede crear, vincular, editar ni eliminar clientes reales.

Para limpiar ejercicios, personalizaciones, plantillas, rutinas e historial creados durante las pruebas y devolver el espacio demo a su estado inicial después de una presentación:

```bash
npm run seed:demo:reset
```

## Alta de un coach real

1. Crea el usuario desde **Supabase → Authentication → Users** y confirma su correo.
2. Verifica que exista una fila con el mismo `id` en `public.profiles`.
3. En esa fila configura `role = 'coach'`, `full_name`, `coach_slug` y `whatsapp_phone` con código de país y sólo números.
4. Deja `is_head_coach = false` e `is_demo = false`.

Desde ese momento verá la biblioteca base de Sebastián. Todo ejercicio nuevo será privado y cualquier edición a un ejercicio base se guardará como una personalización que sólo verán ese coach y sus clientes.

La migración sólo concede el rol de Head Coach al perfil `coach` cuyo correo sea exactamente `sebgnzlzram@gmail.com`. Si ese perfil no existe, se detiene sin asignar acceso global a otra persona.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
