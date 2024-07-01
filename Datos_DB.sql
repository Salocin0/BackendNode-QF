-- First, execute the INSERT INTO productors statement separately
INSERT INTO productors ("cuit", "razonSocial", "estaValido", "habilitado", "condicionIva", "createdAt", "updatedAt")
VALUES (23425126059, 'Felipe Eventos', true, true, 'Monotributista', '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- Then, execute the INSERT INTO repartidores statement separately
INSERT INTO repartidores ("estaValido", "habilitado", "createdAt", "updatedAt")
VALUES (true, true, '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- Finally, execute the INSERT INTO encargados statement separately
INSERT INTO encargados ("cuit", "razonSocial", "estaValido", "habilitado", "condicionIva", "createdAt", "updatedAt")
VALUES (23425126049, 'Panchos el pepe', true, true, 'Monotributista', '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- INSERT INTO usuarios
INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidoreId", "createdAt", "updatedAt")
VALUES ('Consumidor', 'Consumidor@Consumidor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'consumidor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- consumidor

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidoreId", "createdAt", "updatedAt")
VALUES ('Repartidor', 'Repartidor@Repartidor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'repartidor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- repartidor

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidoreId", "createdAt", "updatedAt")
VALUES ('Encargado', 'Encargado@Encargado.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'encargado', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- encargado

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidoreId", "createdAt", "updatedAt")
VALUES ('Productor', 'Productor@Productor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'productor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- productor

-- crear los consumidores con los id de los usuarios y con los id los roles especificos
INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "usuarioId", "createdAt", "updatedAt")
VALUES ('Sofia', 'Rodriguez', '2000-10-10 00:00:00', 10000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, 1, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- consumidor

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "usuarioId", "createdAt", "updatedAt")
VALUES ('Alejandro', 'Fernandez', '2000-10-10 00:00:00', 20000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, 2, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- repartidor

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "usuarioId", "createdAt", "updatedAt")
VALUES ('Valentina', 'Martinez', '2000-10-10 00:00:00', 30000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, 3, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- encargado

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "usuarioId", "createdAt", "updatedAt")
VALUES ('Daniel', 'Flores', '2000-10-10 00:00:00', 40000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, 4, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- productor

-- updatear usuarios con el id del consumidor
UPDATE usuarios SET "consumidoreId" = (SELECT id FROM consumidores WHERE nombre = 'Sofia') WHERE id = 1;
UPDATE usuarios SET "consumidoreId" = (SELECT id FROM consumidores WHERE nombre = 'Alejandro') WHERE id = 2;
UPDATE usuarios SET "consumidoreId" = (SELECT id FROM consumidores WHERE nombre = 'Valentina') WHERE id = 3;
UPDATE usuarios SET "consumidoreId" = (SELECT id FROM consumidores WHERE nombre = 'Daniel') WHERE id = 4;


-- Crear 5 registros de ejemplo para la tabla 'eventos'
INSERT INTO public.eventos 
(
    nombre, descripcion, "tipoEvento", "tipoPago", "fechaInicio", "horaInicio", "fechaFin", 
    "cantidadPuestos", "cantidadRepartidores", "capacidadMaxima", "conButaca", "conRepartidor", 
    "conPreventa", "tipoPreventa", "fechaInicioPreventa", "fechaFinPreventa", 
    "plazoCancelacionPreventa", "linkVentaEntradas", ubicacion, habilitado, 
    localidad, provincia, img, croquis, estado, "createdAt", "updatedAt", "productorId"
)
VALUES
-- Evento 1
(
    'Evento Musical', 'Concierto de música en vivo', 'Concierto', 'Pago en Efectivo', 
    '2023-12-01 19:00:00+00', '19:00:00', '2023-12-01 23:00:00+00', 
    10, 2, 100, true, true, true, 'General', 
    '2023-11-25 19:00:00+00', '2023-11-30 19:00:00+00', 3, 
    'https://ventaentradas.com/evento1', 'Plaza Central', true, 
    'Catamarca', 'Catamarca', 'img1.jpg', 'croquis1.pdf', 'EnCurso', 
    '2023-11-20 21:00:07+00', '2023-11-20 21:00:07+00', 1
),
-- Evento 2
(
    'Feria Artesanal', 'Exposición y venta de artesanías locales', 'Feria', 'Pago con Tarjeta', 
    '2023-12-05 09:00:00+00', '09:00:00', '2023-12-05 18:00:00+00', 
    20, 3, 200, false, false, false, NULL, 
    NULL, NULL, NULL, 
    'https://ventaentradas.com/evento2', 'Parque Central', true, 
    'Icaño', 'Catamarca', 'img2.jpg', 'croquis2.pdf', 'EnCurso', 
    '2023-11-20 21:00:07+00', '2023-11-20 21:00:07+00', 1
),
-- Evento 3
(
    'Teatro al Aire Libre', 'Obra de teatro en espacio abierto', 'Teatro', 'Pago en Efectivo', 
    '2023-12-10 20:00:00+00', '20:00:00', '2023-12-10 22:00:00+00', 
    15, 1, 150, true, false, true, 'VIP', 
    '2023-12-01 20:00:00+00', '2023-12-09 20:00:00+00', 1, 
    'https://ventaentradas.com/evento3', 'Anfiteatro', true, 
    'Catamarca', 'Catamarca', 'img3.jpg', 'croquis3.pdf', 'EnPreparacion', 
    '2023-11-20 21:00:07+00', '2023-11-20 21:00:07+00', 1
),
-- Evento 4
(
    'Festival Gastronómico', 'Muestra y venta de comidas típicas', 'Festival', 'Pago con Tarjeta', 
    '2023-12-15 11:00:00+00', '11:00:00', '2023-12-15 22:00:00+00', 
    25, 4, 300, false, true, false, NULL, 
    NULL, NULL, NULL, 
    'https://ventaentradas.com/evento4', 'Centro Cultural', true, 
    'Icaño', 'Catamarca', 'img4.jpg', 'croquis4.pdf', 'EnPreparacion', 
    '2023-11-20 21:00:07+00', '2023-11-20 21:00:07+00', 1
),
-- Evento 5
(
    'Carrera de Maratón', 'Competencia de maratón en la ciudad', 'Deportivo', 'Pago en Efectivo', 
    '2023-12-20 07:00:00+00', '07:00:00', '2023-12-20 12:00:00+00', 
    5, 10, 500, false, true, true, 'Competencia', 
    '2023-12-10 07:00:00+00', '2023-12-19 07:00:00+00', 5, 
    'https://ventaentradas.com/evento5', 'Ciudad Completa', true, 
    'Catamarca', 'Catamarca', 'img5.jpg', 'croquis5.pdf', 'EnPreparacion', 
    '2023-11-20 21:00:07+00', '2023-11-20 21:00:07+00', 1
);

INSERT INTO public."puntoEncuentros" (nombre, longitud, latitud, habilitado, "createdAt", "updatedAt", "eventoId")
VALUES 
('Punto de Encuentro 1', '-58.381592', '-34.603722', true, NOW(), NOW(), 1),
('Punto de Encuentro 2', '-58.381692', '-34.603822', true, NOW(), NOW(), 1),
('Punto de Encuentro 3', '-58.381792', '-34.603922', true, NOW(), NOW(), 1),
('Punto de Encuentro 4', '-58.381892', '-34.604022', true, NOW(), NOW(), 1),
('Punto de Encuentro 5', '-58.381992', '-34.604122', true, NOW(), NOW(), 1);