import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Plantillas HTML con colores negro y dorado
const getPasswordResetTemplate = (resetLink, code) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - QuickFood</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #000000;
            color: #FFD700;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
            padding: 20px;
            border: 2px solid #FFD700;
            border-radius: 10px;
        }
        .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background-color: #FFD700;
            color: #000000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .code {
            font-size: 18px;
            font-weight: bold;
            background-color: #FFD700;
            color: #000000;
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">QuickFood - Recuperar Contraseña</div>
        <div class="content">
            <p>Hola,</p>
            <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para cambiarla:</p>
            <a href="${resetLink}" class="button">Cambiar Contraseña</a>
            <p>O ingresa este código en la app:</p>
            <div class="code">${code}</div>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
        <div class="footer">
            <p>QuickFood - Tu comida rápida favorita</p>
        </div>
    </div>
</body>
</html>
`;

const getUserActivationTemplate = (activationLink) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activar Usuario - QuickFood</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #000000;
            color: #FFD700;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
            padding: 20px;
            border: 2px solid #FFD700;
            border-radius: 10px;
        }
        .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background-color: #FFD700;
            color: #000000;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">QuickFood - Activar Usuario</div>
        <div class="content">
            <p>Hola,</p>
            <p>Para validar tu email y activar tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${activationLink}" class="button">Activar Cuenta</a>
            <p>¡Bienvenido a QuickFood!</p>
        </div>
        <div class="footer">
            <p>QuickFood - Tu comida rápida favorita</p>
        </div>
    </div>
</body>
</html>
`;

// Función para enviar el correo electrónico con Resend
export async function sendEmail(destino, asuntoemail, mensajeemail, tipo = 'text') {
  try {
    const to = destino;
    const subject = asuntoemail;

    let html = null;
    let text = mensajeemail;

    // Si es recuperación de contraseña, generar HTML
    if (asuntoemail.includes('Recuperar') || asuntoemail.includes('contraseña')) {
      const enlaceMatch = mensajeemail.match(/enlace:([^\s]+)/);
      const resetLink = enlaceMatch ? enlaceMatch[1] : '';
      const codeMatch = mensajeemail.match(/codigo:([^\s]+)/);
      const code = codeMatch ? codeMatch[1] : '';
      html = getPasswordResetTemplate(resetLink, code);
    }
    // Si es habilitar usuario
    else if (asuntoemail.includes('Habilitar') || asuntoemail.includes('Usuario')) {
      const enlaceMatch = mensajeemail.match(/enlace:([^\s]+)/);
      const activationLink = enlaceMatch ? enlaceMatch[1] : '';
      html = getUserActivationTemplate(activationLink);
    }

    const data = await resend.emails.send({
      from: 'QuickFood <noreply@quickfood.com>', // Cambiar a dominio verificado en Resend
      to: [to],
      subject: subject,
      text: text,
      html: html,
    });

    console.log('✅ Correo electrónico enviado:', data.data?.id);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar el correo electrónico:', error.message);
    return false;
  }
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
