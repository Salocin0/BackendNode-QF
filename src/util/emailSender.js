import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'quickfoodrecuperacion@gmail.com',
    pass: 'rzwfkerzhmtfhisx',
  },
  // Configurar timeouts para evitar que cuelgue el servidor
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 5000,    // 5 segundos
  socketTimeout: 15000,     // 15 segundos
});

// Función auxiliar para agregar timeout a una promesa
function promiseWithTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email timeout')), timeoutMs)
    ),
  ]);
}

// Función para enviar el correo electrónico
export async function sendEmail(destino, asuntoemail, mensajeemail) {
  try {
    const correoDestino = destino;
    const asunto = asuntoemail;
    const mensaje = mensajeemail;
    
    // Agregar timeout de 20 segundos máximo para el envío completo
    const info = await promiseWithTimeout(
      transporter.sendMail({
        from: 'quickfoodrecuperacion@gmail.com',
        to: correoDestino,
        subject: asunto,
        text: mensaje,
      }),
      20000 // 20 segundos máximo
    );
    
    console.log('✅ Correo electrónico enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar el correo electrónico:', error.message);
    // No lanzar el error, solo registrarlo y retornar false
    return false;
  }
}
