### COMANDOS UTILES

#Levanta el servidor
npm run dev
npm run start

#Instalar dependencias
npm i 

#Ejecuta la serie de test
npm test

#Inserta datos de prueba en la base de datos
npm run seed

### MIGRACIONES

Las migraciones (umzug v3) corren solas al levantar el back, despues de sequelize.sync()
(que solo crea tablas faltantes, nunca altera las existentes) y antes de dar la API por lista.
- Un advisory lock de Postgres (pg_advisory_xact_lock + lock_timeout) serializa las replicas.
- Cada migracion corre en su propia transaccion; si una falla se hace rollback y el proceso termina con exit 1.
- RUN_MIGRATIONS=false las desactiva (default: true).
- El historial se guarda en la tabla "migrations_log".

Como agregar una:
1. Crear src/migrations/YYYYMMDDHHmmss-descripcion.js (el orden es alfabetico por timestamp).
2. Exportar up({ context, sequelize, transaction }) y down(...). Pasar { transaction } en cada
   sequelize.query para quedar dentro de la transaccion. Escribir SQL idempotente (IF NOT EXISTS).
3. Probar con un Postgres descartable, nunca con el de Railway.

Comandos: npm run migrate | npm run migrate:down (revierte la ultima) | npm run migrate:status

IMPORTANTE: los scripts seed (npm run seed, seed:data, seed:demo) usan sequelize.sync({ force: true })
y BORRAN todas las tablas. No ejecutarlos nunca en produccion.


### SECURITY (limitacion conocida)

Este backend NO autentica las peticiones a la API: ninguna ruta verifica un token o sesion. La identidad
del usuario viaja en headers/body (por ejemplo "consumidorid"), asi que cualquiera que conozca un id puede
actuar en su nombre. Solo POST /login valida credenciales (passport local). Rutas montadas en src/app.js,
todas sin autenticacion: /user, /consumidor, /encargado, /productor, /repartidor, /puesto, /producto,
/evento, /restriccion, /asociacion, /carrito, /pedido, /valoracion, /puntosEncuentro, /asignaciones,
/notificaciones, /payment-sheet, /chatbot, /estadisticas.

Endurecimiento aplicado (sin romper clientes): limite de body de 1mb por defecto (BODY_LIMIT) y 50mb solo en
/evento, /puesto, /producto, /productor, /repartidor y /encargado (UPLOAD_BODY_LIMIT) para imagenes base64;
las fechas ISO con hora deben incluir Z u offset; los precios y totales de pedidos se calculan en el servidor.

Pendiente (cambio incompatible, requiere coordinar con los clientes web y mobile): autenticacion con
JWT/sesion, autorizacion por rol y propiedad del recurso en cada ruta.
