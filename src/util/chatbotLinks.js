// Helpers for the "Foody" chatbot: decide which external URLs are worth showing.
// Dependency-free on purpose so it can be unit-tested without a DB or an OpenAI key.

// Hosts that look valid but never resolve (demo/placeholder data seeded for presentations).
const PLACEHOLDER_HOSTS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'localhost',
]);

// TLDs reserved by RFC 2606/6761: they can never be real, so a link using them is dead.
const RESERVED_TLDS = ['.demo', '.test', '.invalid', '.example', '.localhost'];

const isPlaceholderHost = (hostname) => {
  const host = String(hostname || '').toLowerCase();
  if (!host) return true;
  if (PLACEHOLDER_HOSTS.has(host)) return true;
  // Subdomains of a placeholder host (sub.example.org) are placeholders too.
  for (const placeholder of PLACEHOLDER_HOSTS) {
    if (host.endsWith(`.${placeholder}`)) return true;
  }
  return RESERVED_TLDS.some((tld) => host === tld.slice(1) || host.endsWith(tld));
};

/**
 * Returns a normalized absolute http(s) URL, or null when the value is missing,
 * malformed, uses another protocol, or points at a placeholder host.
 * The chatbot uses this so it never offers a link that cannot be opened.
 */
export const sanitizeExternalUrl = (value) => {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (isPlaceholderHost(parsed.hostname)) return null;

  return parsed.toString();
};

export { isPlaceholderHost };

/**
 * Adds a `link` to every puesto and product of an event's "carta" so the model can
 * link them like it links events. The ids are dropped afterwards: the model only
 * needs the link, and fewer fields keep the prompt smaller.
 * - puesto:   {base}/productos-puesto/{puestoId}?evento={eventoId}
 * - producto: {base}/productos-puesto/{puestoId}?evento={eventoId}&producto={productoId}
 */
export const enlazarCarta = (carta, eventoId, base = '') => {
  if (!Array.isArray(carta)) return carta;
  return carta.map((entrada) => {
    if (!entrada || typeof entrada !== 'object') return entrada;
    const { puestoId, productos, ...resto } = entrada;
    if (puestoId == null || eventoId == null) return { ...resto, productos };
    const linkPuesto = `${base}/productos-puesto/${puestoId}?evento=${eventoId}`;
    return {
      ...resto,
      link: linkPuesto,
      productos: Array.isArray(productos)
        ? productos.map((producto) => {
            if (!producto || typeof producto !== 'object') return producto;
            const { id, ...datos } = producto;
            return id == null ? datos : { ...datos, link: `${linkPuesto}&producto=${id}` };
          })
        : productos,
    };
  });
};
