// Catálogo de datos para el seed de demo (puestos, productos, eventos, personas).
// Solo datos y helpers puros: no toca la base. Lo consume seedDemoData.js.
//
// Imágenes: cada entidad tiene una clave (imgKey). Si existe
// src/public/images/<imgKey>.(jpg|jpeg|png|webp) se usa esa foto; si no, el seed
// genera un placeholder SVG con el nombre. Para poner las fotos reales alcanza
// con copiar los archivos con el nombre de la clave y volver a correr el seed.

export const slug = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

export const NOMBRES = [
  'Camila', 'Lucas', 'Valentina', 'Mateo', 'Sofía', 'Santiago', 'Martina', 'Benjamín', 'Julieta', 'Thiago',
  'Agustina', 'Franco', 'Florencia', 'Nicolás', 'Candela', 'Tomás', 'Micaela', 'Joaquín', 'Rocío', 'Bruno',
  'Daniela', 'Ezequiel', 'Paula', 'Gonzalo', 'Carolina', 'Facundo', 'Milagros', 'Ignacio', 'Lucía', 'Federico',
  'Antonella', 'Emiliano', 'Brenda', 'Maximiliano', 'Celeste', 'Lautaro', 'Abril', 'Dylan', 'Noelia', 'Ramiro',
  'Gimena', 'Axel', 'Victoria', 'Leandro', 'Pilar', 'Damián', 'Belén', 'Cristian', 'Aldana', 'Sebastián',
];

export const APELLIDOS = [
  'Rodríguez', 'Fernández', 'González', 'López', 'Martínez', 'Gómez', 'Pérez', 'Sánchez', 'Romero', 'Díaz',
  'Álvarez', 'Torres', 'Ruiz', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez',
  'Gutiérrez', 'Peralta', 'Ledesma', 'Funes', 'Ferreyra', 'Bustos', 'Cabrera', 'Villarreal', 'Sosa', 'Montenegro',
];

// Personas con un rol fijo en la demo (el login es por usuario/email, no por nombre real).
export const PERSONAS_DEMO = {
  productor: { nombre: 'Martín', apellido: 'Giménez', razonSocial: 'Giménez Producciones SRL' },
  encargado: { nombre: 'Lucía', apellido: 'Ferreyra', razonSocial: 'Ferreyra Gastronomía' },
  repartidor: { nombre: 'Joaquín', apellido: 'Páez' },
  consumidor: { nombre: 'Camila', apellido: 'Rodríguez' },
};

// Users that carry the order history behind the statistics, so the demo
// Consumidor and Repartidor start clean. The data Repartidor is only associated
// to finished events, never to events that still accept orders.
export const PERSONAS_DATOS = {
  repartidor: { nombre: 'Franco', apellido: 'Molina' },
  consumidor: { nombre: 'Valentina', apellido: 'Sosa' },
};

export const ENCARGADOS_EXTRA = [
  { nombre: 'Marcelo', apellido: 'Bustos', razonSocial: 'Bustos Alimentos' },
  { nombre: 'Romina', apellido: 'Aguirre', razonSocial: 'Aguirre y Hnos.' },
];

export const REPARTIDORES_EXTRA = [
  { nombre: 'Nahuel', apellido: 'Ortiz' },
  { nombre: 'Julián', apellido: 'Cabrera' },
  { nombre: 'Tamara', apellido: 'Ibáñez' },
];

// ---------------------------------------------------------------------------
// Puestos ("carritos") y productos
// ---------------------------------------------------------------------------
// dueño: 'demo' (Encargado demo) | 0 | 1 (índices de ENCARGADOS_EXTRA)
// rating: promedio objetivo de las valoraciones (1 a 5)
// popularidad: peso relativo al elegir en qué puesto compra la gente
// producto.peso: peso relativo dentro del puesto (los primeros son los más pedidos)

