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
</head>
<body style="font-family: Arial, sans-serif; background-color: #000000; color: #FFD700; margin: 0; padding: 20px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #000000; padding: 20px; border: 2px solid #FFD700; border-radius: 10px;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #FFD700;">QuickFood - Recuperar Contraseña</div>
        <div style="font-size: 16px; line-height: 1.6; color: #FFD700;">
            <p style="color: #FFD700;">Hola,</p>
            <p style="color: #FFD700;">Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para cambiarla:</p>
            <a href="${resetLink}" style="display: inline-block; background-color: #FFD700; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold;">Cambiar Contraseña</a>
            <p style="color: #FFD700;">O ingresa este código en la app:</p>
            <div style="font-size: 18px; font-weight: bold; background-color: #FFD700; color: #000000; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0;">${code}</div>
            <p style="color: #FFD700;">Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
        <div style="margin-top: 20px; font-size: 14px; color: #FFD700;">
            <p style="color: #FFD700;">QuickFood - Tu comida rápida favorita</p>
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
</head>
<body style="font-family: Arial, sans-serif; background-color: #000000; color: #FFD700; margin: 0; padding: 20px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #000000; padding: 20px; border: 2px solid #FFD700; border-radius: 10px;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #FFD700;">QuickFood - Activar Usuario</div>
        <div style="font-size: 16px; line-height: 1.6; color: #FFD700;">
            <p style="color: #FFD700;">Hola,</p>
            <p style="color: #FFD700;">Para validar tu email y activar tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${activationLink}" style="display: inline-block; background-color: #FFD700; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold;">Activar Cuenta</a>
            <p style="color: #FFD700;">¡Bienvenido a QuickFood!</p>
        </div>
        <div style="margin-top: 20px; font-size: 14px; color: #FFD700;">
            <p style="color: #FFD700;">QuickFood - Tu comida rápida favorita</p>
        </div>
    </div>
</body>
</html>
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Errores de Resend que no se resuelven reintentando (config/datos inválidos)
const NON_RETRYABLE_ERROR_NAMES = new Set([
  'validation_error',
  'missing_api_key',
  'invalid_api_key',
  'restricted_api_key',
  'missing_required_field',
  'invalid_from_address',
  'invalid_to_address',
]);

const MAX_SEND_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1000;

// Función para enviar el correo electrónico con Resend
export async function sendEmail(destino, asuntoemail, mensajeemail, tipo = 'text') {
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

  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'QuickFood <onboarding@resend.dev>', // Sandbox de Resend: solo entrega al email de la cuenta hasta verificar un dominio propio
        to: [to],
        subject: subject,
        text: text,
        html: html,
      });

      if (error) {
        throw error;
      }

      console.log('✅ Correo electrónico enviado:', data?.id);
      return true;
    } catch (error) {
      const isLastAttempt = attempt === MAX_SEND_ATTEMPTS;
      const isRetryable = !NON_RETRYABLE_ERROR_NAMES.has(error?.name);

      console.error(
        `❌ Error al enviar el correo electrónico (intento ${attempt}/${MAX_SEND_ATTEMPTS}):`,
        error.message
      );

      if (!isRetryable || isLastAttempt) {
        return false;
      }

      await sleep(RETRY_BASE_DELAY_MS * attempt);
    }
  }

  return false;
}


