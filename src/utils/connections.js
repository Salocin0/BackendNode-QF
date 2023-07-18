import mysql from 'mysql2';
export async function connectDB() {
  // Configura los datos de conexión a tu base de datos MySQL
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Salocin0',
    password: 'ProyectoFinal',
    database: 'djangodb'
  });

  // Conecta a la base de datos
  connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos: ', err);
      return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
  });
}