export const PUESTOS = [
  {
    key: 'don-choripan', nombre: 'Don Choripán', tipoNegocio: 'Food Truck',
    dueño: 'demo', rating: 4.7, popularidad: 1.5,
    opiniones: ['El choripán más rico del festival.', 'Pan crocante y chorizo bien jugoso.', 'La provoleta, imperdible.'],
    productos: [
      { nombre: 'Choripán clásico', descripcion: 'Chorizo a la parrilla en pan de campo con chimichurri.', aderezos: 'Chimichurri, salsa criolla', precio: 4200, peso: 5, imgKey: 'producto-choripan' },
      { nombre: 'Choripán completo', descripcion: 'Chorizo, lechuga, tomate y huevo, con salsa golf.', aderezos: 'Salsa golf, mayonesa', precio: 4800, peso: 3 },
      { nombre: 'Morcipán', descripcion: 'Morcilla criolla con salsa criolla en pan de campo.', aderezos: 'Salsa criolla', precio: 4200, peso: 2 },
      { nombre: 'Provoleta a la parrilla', descripcion: 'Provoleta con orégano y ají molido.', aderezos: 'Orégano, ají molido', precio: 5200, peso: 2 },
      { nombre: 'Agua mineral 500ml', descripcion: 'Agua mineral sin gas.', aderezos: 'Sin aderezos', precio: 1800, peso: 2, imgKey: 'producto-agua' },
    ],
  },
  {
    key: 'fuego-lento-parrilla', nombre: 'Fuego Lento Parrilla', tipoNegocio: 'Food Truck',
    dueño: 'demo', rating: 4.5, popularidad: 1.4,
    opiniones: ['Bondiola tierna y abundante.', 'Las papas con cheddar vuelan.', 'Buena porción y buen precio.'],
    productos: [
      { nombre: 'Bondiola al pan', descripcion: 'Bondiola braseada a la parrilla con cebolla caramelizada.', aderezos: 'Barbacoa, mayonesa de ajo', precio: 6500, peso: 5 },
      { nombre: 'Hamburguesa completa', descripcion: 'Medallón de 180g, cheddar, panceta, lechuga y tomate.', aderezos: 'Ketchup, mostaza, mayonesa', precio: 6900, peso: 4 },
      { nombre: 'Papas fritas con cheddar', descripcion: 'Porción grande con cheddar fundido y panceta crocante.', aderezos: 'Cheddar, panceta', precio: 4800, peso: 4 },
      { nombre: 'Vacío al pan', descripcion: 'Vacío a la parrilla con provoleta y rúcula.', aderezos: 'Chimichurri', precio: 7200, peso: 2 },
      { nombre: 'Gaseosa 500ml', descripcion: 'Línea Coca-Cola, Sprite o Fanta bien fría.', aderezos: 'Sin aderezos', precio: 2200, peso: 3 },
    ],
  },
  {
    key: 'la-birra-barra', nombre: 'La Birra Cervecería Artesanal', tipoNegocio: 'Barra',
    dueño: 'demo', rating: 4.3, popularidad: 1.6,
    opiniones: ['Los tragos bien cargados y fríos.', 'Atienden rápido aun con fila.', 'El fernet con coca es el mejor del predio.'],
    productos: [
      { nombre: 'Fernet con coca', descripcion: 'Fernet Branca con Coca-Cola en vaso de 500ml.', aderezos: 'Hielo', precio: 5500, peso: 6 },
      { nombre: 'Cerveza artesanal IPA', descripcion: 'Pinta de IPA de productor local, 473ml.', aderezos: 'Sin aderezos', precio: 4800, peso: 4, imgKey: 'producto-cerveza' },
      { nombre: 'Cerveza rubia lata', descripcion: 'Lata de cerveza rubia 473ml.', aderezos: 'Sin aderezos', precio: 3500, peso: 4 },
      { nombre: 'Gin tonic', descripcion: 'Gin, tónica, pepino y limón.', aderezos: 'Pepino, limón', precio: 6200, peso: 2 },
      { nombre: 'Agua mineral 500ml', descripcion: 'Agua mineral sin gas.', aderezos: 'Sin aderezos', precio: 1800, peso: 2, imgKey: 'producto-agua' },
    ],
  },
  {
    key: 'empanadas-tia-rosa', nombre: 'Empanadas Tía Rosa', tipoNegocio: 'Food Truck',
    dueño: 0, rating: 4.8, popularidad: 1.3,
    opiniones: ['Empanadas caseras de verdad.', 'La de carne cortada a cuchillo es un lujo.', 'Salen calentitas del horno.'],
    productos: [
      { nombre: 'Empanada de carne', descripcion: 'Carne cortada a cuchillo, cebolla de verdeo y comino.', aderezos: 'Limón', precio: 1500, peso: 6, imgKey: 'producto-empanada' },
      { nombre: 'Empanada de jamón y queso', descripcion: 'Jamón cocido y mozzarella.', aderezos: 'Sin aderezos', precio: 1500, peso: 4 },
      { nombre: 'Empanada de humita', descripcion: 'Choclo cremoso con cebolla y queso.', aderezos: 'Sin aderezos', precio: 1500, peso: 3 },
      { nombre: 'Docena de empanadas surtidas', descripcion: '12 empanadas a elección.', aderezos: 'Limón', precio: 17000, peso: 2 },
      { nombre: 'Pastelito de membrillo', descripcion: 'Pastelito criollo con almíbar.', aderezos: 'Azúcar', precio: 1800, peso: 1 },
    ],
  },
  {
    key: 'napoli-pizza-truck', nombre: 'Napoli Pizza Truck', tipoNegocio: 'Food Truck',
    dueño: 0, rating: 4.4, popularidad: 1.1,
    opiniones: ['Porciones grandes y bien cargadas.', 'La fugazzeta está espectacular.', 'Rápidos para atender.'],
    productos: [
      { nombre: 'Porción de muzzarella', descripcion: 'Pizza a la piedra con muzzarella y aceitunas.', aderezos: 'Orégano, ají molido', precio: 3200, peso: 5 },
      { nombre: 'Porción de fugazzeta', descripcion: 'Cebolla caramelizada y muzzarella.', aderezos: 'Orégano', precio: 3600, peso: 4 },
      { nombre: 'Porción de calabresa', descripcion: 'Muzzarella y rodajas de longaniza calabresa.', aderezos: 'Ají molido', precio: 3800, peso: 3 },
      { nombre: 'Faina', descripcion: 'Porción de faina de garbanzos.', aderezos: 'Pimienta negra', precio: 1500, peso: 2 },
      { nombre: 'Cerveza rubia lata', descripcion: 'Lata de cerveza rubia 473ml.', aderezos: 'Sin aderezos', precio: 3500, peso: 2 },
    ],
  },
  {
    key: 'churros-del-barrio', nombre: 'Churros del Barrio', tipoNegocio: 'Postres',
    dueño: 1, rating: 4.6, popularidad: 0.9,
    opiniones: ['Los churros llegan crocantes y rellenos.', 'El waffle con helado, un sueño.', 'Ideal para la merienda.'],
    productos: [
      { nombre: 'Churros x6 con dulce de leche', descripcion: 'Seis churros recién fritos rellenos de dulce de leche.', aderezos: 'Azúcar, canela', precio: 4500, peso: 5 },
      { nombre: 'Waffle con helado', descripcion: 'Waffle belga con helado de crema y salsa de chocolate.', aderezos: 'Chocolate, frutos rojos', precio: 6000, peso: 3 },
      { nombre: 'Chocotorta en vaso', descripcion: 'Clásica chocotorta en vaso individual.', aderezos: 'Sin aderezos', precio: 3800, peso: 3 },
      { nombre: 'Garrapiñada', descripcion: 'Maní garrapiñado en bolsita de 100g.', aderezos: 'Sin aderezos', precio: 2000, peso: 2 },
      { nombre: 'Café con leche', descripcion: 'Café de especialidad con leche, vaso de 250ml.', aderezos: 'Azúcar', precio: 2400, peso: 3 },
    ],
  },
  {
    key: 'verde-vivo', nombre: 'Verde Vivo Cocina Vegana', tipoNegocio: 'Food Truck',
    dueño: 1, rating: 4.7, popularidad: 0.7,
    opiniones: ['Por fin opciones veganas que valen la pena.', 'El wrap de falafel es buenísimo.', 'Sabor casero y porciones generosas.'],
    productos: [
      { nombre: 'Burger de lentejas', descripcion: 'Medallón de lentejas y garbanzos, sin ingredientes de origen animal.', aderezos: 'Mayonesa vegana, pepinillos', precio: 6200, peso: 5 },
      { nombre: 'Wrap de falafel', descripcion: 'Falafel, hummus, tomate y repollo morado.', aderezos: 'Salsa de tahini', precio: 5800, peso: 3 },
      { nombre: 'Empanada de verdura y tofu', descripcion: 'Masa sin grasa animal rellena de verdura y tofu.', aderezos: 'Sin aderezos', precio: 1600, peso: 4 },
      { nombre: 'Limonada de menta', descripcion: 'Limonada natural con menta y jengibre.', aderezos: 'Hielo', precio: 2800, peso: 3 },
    ],
  },
  {
    key: 'gelato-bruno', nombre: 'Gelato Bruno', tipoNegocio: 'Postres',
    dueño: 1, rating: 4.5, popularidad: 0.8,
    opiniones: ['Helado artesanal cremosísimo.', 'El dulce de leche granizado es otra cosa.', 'Perfecto para el calor.'],
    productos: [
      { nombre: 'Helado 1/4 kg', descripcion: 'Cuarto kilo, hasta tres gustos artesanales.', aderezos: 'Cucurucho o vasito', precio: 5800, peso: 5 },
      { nombre: 'Cucurucho doble', descripcion: 'Dos gustos a elección en cucurucho.', aderezos: 'Baño de chocolate', precio: 3800, peso: 5 },
      { nombre: 'Banana split', descripcion: 'Banana, tres bochas, crema y salsa de chocolate.', aderezos: 'Crema, chocolate', precio: 6800, peso: 2 },
      { nombre: 'Agua mineral 500ml', descripcion: 'Agua mineral sin gas.', aderezos: 'Sin aderezos', precio: 1800, peso: 1, imgKey: 'producto-agua' },
    ],
  },
  {
    key: 'lomito-de-la-plaza', nombre: 'El Lomito de la Plaza', tipoNegocio: 'Food Truck',
    dueño: 'demo', rating: 4.2, popularidad: 1.0,
    opiniones: ['Lomito enorme, no se termina más.', 'La carne muy tierna.', 'Algo de demora pero valió la pena.'],
    productos: [
      { nombre: 'Lomito completo', descripcion: 'Lomo, jamón, queso, huevo, lechuga y tomate.', aderezos: 'Mayonesa, ketchup', precio: 7800, peso: 5 },
      { nombre: 'Lomito simple', descripcion: 'Lomo, queso y tomate.', aderezos: 'Mayonesa', precio: 6900, peso: 3 },
      { nombre: 'Papas rústicas', descripcion: 'Papas con cáscara y romero.', aderezos: 'Alioli', precio: 4200, peso: 3 },
      { nombre: 'Gaseosa 500ml', descripcion: 'Línea Coca-Cola, Sprite o Fanta bien fría.', aderezos: 'Sin aderezos', precio: 2200, peso: 3 },
    ],
  },
  {
    key: 'tostado-cafe', nombre: 'Tostado Café de Especialidad', tipoNegocio: 'Cafetería',
    dueño: 'demo', rating: 4.6, popularidad: 0.7,
    opiniones: ['Las medialunas, calentitas y de manteca.', 'Café de verdad, no de máquina.', 'Muy buena atención.'],
    productos: [
      { nombre: 'Café doble', descripcion: 'Espresso doble de especialidad.', aderezos: 'Azúcar o edulcorante', precio: 2600, peso: 4 },
      { nombre: 'Medialuna de manteca', descripcion: 'Medialuna artesanal de manteca.', aderezos: 'Sin aderezos', precio: 1400, peso: 5 },
      { nombre: 'Tostado de jamón y queso', descripcion: 'Tostado en pan de miga.', aderezos: 'Sin aderezos', precio: 4200, peso: 3 },
      { nombre: 'Licuado de banana', descripcion: 'Banana, leche y miel.', aderezos: 'Miel', precio: 3400, peso: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Eventos con actividad (historial de ventas)
// ---------------------------------------------------------------------------
// Horas en hora de Argentina (ART). Las horas > 24 son de madrugada del día
// siguiente (25 = 01:00). "picos" son las olas de compra: gente que sale a comer
// y beber en los cortes entre bandas; "shows" son las franjas con una banda en
// el escenario, donde casi no se compra.

// The three live events overlap in time, so each one gets its own puestos:
// a food truck cannot be in two places at once.
export const EVENTOS_ACTIVOS = [
  {
    key: 'cuarteto', imgKey: 'evento-cuarteto', nombre: 'Cuartetazo Villa María 2026', tipoEvento: 'Música', tipoPago: 'Efectivo',
    descripcion: 'La fiesta del cuarteto más grande de Villa María: tres noches con las mejores bandas cordobesas y una plaza de comidas con puestos de toda la región.',
    ubicacion: 'Anfiteatro Municipal, Villa María', latitud: '-32.4076', longitud: '-63.2304',
    estado: 'EnCurso', diaInicio: -6, diaFin: 8, ventasHasta: 'ahora',
    puestos: ['don-choripan', 'fuego-lento-parrilla', 'la-birra-barra', 'napoli-pizza-truck'],
    pedidosPorDia: 230,
    curva: { base: 0.2, picos: [[17.5, 1.0, 0.5], [20.6, 0.35, 1.0], [23.3, 0.35, 1.3], [24.4, 0.3, 1.0]], shows: [[19, 20.25], [21.25, 23], [24.75, 26.5]], factorShow: 0.2 },
    bandas: ['Los Cuarteteros del Sur', 'La Tierra Colorada', 'Fuego Cordobés', 'Banda Sierra Brava'],
    repartidores: 'demo',
  },
  {
    key: 'expo-gastronomica', imgKey: 'evento-expo-gastronomica', nombre: 'Villa Gourmet Fest', tipoEvento: 'Gastronómico', tipoPago: 'Efectivo',
    descripcion: 'Festival gastronómico a orillas del río Ctalamochita con cocineros regionales, cervecerías artesanales y música en vivo.',
    ubicacion: 'Costanera del Río Ctalamochita, Villa María', latitud: '-32.4112', longitud: '-63.2458',
    estado: 'EnCurso', diaInicio: -4, diaFin: 10, ventasHasta: 'ahora',
    puestos: ['empanadas-tia-rosa', 'verde-vivo', 'gelato-bruno', 'lomito-de-la-plaza'],
    pedidosPorDia: 170,
    curva: { base: 0.15, picos: [[13.3, 0.7, 1.0], [17.2, 0.7, 0.6], [21.2, 0.9, 1.4]], shows: [[22.5, 24]], factorShow: 0.5 },
    bandas: ['Dúo Costanera', 'Los del Ctalamochita'],
    repartidores: 'demo',
  },
  {
    key: 'kermes', imgKey: 'evento-kermes-solidaria', nombre: 'Kermés de Primavera - Club Argentino', tipoEvento: 'Solidario', tipoPago: 'Efectivo',
    descripcion: 'Kermés a beneficio de las divisiones inferiores del club, con juegos, feria de platos y shows para toda la familia.',
    ubicacion: 'Club Atlético Villa María', latitud: '-32.4021', longitud: '-63.2399',
    estado: 'EnCurso', diaInicio: -2, diaFin: 12, ventasHasta: 'ahora',
    puestos: ['churros-del-barrio', 'tostado-cafe'],
    pedidosPorDia: 85,
    curva: { base: 0.15, picos: [[13, 0.8, 0.8], [16.5, 1.0, 0.7], [20.5, 0.8, 1.0]], shows: [], factorShow: 1 },
    bandas: ['Escuela de Música del Club'],
    repartidores: 'demo',
  },
  {
    key: 'cosecha', imgKey: 'evento-cosecha', nombre: 'Fiesta de la Cosecha 2026', tipoEvento: 'Fiesta popular', tipoPago: 'Efectivo',
    descripcion: 'Edición 2026 de la Fiesta de la Cosecha, con desfile de tractores, peñas folklóricas y patio de comidas.',
    ubicacion: 'Predio Ferial, Villa María', latitud: '-32.4150', longitud: '-63.2260',
    estado: 'Finalizado', diaInicio: -45, diaFin: -43, ventasHasta: 'fin',
    puestos: ['don-choripan', 'fuego-lento-parrilla', 'empanadas-tia-rosa', 'napoli-pizza-truck', 'churros-del-barrio'],
    pedidosPorDia: 130,
    curva: { base: 0.2, picos: [[13.3, 0.8, 1.0], [20.8, 0.5, 1.2], [23.5, 0.4, 0.9]], shows: [[21.5, 23], [24, 25.5]], factorShow: 0.3 },
    bandas: ['Los Troperos', 'Cuarteto La Cañada'],
    repartidores: 'extra',
  },
  {
    key: 'aniversario', imgKey: 'evento-aniversario', nombre: 'Villa María 159 Años - Gran Festejo', tipoEvento: 'Fiesta popular', tipoPago: 'Efectivo',
    descripcion: 'Festejos por el aniversario de la ciudad con espectáculos en la plaza, patio de comidas y fuegos artificiales.',
    ubicacion: 'Plaza Centenario, Villa María', latitud: '-32.4089', longitud: '-63.2412',
    estado: 'Finalizado', diaInicio: -80, diaFin: -78, ventasHasta: 'fin',
    puestos: ['fuego-lento-parrilla', 'la-birra-barra', 'napoli-pizza-truck', 'churros-del-barrio', 'gelato-bruno'],
    pedidosPorDia: 150,
    curva: { base: 0.2, picos: [[18, 1.0, 0.6], [21, 0.5, 1.2], [23.7, 0.4, 1.4]], shows: [[22, 23.25], [24.5, 26]], factorShow: 0.25 },
    bandas: ['Orquesta Municipal', 'Rock del Litoral'],
    repartidores: 'extra',
  },
];

// ---------------------------------------------------------------------------
// Eventos sin historial (para probar filtros por estado y por preventa).
// temporalidad: 'futuro' | 'pasado'. conPuestos: se asocian puestos y repartidor.
// ---------------------------------------------------------------------------

export const EVENTOS_POR_ESTADO = [
  { estado: 'EnPreparacion', nombre: 'Feria de Emprendedores de Villa María', imgKey: 'evento-feria-emprendedores', descripcion: 'Feria de emprendedores locales en la Plaza San Martín.', tipoEvento: 'Feria', conPreventa: false },
  { estado: 'EnPreparacion', nombre: 'Festival de Cerveza Artesanal Cordobesa', imgKey: 'evento-cerveza-artesanal', descripcion: 'Festival de cervecerías artesanales de la región.', tipoEvento: 'Gastronómico', conPreventa: true },
  { estado: 'EnPreparacion1', nombre: 'Feria de Otoño', imgKey: 'evento-feria-emprendedores', descripcion: 'Evento recién creado, todavía sin puestos ni repartidores asociados.', tipoEvento: 'Feria', conPreventa: false },
  { estado: 'EnPreparacion1', nombre: 'Corso de Carnaval Villa María', imgKey: 'evento-corso-carnaval', descripcion: 'Corsos populares por Av. Sabattini.', tipoEvento: 'Cultural', conPreventa: false },
  { estado: 'EnPreparacion1', nombre: 'Recital de Rock Nacional - Estadio Municipal', imgKey: 'evento-rock-nacional', descripcion: 'Recital de bandas de rock nacional en el Estadio Municipal.', tipoEvento: 'Música', conPreventa: true },
  { estado: 'EnPreparacion2', nombre: 'Exposición Rural de Villa María', imgKey: 'evento-expo-rural', descripcion: 'Muestra anual de la Sociedad Rural, con remate de hacienda.', tipoEvento: 'Exposición', conPreventa: false },
  { estado: 'EnPreparacion2', nombre: 'Festival de Jazz de Verano', imgKey: 'evento-jazz-verano', descripcion: 'Ciclo de jazz al aire libre en el Anfiteatro Municipal.', tipoEvento: 'Música', conPreventa: true },
  { estado: 'Confirmado', nombre: 'Fiesta Patronal San Antonio', imgKey: 'evento-fiesta-patronal', descripcion: 'Fiesta patronal del barrio San Antonio, entrada libre y gratuita.', tipoEvento: 'Fiesta popular', conPreventa: false, conPuestos: true },
  { estado: 'Confirmado', nombre: 'Cosquín Rock - Edición Villa María', imgKey: 'evento-cosquin-rock', descripcion: 'Edición confirmada del festival itinerante, entradas en preventa.', tipoEvento: 'Música', conPreventa: true, conPuestos: true },
  { estado: 'Pausado', nombre: 'Festival de Doma y Folklore', imgKey: 'evento-doma-folklore', descripcion: 'Festival tradicionalista pausado por pronóstico de lluvia.', tipoEvento: 'Cultural', conPreventa: false },
  { estado: 'Pausado', nombre: 'Maratón Solidaria Nocturna', imgKey: 'evento-maraton-nocturna', descripcion: 'Maratón solidaria pausada por reprogramación del circuito.', tipoEvento: 'Deportivo', conPreventa: true },
  { estado: 'Cancelado', nombre: 'Verbena Popular Barrio Centro', imgKey: 'evento-verbena-barrio', descripcion: 'Verbena barrial cancelada por falta de permisos municipales.', tipoEvento: 'Fiesta popular', conPreventa: false },
  { estado: 'Cancelado', nombre: 'Show de Fin de Año - Plaza Vélez Sarsfield', imgKey: 'evento-fin-de-anio', descripcion: 'Show de fin de año cancelado por el municipio.', tipoEvento: 'Música', conPreventa: true },
];

// ---------------------------------------------------------------------------
// Opiniones genéricas y utilidades de azar / fechas / imágenes
// ---------------------------------------------------------------------------

export const OPINIONES_GENERICAS = [
  'Muy rico, volvería a pedir.',
  'Llegó rápido y caliente.',
  'Buena atención.',
  'Tardó un poco pero valió la pena.',
  'Excelente relación precio-calidad.',
  'Todo perfecto.',
  'Porciones generosas.',
  'Mucha fila pero se movía rápido.',
];

export const OPINIONES_REPARTIDOR = [
  'Me encontró enseguida entre la gente.',
  'Muy amable y puntual.',
  'Llegó con todo en perfecto estado.',
  'Rápido, gracias.',
  'Super atento.',
];

// PRNG determinístico (mulberry32): el seed produce siempre la misma "historia".
export function crearRng(semilla = 20261110) {
  let a = semilla >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const weighted = (items, peso) => {
    const total = items.reduce((s, it) => s + peso(it), 0);
    let r = rnd() * total;
    for (const it of items) {
      r -= peso(it);
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  };
  // Poisson por el método de Knuth (lambda chico).
  const poisson = (lambda) => {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= rnd();
    } while (p > L);
    return k - 1;
  };
  const gauss = () => {
    const u = Math.max(rnd(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };
  return { rnd, int, pick, weighted, poisson, gauss };
}

// Intensidad relativa de compras a una hora (ART, decimal) según la curva del evento.
export function intensidad(curva, hora) {
  let v = curva.base;
  for (const [centro, sigma, amp] of curva.picos) {
    v += amp * Math.exp(-((hora - centro) ** 2) / (2 * sigma * sigma));
  }
  for (const [ini, fin] of curva.shows) {
    if (hora >= ini && hora < fin) v *= curva.factorShow;
  }
  return v;
}

// Placeholder SVG (data URI) con colores derivados del nombre. Se reemplaza solo
// cuando exista un archivo de imagen real con la imgKey correspondiente.
export function placeholderSvg(texto, ancho = 600, alto = 400) {
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    if ((actual + ' ' + p).trim().length > 18) {
      if (actual) lineas.push(actual);
      actual = p;
    } else {
      actual = (actual + ' ' + p).trim();
    }
  }
  if (actual) lineas.push(actual);
  const lineasUsadas = lineas.slice(0, 3);
  const tam = Math.round(alto / 9);
  const inicioY = alto / 2 - ((lineasUsadas.length - 1) * tam * 1.2) / 2;
  const textos = lineasUsadas
    .map((l, i) => `<text x="${ancho / 2}" y="${inicioY + i * tam * 1.2}" font-family="Arial, sans-serif" font-size="${tam}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${esc(l)}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,42%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},60%,22%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${textos}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
