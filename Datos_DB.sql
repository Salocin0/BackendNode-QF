-- Productor 1
INSERT INTO productors ("cuit", "razonSocial", "estaValido", "habilitado", "condicionIva", "createdAt", "updatedAt")
VALUES (23425126059, 'Felipe Eventos', true, true, 'Monotributista', '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- repartidor 1
INSERT INTO repartidores ("estaValido", "habilitado", "createdAt", "updatedAt")
VALUES (true, true, '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- Encargado 1
INSERT INTO encargados ("cuit", "razonSocial", "estaValido", "habilitado", "condicionIva", "createdAt", "updatedAt")
VALUES (23425126049, 'Panchos el pepe', true, true, 'Monotributista', '2023-11-20 21:00:07', '2023-11-20 21:00:07');

-- 4 usuarios
INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidorId", "createdAt", "updatedAt")
VALUES ('Consumidor', 'Consumidor@Consumidor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'consumidor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- consumidor

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidorId", "createdAt", "updatedAt")
VALUES ('Repartidor', 'Repartidor@Repartidor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'repartidor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- repartidor

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidorId", "createdAt", "updatedAt")
VALUES ('Encargado', 'Encargado@Encargado.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'encargado', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- encargado

INSERT INTO usuarios ("usuario", "email", "emailValidado", "contraseña", "fechaAlta", "codigoValidacion", "codigoHabilitacion", "habilitado", "tipoUsuario", "consumidorId", "createdAt", "updatedAt")
VALUES ('Productor', 'Productor@Productor.com', true, '$2b$10$icYmS6HeA3KGP7jP6ZbXZ.PhckTo63o1xSxReMhTl63LVs/5BcA/.', '2023-11-20 21:00:07', NULL, NULL, true, 'productor', NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- productor

-- 4 consumidores
INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "createdAt", "updatedAt")
VALUES ('Sofia', 'Rodriguez', '2000-10-10 00:00:00', 10000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- consumidor

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId",  "createdAt", "updatedAt")
VALUES ('Alejandro', 'Fernandez', '2000-10-10 00:00:00', 20000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- repartidor

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId", "createdAt", "updatedAt")
VALUES ('Valentina', 'Martinez', '2000-10-10 00:00:00', 30000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- encargado

INSERT INTO consumidores ("nombre", "apellido", "fechaNacimiento", "dni", "localidad", "provincia", "telefono", "habilitado", "encargadoId", "productorId", "repartidorId",  "createdAt", "updatedAt")
VALUES ('Daniel', 'Flores', '2000-10-10 00:00:00', 40000000, 'Icaño', 'Catamarca', 3537302795, true, NULL, NULL, NULL, '2023-11-20 21:00:07', '2023-11-20 21:00:07'); -- productor

-- set roles
UPDATE usuarios SET "consumidorId" = (SELECT id FROM consumidores WHERE nombre = 'Sofia') WHERE id = 1;
UPDATE usuarios SET "consumidorId" = (SELECT id FROM consumidores WHERE nombre = 'Alejandro') WHERE id = 2;
UPDATE usuarios SET "consumidorId" = (SELECT id FROM consumidores WHERE nombre = 'Valentina') WHERE id = 3;
UPDATE usuarios SET "consumidorId" = (SELECT id FROM consumidores WHERE nombre = 'Daniel') WHERE id = 4;

-- Alejandro Fernandez (repartidor)
UPDATE public.consumidores
SET "repartidorId" = (SELECT id FROM repartidores WHERE "estaValido" = true AND "habilitado" = true)
WHERE nombre = 'Alejandro' AND apellido = 'Fernandez';

-- Valentina Martinez (encargado)
UPDATE public.consumidores
SET "encargadoId" = (SELECT id FROM encargados WHERE "estaValido" = true AND "habilitado" = true)
WHERE nombre = 'Valentina' AND apellido = 'Martinez';

-- Daniel Flores (productor)
UPDATE public.consumidores
SET "productorId" = (SELECT id FROM productors WHERE "estaValido" = true AND "habilitado" = true)
WHERE nombre = 'Daniel' AND apellido = 'Flores';
/*
-- Evento 1
INSERT INTO public.eventos 
(
    nombre, descripcion, "tipoEvento", "tipoPago", "fechaInicio", "horaInicio", "fechaFin", 
    "cantidadPuestos", "cantidadRepartidores", "capacidadMaxima", "conButaca", "conRepartidor", 
    "conPreventa", "tipoPreventa", "fechaInicioPreventa", "fechaFinPreventa", 
    "plazoCancelacionPreventa", "linkVentaEntradas", ubicacion, habilitado, 
    localidad, provincia, img, croquis, estado, "createdAt", "updatedAt", "productorId"
)
VALUES
(
    'Evento Musical', 'Concierto de música en vivo', 'Concierto', 'Pago en Efectivo', 
    NOW() - INTERVAL '1 day', '19:00:00', NOW() + INTERVAL '1 day', 
    10, 2, 100, true, true, false, 'General', 
    NOW() - INTERVAL '6 day', NOW() - INTERVAL '1 day', 3, 
    'https://ventaentradas.com/evento1', 'Plaza Central', true, 
    'Catamarca', 'Catamarca', NULL, 'croquis1.pdf', 'EnCurso', 
    NOW(), NOW(), 1
),
-- Evento 2
(
    'Feria Artesanal', 'Exposición y venta de artesanías locales', 'Feria', 'Pago con Tarjeta', 
    NOW() - INTERVAL '1 day', '09:00:00',NOW() + INTERVAL '1 day', 
    20, 3, 200, true, true, true, NULL, 
    NOW() - INTERVAL '6 day', NOW() - INTERVAL '1 day', 3, 
    'https://ventaentradas.com/evento2', 'Parque Central', true, 
    'Icaño', 'Catamarca', NULL, 'croquis2.pdf', 'EnCurso', 
    NOW(), NOW(), 1
),
-- Evento 3
(
    'Teatro al Aire Libre', 'Obra de teatro en espacio abierto', 'Teatro', 'Pago en Efectivo', 
    NOW() + INTERVAL '10 day', '20:00:00', NOW() + INTERVAL '15 day', 
    15, 1, 150, true, true, true, 'VIP', 
    NOW() + INTERVAL '10 day', NOW() + INTERVAL '15 day', 1, 
    'https://ventaentradas.com/evento3', 'Anfiteatro', true, 
    'Catamarca', 'Catamarca', NULL, 'croquis3.pdf', 'Confirmado', 
    NOW(), NOW(), 1
),
-- Evento 4
(
    'Festival Gastronómico', 'Muestra y venta de comidas típicas', 'Festival', 'Pago con Tarjeta', 
    NOW() + INTERVAL '10 day', '11:00:00', NOW() + INTERVAL '15 day', 
    25, 4, 300, true, true, false, NULL, 
    NULL, NULL, NULL, 
    'https://ventaentradas.com/evento4', 'Centro Cultural', true, 
    'Icaño', 'Catamarca', NULL, 'croquis4.pdf', 'Confirmado', 
    NOW(), NOW(), 1
),
-- Evento 5
(
    'Carrera de Maratón', 'Competencia de maratón en la ciudad', 'Deportivo', 'Pago en Efectivo', 
    NOW() + INTERVAL '10 day', '07:00:00', NOW() + INTERVAL '15 day', 
    5, 10, 500, true, true, true, 'Competencia', 
    NOW() + INTERVAL '10 day', NOW() + INTERVAL '15 day', 5, 
    'https://ventaentradas.com/evento5', 'Ciudad Completa', true, 
    'Catamarca', 'Catamarca', NULL, 'croquis5.pdf', 'EnPreparacion', 
    NOW(), NOW(), 1
);


--set puntos de encuento a evento 1
INSERT INTO public."puntoEncuentros" (nombre, longitud, latitud, habilitado, "createdAt", "updatedAt", "eventoId")
VALUES 
('Punto de Encuentro 1', '-58.381592', '-34.603722', true, NOW(), NOW(), 1),
('Punto de Encuentro 2', '-58.381692', '-34.603822', true, NOW(), NOW(), 1),
('Punto de Encuentro 3', '-58.381792', '-34.603922', true, NOW(), NOW(), 1),
('Punto de Encuentro 4', '-58.381892', '-34.604022', true, NOW(), NOW(), 1),
('Punto de Encuentro 5', '-58.381992', '-34.604122', true, NOW(), NOW(), 1);

--set 3 puestos
-- Insertar 3 registros en la tabla public.puestos, todos asociados al encargado con id 1

INSERT INTO public.puestos (
    "nombreCarro", 
    "numeroCarro", 
    "tipoNegocio", 
    banner, 
    img, 
    "telefonoCarro", 
    estado, 
    "createdAt", 
    "updatedAt", 
    "encargadoId"
) VALUES
    ('Gourmet Street Food', 201, 'Food Truck', 'gourmet_banner.png', 'gourmet_logo.png', '5551234567', 'Creado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
    ('Eco Fresh Produce', 202, 'Farmers Market', 'eco_banner.png', 'eco_logo.png', '5559876543', 'Creado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
    ('Taco Fiesta', 203, 'Mexican Food', 'taco_banner.png', 'taco_logo.png', '5551122334', 'Creado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);

--set asociacion repartidor a evento 1
INSERT INTO public."Asociacions" (
    estado, 
    motivo, 
    "createdAt", 
    "updatedAt", 
    "eventoId", 
    "puestoId", 
    "repartidoreId"
) VALUES (
    'Aceptada', 
    'Motivo del evento 1', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP, 
    1, 
    NULL, 
    1
);

--set asociacion repartidor a evento 2
INSERT INTO public."Asociacions" (
    estado, 
    motivo, 
    "createdAt", 
    "updatedAt", 
    "eventoId", 
    "puestoId", 
    "repartidoreId"
) VALUES (
    'Aceptada', 
    'Motivo del evento 2', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP, 
    2, 
    NULL, 
    1
);

--set asociacions puestos a eventos
INSERT INTO public."Asociacions" (
    estado, 
    motivo, 
    "createdAt", 
    "updatedAt", 
    "eventoId", 
    "puestoId", 
    "repartidoreId"
) VALUES
    ('Aceptada', 'Motivo del evento 1, puesto 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 3, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 2, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 1, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 3, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 3, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 1, NULL),
    ('Aceptada', 'Motivo del evento 1, puesto 3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 2, NULL);

--productos
INSERT INTO public.productos (
    nombre, 
    descripcion, 
    aderezos, 
    img, 
    precio, 
    estado, 
    "createdAt", 
    "updatedAt", 
    "puestoId"
) VALUES
    ('Producto 1 - Puesto 1', 'Descripción del producto 1', 'Aderezo 1', 'img1.jpg', 10.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
    ('Producto 2 - Puesto 1', 'Descripción del producto 2', 'Aderezo 2', 'img2.jpg', 12.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
    ('Producto 3 - Puesto 1', 'Descripción del producto 3', 'Aderezo 3', 'img3.jpg', 8.75, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);


INSERT INTO public.productos (
    nombre, 
    descripcion, 
    aderezos, 
    img, 
    precio, 
    estado, 
    "createdAt", 
    "updatedAt", 
    "puestoId"
) VALUES
    ('Producto 1 - Puesto 2', 'Descripción del producto 1', 'Aderezo 1', 'img1.jpg', 15.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
    ('Producto 2 - Puesto 2', 'Descripción del producto 2', 'Aderezo 2', 'img2.jpg', 18.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
    ('Producto 3 - Puesto 2', 'Descripción del producto 3', 'Aderezo 3', 'img3.jpg', 11.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2);

INSERT INTO public.productos (
    nombre, 
    descripcion, 
    aderezos, 
    img, 
    precio, 
    estado, 
    "createdAt", 
    "updatedAt", 
    "puestoId"
) VALUES
    ('Producto 1 - Puesto 3', 'Descripción del producto 1', 'Aderezo 1', 'img1.jpg', 9.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3),
    ('Producto 2 - Puesto 3', 'Descripción del producto 2', 'Aderezo 2', 'img2.jpg', 14.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3),
    ('Producto 3 - Puesto 3', 'Descripción del producto 3', 'Aderezo 3', 'img3.jpg', 7.50, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3);

-- Insertar 5 pedidos

INSERT INTO public."Pedidos" (
    fecha, 
    total, 
    estado, 
    "createdAt", 
    "updatedAt", 
    "consumidorId", 
    "puestoId", 
    "repartidorId", 
    "eventoId",
    "codigoEntrega",
    "puntoEncuentroId"
) VALUES
    (CURRENT_TIMESTAMP, 45.00, 'Pendiente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, null, 1,null,null),
    (CURRENT_TIMESTAMP, 60.50, 'Aceptado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2, null, 2,null,null),
    (CURRENT_TIMESTAMP, 30.75, 'EnPreparacion', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 3, null, 1,null,null),
    (CURRENT_TIMESTAMP, 55.25, 'EnCamino', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2, 1, 2,'ABC123',1),
    (CURRENT_TIMESTAMP, 40.10, 'Entregado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 3, null, 1,null,null);

-- Insertar detalles para el pedido con id = 1
INSERT INTO public."DetallePedidos" (
    cantidad, 
    precio, 
    "createdAt", 
    "updatedAt", 
    "productoId", 
    "PedidoId"
) VALUES
    (2, 10.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1),
    (1, 15.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 1),
    (3, 5.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 1);

-- Insertar detalles para el pedido con id = 2
INSERT INTO public."DetallePedidos" (
    cantidad, 
    precio, 
    "createdAt", 
    "updatedAt", 
    "productoId", 
    "PedidoId"
) VALUES
    (1, 20.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 2),
    (2, 25.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 2);

-- Insertar detalles para el pedido con id = 3
INSERT INTO public."DetallePedidos" (
    cantidad, 
    precio, 
    "createdAt", 
    "updatedAt", 
    "productoId", 
    "PedidoId"
) VALUES
    (3, 8.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 3),
    (1, 12.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 3);

-- Insertar detalles para el pedido con id = 4
INSERT INTO public."DetallePedidos" (
    cantidad, 
    precio, 
    "createdAt", 
    "updatedAt", 
    "productoId", 
    "PedidoId"
) VALUES
    (2, 15.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 4),
    (1, 20.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 4),
    (4, 5.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 4);

-- Insertar detalles para el pedido con id = 5
INSERT INTO public."DetallePedidos" (
    cantidad, 
    precio, 
    "createdAt", 
    "updatedAt", 
    "productoId", 
    "PedidoId"
) VALUES
    (1, 25.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 5),
    (2, 15.10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5);
*/