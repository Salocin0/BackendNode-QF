// Order lists (consumer "Mis pedidos", courier history, stand board) show the
// newest order first. `id` breaks ties between orders with the same timestamp.
export const PEDIDOS_ULTIMO_PRIMERO = [['fecha', 'DESC'], ['id', 'DESC']];
