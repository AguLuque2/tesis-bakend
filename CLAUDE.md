## Qué es este proyecto

Backend de un sistema de gestión de obras para AMPER (empresa de obras eléctricas). Proyecto de tesis construido con estándares de producción real: va a manejar datos empresariales sensibles (certificaciones, presupuestos, personal) y va a estar en la nube.

- **Backend**: Node.js + **JavaScript** (ES Modules, `"type": "module"`) + Express. **No usar TypeScript.**
- **Base de datos**: PostgreSQL vía **Supabase**, con Row Level Security (RLS) activo en las 33 tablas.
- **Autenticación**: Supabase Auth con Google OAuth.
- El esquema de base de datos (33 tablas + políticas de RLS) ya está creado y versionado en `supabase/migrations/`. **Es la fuente de verdad — no lo modifiques sin discutirlo antes.** Si una tarea requiere cambiar el esquema, decilo antes de escribir código, no lo hagas en silencio.
- Ya existe una entidad completa de ejemplo: **`src/modules/Obra/*/obra.*`** (routes, controller, service, repository, validator). Es la plantilla a seguir para toda entidad nueva — mirala antes de escribir la siguiente.

## Convención de nombres — TODO en español

Esto incluye nombres de archivo, variables, funciones, y comentarios de código. No es opcional.

- **Archivos**: `<entidad>.<capa>.js`, con la entidad en **español** y la capa en **inglés** (tal como ya está `obra.*` dentro de `modules/Obra/`, es la convención a seguir siempre):
  - `obra.controller.js`, `obra.service.js`, `obra.repository.js`, `obra.routes.js`, `obra.validator.js`
  - Mismo patrón para cualquier entidad nueva, dentro del módulo de dominio que le corresponda: `certificacion.service.js` (en `modules/Certificacion/`), `empleado.repository.js` (en `modules/Usuarios/`), `vehiculo.controller.js` (en `modules/Vehiculos/`), etc. — nunca traducir "controller/service/repository/routes/validator", son los nombres de capa estándar del proyecto.
- **Variables y funciones**: en español, describiendo qué hacen, no cómo.
  - Bien: `obtenerObraPorId`, `listarCertificacionesPorObra`, `empleadoActual`
  - Mal: `getData`, `fetchStuff`, `handleThing2`
- **Excepciones aceptadas** (términos técnicos sin traducción natural, quedan en inglés): nombres de librerías y su API (`req`, `res`, `next`, `middleware`), palabras reservadas del lenguaje, y los nombres de columnas/tablas de la base (que están en español pero en snake_case, ver abajo).

## Arquitectura: módulos de dominio, con capas adentro de cada uno — no negociable

El proyecto se organiza primero por **módulo de dominio** (los "padres" del negocio), y recién adentro de cada módulo se separa por capa. Los módulos de dominio actuales son **Obra**, **Certificacion** — y a medida que se arman, **MaterialesYCompra**, **Vehiculos**, **Usuarios**. El nombre de carpeta de cada módulo va en **PascalCase**.

```
src/
├── config/               # compartido: env validado + clientes de Supabase
├── constants/             # compartido: roles y otras constantes de negocio
├── errors/                  # compartido: clases de error propias (AppError y derivadas)
├── middlewares/               # compartido: auth (JWT + rol), manejo de errores, upload
├── utils/                       # compartido: helpers (manejarErrorPostgres, catchAsync, etc.)
├── routes/
│   └── index.js                  # único punto de montaje: importa los routers de cada módulo
└── modules/
    ├── Obra/
    │   ├── controllers/              # obra, etapa, actividad, etapaArchivo, itemObra, documento,
    │   ├── services/                 # historialEstadoObra — todo lo que cuelga de una obra,
    │   ├── repositories/             # salvo certificación (tiene su propio módulo)
    │   ├── validators/
    │   └── routes/
    └── Certificacion/
        ├── controllers/              # certificacion, certificacionItem,
        ├── services/                 # historialEstadoCertificacion
        ├── repositories/
        ├── validators/
        └── routes/
```

- Las carpetas **compartidas** (`config`, `constants`, `errors`, `middlewares`, `utils`) quedan fuera de `modules/` porque las usa toda la app — no son de un dominio en particular. Esto incluye `middlewares/auth.js` y `repositories/usuario.repository.js` (éste último es la única excepción de repository que vive afuera de un módulo, porque lo usa `requireAuth` en cada request, no es exclusivo de un futuro módulo `Usuarios`).
- Adentro de cada módulo, los nombres de **carpeta de capa** (`controllers`, `services`, `repositories`, `validators`, `routes`) quedan en inglés y en minúscula, igual que antes. Lo que va en español es el nombre de la **entidad** dentro de cada archivo (`obra.controller.js`, `etapa.service.js`, etc.) y todo el contenido.
- Un archivo dentro de un módulo importa a otra capa del **mismo módulo** con rutas relativas cortas (`../services/etapa.service.js`), y a las carpetas compartidas con `../../../` (ej: `../../../errors/AppError.js`), porque los módulos están un nivel más adentro que antes.
- **Una entidad que abarca dos módulos a la vez se parte en dos, una por módulo — nunca queda una entidad "cruzada" entre módulos.** Es lo que se hizo con `historialEstado`: se partió en `historialEstadoObra.*` (adentro de `modules/Obra/`) e `historialEstadoCertificacion.*` (adentro de `modules/Certificacion/`), cada una con su propio controller/service/repository/validator/routes independiente, aunque el código sea casi idéntico entre las dos.
- `src/routes/index.js` es el **único** punto de montaje de Express: importa los routers de cada módulo y arma los paths (`/obras`, `/obras/:obraId/etapas`, etc.). Ningún módulo se automonta.

