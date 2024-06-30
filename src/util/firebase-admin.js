// firebase-admin.js

const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // Ruta al archivo JSON de credenciales

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-proyecto.firebaseio.com" // URL de tu base de datos de Firebase si la usas
});

module.exports = admin;
