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