Los datos fluyen siempre `routes → controllers → services → repositories → Supabase`, nunca al revés ni salteando capas.
- Un controller **nunca** importa un repository directo.
- Un service **nunca** conoce `req`/`res`.
- snake_case en la base de datos, camelCase en el código — la capa `repository` es la única que traduce entre los dos mundos (ver `obra.repository.js` como ejemplo del mapeo).
- **El mapeo de cada repository siempre incluye `creado_en`, `creado_por`, `actualizado_en` y `actualizado_por`** en el objeto que devuelve (como `creadoEn`, `creadoPor`, `actualizadoEn`, `actualizadoPor`), para que la API los exponga en cada respuesta.

## Reglas obligatorias

1. **Cero hardcodeo.** Nada de URLs, claves, límites numéricos o strings mágicos escritos directo en el código. Config sensible → variables de entorno (validadas en `config/env.js` con zod). Constantes de negocio (roles, estados) → módulo `constants/`, nunca repetidas como strings sueltos.
2. **JSDoc en funciones de `services/` y `repositories/`**, documentando tipos de entrada/salida (`@param`, `@returns`, `@typedef`). No es opcional — es la forma de tener autocompletado sin migrar a TypeScript.
3. **Validación con zod, sin excepciones — es la red de seguridad que reemplaza al compilador.** Este proyecto es JavaScript puro, sin TypeScript: nada te avisa en build time si un dato viene mal formado, así que la validación en runtime no es "una buena práctica más", es la única protección real contra datos corruptos. Por eso:
   - Todo endpoint que reciba body/query/params valida con zod, sin excepciones — nunca confiar en el tipo que "debería" venir del frontend.
   - No alcanza con validar en el borde HTTP: si un service llama a otro service o repository con datos que no vienen directo de una request ya validada, y hay dudas razonables sobre su forma, validalos también ahí. El JSDoc (`@typedef`) documenta la forma esperada, pero **no la hace cumplir** — es una nota para el editor, no una garantía en runtime. Si hace falta una garantía real, es zod.
   - Ante la duda de "¿hace falta validar esto de nuevo?", la respuesta por defecto es sí — es preferible una validación de más que un bug silencioso que TypeScript hubiera atajado y JavaScript no.
4. **Errores como clases propias** (`NotFoundError`, `ValidationError`, etc., ver `errors/AppError.js` — nombres de clase en inglés, tal como ya están), nunca `throw "string"` ni `throw new Error("algo")` genérico. Manejo centralizado en un único middleware de errores al final de la cadena.
5. **Errores de Postgres (violación de unicidad, FK, not-null) se traducen SIEMPRE con `utils/manejarErrorpostgres.js`, nunca a mano en cada repository.** Cualquier `insert`/`update` en un repository que pueda chocar con una restricción `unique` de la base (hay varias: `obra.codigo`, `proveedor.cuit`, `vehiculo.patente`, `empleado.email/dni/legajo`, `usuario.email`, `tipo_actividad.nombre`, `etapa` por obra_id+numero/nombre, y las que se vayan agregando) llama a este helper con el `error` que devuelve Supabase, en vez de escribir un `if (error.code === '23505')` en cada archivo. Si aparece un código de error de Postgres nuevo que el helper no contempla todavía, se agrega ahí — no se resuelve local en el repository de turno.
6. **Seguridad siempre presente**: la `service_role key` de Supabase nunca se usa desde el frontend ni se loguea. RLS es la última línea de defensa, no la única — el backend también valida permisos. Nunca loguear tokens, contraseñas ni datos personales sensibles.
7. **Sin código muerto ni comentado "por las dudas".** Si no se usa, se borra.

## Explícitamente prohibido

- Escribir SQL crudo concatenado a mano (usar siempre el cliente de Supabase o queries parametrizadas).
- Poner lógica de negocio en middlewares o rutas.
- Hacer que un controlador llame directo a Supabase salteando el repositorio.
- Modificar el esquema de la base (`supabase/migrations/`) sin avisar primero por qué hace falta.
- Usar nombres de archivo, función o variable en inglés fuera de las excepciones ya listadas.
- Dejar un endpoint sin validación de input.
- Devolver el stack trace o detalles internos de un error al cliente en producción.

## Cómo quiero que trabajes

- **Nunca armes un módulo completo de una.** Trabajá de a **2 a 4 endpoints por vez** (con sus 4 capas: route, controller, service, repository), y parate ahí — no sigas con el resto del módulo hasta que yo los haya probado en Postman y te confirme que están bien. Esto aplica siempre, salvo que yo te pida explícitamente "hacé todo el módulo de una".
- Si una tarea que te pido rompe alguna de estas reglas, **decímelo y proponé la alternativa correcta antes de escribir código** — no lo hagas en silencio ni solo porque te lo pedí así.
- Si hay ambigüedad real sobre el alcance de un módulo nuevo, preguntá antes de asumir.
- Antes de un módulo nuevo, revisá cómo se resolvió algo similar en el resto del proyecto (empezando por `obra.*`) y mantené coherencia, salvo que el patrón existente sea genuinamente incorrecto — en ese caso, avisá por qué conviene cambiarlo en vez de aplicar un patrón nuevo en silencio.
- Priorizá siempre: seguridad > correctitud > legibilidad > performance, salvo que se diga explícitamente lo contrario para un caso puntual.