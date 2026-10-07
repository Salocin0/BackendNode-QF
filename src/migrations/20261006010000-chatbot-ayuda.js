// DATA MIGRATION (flagged): creates the chatbot_ayuda table and inserts the usage-help entries that
// Foody uses. It only touches its own new table; existing tables/rows are never modified.
// Idempotent: CREATE TABLE IF NOT EXISTS + INSERT ... ON CONFLICT DO NOTHING (edits made by hand survive).
export const AYUDA = [
  {
    tema: 'pedido',
    pregunta: '¿Cómo hago un pedido?',
    respuesta:
      'Ingresá con tu cuenta, entrá a Eventos y elegí uno. Elegí un puesto, agregá productos al carrito, andá a Carrito y presioná Comprar. Después pagás con tarjeta y seguís el estado en Pedidos.',
  },
  {
    tema: 'registro',
    pregunta: '¿Cómo me registro?',
    respuesta:
      'Desde la página principal presioná Registrarse, elegí tu perfil (Consumidor, Productor, Repartidor o Encargado) y completá los pasos. Vas a recibir un email para validar tu cuenta.',
  },
  {
    tema: 'pago',
    pregunta: '¿Cómo pago mi pedido?',
    respuesta:
      'El pago se hace con tarjeta desde el Carrito, de forma segura a través de Stripe. El total incluye una comisión de servicio del 15% sobre los productos.',
  },
  {
    tema: 'codigo-entrega',
    pregunta: '¿Qué es el código de entrega?',
    respuesta:
      'Cuando tu pedido está En Camino, en el detalle del pedido vas a ver un código de 6 caracteres. Dáselo al repartidor al recibir tu pedido: él lo ingresa para confirmar la entrega.',
  },
  {
    tema: 'preventa',
    pregunta: '¿Puedo comprar con anticipación?',
    respuesta:
      'Si el evento tiene preventa, al elegirlo seleccionás el día del evento y tu compra queda Precomprada, válida únicamente para ese día.',
  },
  {
    tema: 'roles',
    pregunta: '¿Qué roles hay en QuickFood?',
    respuesta:
      'Consumidor: compra en los eventos. Productor: crea y administra eventos. Encargado: administra puestos y productos y los asocia a eventos. Repartidor: entrega pedidos en los eventos en los que se asocia. Podés sumar roles desde tu Perfil.',
  },
];

export async function up({ context: queryInterface, sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return;
  const transaction = queryInterface.options?.transaction;
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS chatbot_ayuda (
       tema VARCHAR(60) PRIMARY KEY,
       pregunta TEXT NOT NULL,
       respuesta TEXT NOT NULL
     )`,
    { transaction }
  );
  for (const entry of AYUDA) {
    await sequelize.query(
      'INSERT INTO chatbot_ayuda (tema, pregunta, respuesta) VALUES (:tema, :pregunta, :respuesta) ON CONFLICT (tema) DO NOTHING',
      { replacements: entry, transaction }
    );
  }
}

export async function down({ sequelize }) {
  if (sequelize.getDialect() !== 'postgres') return;
  await sequelize.query('DROP TABLE IF EXISTS chatbot_ayuda');
}
