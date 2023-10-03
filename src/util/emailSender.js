import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'quickfoodrecuperacion@gmail.com',
    pass: 'rzwfkerzhmtfhisx',
  },
});
// Función para enviar el correo electrónico
export async function sendEmail(destino, asuntoemail, mensajeemail) {
  try {
    const correoDestino = destino;
    const asunto = asuntoemail;
    const mensaje = mensajeemail;
    const info = await transporter.sendMail({
      from: 'quickfoodrecuperacion@gmail.com',
      to: correoDestino,
      subject: asunto,
      text: mensaje,
    });
    console.log('Correo electrónico enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    return false;
  }
}
