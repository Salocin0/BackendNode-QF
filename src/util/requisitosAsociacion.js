export class RequisitoError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const options = (value) => {
  if (Array.isArray(value)) return value.map(String);
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.map(String); } catch {}
  return String(value || '').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
};
export function encodeRequirementAnswer(requirement, answer) {
  if (['PDF', 'Imagen'].includes(requirement.tipo)) {
    if (!answer || typeof answer !== 'object' || typeof answer.data !== 'string') throw new RequisitoError(`Adjuntá el archivo de ${requirement.titulo}`);
    if (answer.data.length > Math.ceil(MAX_DOCUMENT_BYTES * 4 / 3) + 100) throw new RequisitoError('El archivo debe pesar hasta 5 MB');
    const match = /^data:(application\/pdf|image\/png|image\/jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(answer.data);
    if (!match || (requirement.tipo === 'PDF' && match[1] !== 'application/pdf') || (requirement.tipo === 'Imagen' && !match[1].startsWith('image/'))) throw new RequisitoError('El formato del archivo no es válido');
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > MAX_DOCUMENT_BYTES) throw new RequisitoError('El archivo debe pesar hasta 5 MB');
    const valid = match[1] === 'application/pdf' ? bytes.subarray(0, 5).toString() === '%PDF-' : match[1] === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!valid) throw new RequisitoError('El contenido del archivo no coincide con su formato');
    const fallback = match[1] === 'application/pdf' ? 'documento.pdf' : match[1] === 'image/png' ? 'imagen.png' : 'imagen.jpg';
    const name = String(answer.name || fallback).split(/[\\/]/).pop().replace(/[\r\n\x00-\x1f"<>]/g, '').slice(0, 150) || fallback;
    return JSON.stringify({ kind: 'file', name, mimeType: match[1], base64: bytes.toString('base64') });
  }
  if (!['string', 'number'].includes(typeof answer) || !String(answer).trim()) throw new RequisitoError(`Completá ${requirement.titulo}`);
  const text = String(answer).trim();
  if (text.length > 10000) throw new RequisitoError('La respuesta es demasiado larga');
  if (requirement.tipo === 'Numerico' && !Number.isFinite(Number(text))) throw new RequisitoError(`${requirement.titulo} debe ser un número`);
  if (['Opciones', 'select'].includes(requirement.tipo) && !options(requirement.opciones).includes(text)) throw new RequisitoError(`Seleccioná una opción válida para ${requirement.titulo}`);
  return text;
}
export function normalizeRequirementAnswers(requirements, respuestas) {
  const entries = Object.values(respuestas || {});
  if (entries.length !== requirements.length) throw new RequisitoError('Completá todos los requisitos del evento');
  const ids = new Set();
  return requirements.map((requirement) => {
    const answer = entries.find((item) => String(item?.RestriccionId) === String(requirement.id));
    if (!answer || ids.has(String(answer.RestriccionId))) throw new RequisitoError('Las respuestas no corresponden a los requisitos del evento');
    ids.add(String(answer.RestriccionId));
    return { restriccionId: requirement.id, respuesta: encodeRequirementAnswer(requirement, answer.respuesta) };
  });
}
export function decodeRequirementFile(value) {
  try { const file = JSON.parse(value); return file.kind === 'file' && ['application/pdf', 'image/png', 'image/jpeg'].includes(file.mimeType) && typeof file.base64 === 'string' ? file : null; } catch { return null; }
}
