// Benchmarks externos que FoodyAnalyst puede citar. El LLM tiene prohibido usar cualquier otra referencia
// "del sector", así que solo cargá cifras verificadas con su fuente.
//
// Formato de cada entrada:
// {
//   metrica: 'valoracion' | 'entrega' | 'ticketPromedio' | 'gastoPorAsistente' | 'mixBebidas' | ...,
//   descripcion: 'Qué mide exactamente la cifra',
//   valor: 'Cifra tal cual la publica la fuente (con unidad y escala)',
//   fuente: 'Organización', titulo: 'Nombre del informe', anio: 2025,
//   region: 'Argentina', segmento: 'Festivales > 10.000 asistentes',
//   url: 'https://...',
//   comparabilidad: 'Limitaciones al compararla con QuickFood (escala distinta, otro segmento, etc.)',
// }
export const benchmarksExternos = [];
