// Text helpers for Foody's answers. Dependency-free so they can be unit-tested.

export const NOTA_RESPUESTA_LARGA =
  'La respuesta era muy larga: preguntame por un evento o un puesto puntual y te paso el detalle completo.';

/**
 * Closes an answer the model cut because it hit the token limit
 * (finish_reason === 'length'), e.g. "...opciones de comida veg".
 * Drops the unfinished last line (or sentence) and appends a short note,
 * so the user never sees a phrase cut in half.
 */
export const cerrarRespuestaCortada = (texto) => {
  const base = typeof texto === 'string' ? texto.trimEnd() : '';
  let completo = base;

  const ultimoSalto = base.lastIndexOf('\n');
  if (ultimoSalto > 0) {
    completo = base.slice(0, ultimoSalto).trimEnd();
  } else {
    const finOracion = Math.max(base.lastIndexOf('. '), base.lastIndexOf('! '), base.lastIndexOf('? '));
    completo = finOracion > 0 ? base.slice(0, finOracion + 1) : '';
  }

  return completo ? `${completo}\n\n${NOTA_RESPUESTA_LARGA}` : NOTA_RESPUESTA_LARGA;
};

// Streamed text cannot be taken back, so a cut stream only gets the note appended.
export const cierreDeStreamCortado = () => `…\n\n${NOTA_RESPUESTA_LARGA}`;
