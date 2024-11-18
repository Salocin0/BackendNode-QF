// firebase-admin.js
import admin from 'firebase-admin'; // Ajusta la importación según tu configuración de Firebase Admin
import serviceAccount from "../../etc/secrets/serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tu-proyecto.firebaseio.com" // URL de tu base de datos de Firebase si la usas
});

module.exports = admin;
