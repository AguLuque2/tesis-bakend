# AMPER Backend

Backend del sistema de gestión de obras para AMPER. Node.js + JavaScript (ES Modules) + Express + Supabase.

## Instalación

```bash
npm install
cp .env.example .env
# completar .env con los datos reales de tu proyecto de Supabase
# (Project Settings > API en el dashboard)
npm run dev
```

El servidor levanta en `http://localhost:3000` (o el `PORT` que hayas puesto en `.env`). Probalo con:

```bash
curl http://localhost:3000/api/health
```

## Arquitectura

```
src/
├── config/         # env validado (zod) + clientes de Supabase
├── constants/       # roles y otras constantes de negocio, centralizadas
├── errors/          # clases de error propias (AppError y derivadas)
├── middlewares/      # auth (JWT + rol), manejo de errores
├── routes/           # define endpoints, delega a controllers
├── controllers/       # valida input, llama al service, arma response
├── services/          # lógica de negocio pura, sin conocer HTTP
├── repositories/       # única capa que habla con Supabase
├── validators/         # schemas de zod por endpoint
└── utils/
```

Regla de oro: los datos fluyen siempre en una sola dirección —
`routes → controllers → services → repositories → Supabase` — y nunca
al revés ni salteando capas. Un controller jamás importa un
repository directo, ni un service conoce `req`/`res`.

## Módulo de ejemplo: Obra

`obra.routes.js` → `obra.controller.js` → `obra.service.js` → `obra.repository.js`
es la implementación completa de un módulo, de punta a punta. Usalo
como plantilla para el resto: Certificación, Personal, Vehículos,
Materiales, etc. — mismo patrón, mismos 4 archivos por entidad
(o los que necesite: certificación seguramente necesite service/repository
separados para sus 4 subentidades).

## Autenticación

El flujo es: el frontend loguea al usuario con Google vía Supabase
Auth, obtiene un `access_token` (JWT), y lo manda en cada request al
backend como header:

```
Authorization: Bearer <access_token>
```

El middleware `requireAuth` (en `middlewares/auth.js`):
1. Valida el JWT contra Supabase Auth.
2. Busca el `usuario` vinculado a ese `auth_user_id`.
3. Rechaza si no existe, está pendiente de aprobación, o suspendido.
4. Deja `req.usuario` (con su rol) y `req.supabase` (cliente scoped
   al usuario, para que las políticas de RLS se apliquen solas)
   disponibles para el resto de la cadena.

Para restringir un endpoint a ciertos roles, se usa `requireRole(...)`
después de `requireAuth` (ver `obra.routes.js` como ejemplo).

## Pendiente (próximos pasos)

- **Row Level Security (RLS)**: activar y escribir las políticas por
  rol en Supabase — sin esto, el `req.supabase` scoped al usuario no
  está protegiendo nada todavía.
- Replicar el patrón de `obra.*` para el resto de los 32 módulos.
- Endpoint / flujo de invitación de empleados (Admin invita por
  Gmail → se crea `usuario` en estado `pendiente_aprobacion` o
  directamente vinculado, según cómo se implemente la invitación de
  Supabase Auth).
