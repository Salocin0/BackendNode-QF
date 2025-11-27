// Construye dinámicamente el objeto serviceAccount desde variables de entorno
// Útil para alojar en plataformas como Railway sin subir el JSON con la llave privada
export function getServiceAccount() {
  const required = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI',
    'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_CLIENT_X509_CERT_URL'
  ];

  // Verificar que existan las variables necesarias
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing Firebase service account env vars: ${missing.join(', ')}`);
  }

  // En los providers como Railway la PRIVATE_KEY suele subirse con \n en lugar de nuevas líneas
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  return {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    // opcionales
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || undefined,
  };
}

export default getServiceAccount;
