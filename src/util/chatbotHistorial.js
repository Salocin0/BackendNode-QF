// Short conversation memory for Foody. The chat clients send the last messages with
// each question; the server only trusts what passes these checks. Dependency-free so
// it can be unit-tested without a DB or an OpenAI key.

export const MAX_MENSAJES_HISTORIAL = 6; // 3 exchanges (question + answer)
export const MAX_CHARS_POR_MENSAJE = 600;

const limpiarTexto = (texto) =>
  String(texto)
    // Old answers keep the link label only: URLs are long and add nothing to the context.
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * Accepts the history as an array or as a JSON string (form-encoded requests) of
 * { rol: 'usuario' | 'foody', texto }. Invalid input yields [] so the bot simply
 * answers without memory, as before.
 */
export const normalizarHistorial = (raw) => {
  let lista = raw;
  if (typeof raw === 'string') {
    try {
      lista = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(lista)) return [];

  return lista
    .filter((m) => m && typeof m === 'object' && (m.rol === 'usuario' || m.rol === 'foody') && typeof m.texto === 'string')
    .map((m) => {
      const texto = limpiarTexto(m.texto);
      return { rol: m.rol, texto: texto.length > MAX_CHARS_POR_MENSAJE ? `${texto.slice(0, MAX_CHARS_POR_MENSAJE)}…` : texto };
    })
    .filter((m) => m.texto)
    .slice(-MAX_MENSAJES_HISTORIAL);
};

export const formatearHistorial = (historial) =>
  Array.isArray(historial) && historial.length
    ? historial.map((m) => `${m.rol === 'usuario' ? 'Usuario' : 'Foody'}: ${m.texto}`).join('\n')
    : '(sin mensajes previos)';
