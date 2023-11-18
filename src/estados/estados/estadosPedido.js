import { aceptado } from "../estadosConcretoPedido/aceptadoPedido.state.js";
import { cancelado } from "../estadosConcretoPedido/canceladoPedido.state.js";
import { enCamino } from "../estadosConcretoPedido/enCaminoPedido.state.js";
import { enPreparacion } from "../estadosConcretoPedido/enPreparacionPedido.state.js";
import { entregado } from "../estadosConcretoPedido/entregadoPedido.state.js";
import { pendiente } from "../estadosConcretoPedido/pendientePedido.state.js";

export const estadosPedido = {
    pendiente: {
        crearPedido: async (pedido) => {
            return pendiente.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return pendiente.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return pendiente.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return pendiente.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return pendiente.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return pendiente.cancelar(pedido);
        }
    },

    aceptado: {
        crearPedido: async (pedido) => {
            return aceptado.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return aceptado.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return aceptado.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return aceptado.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return aceptado.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return aceptado.cancelar(pedido);
        }
    },

    enPreparacion: {
        crearPedido: async (pedido) => {
            return enPreparacion.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return enPreparacion.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return enPreparacion.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return enPreparacion.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return enPreparacion.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return enPreparacion.cancelar(pedido);
        }
    },

    enCamino: {
        crearPedido: async (pedido) => {
            return enCamino.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return enCamino.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return enCamino.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return enCamino.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return enCamino.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return enCamino.cancelar(pedido);
        }
    },

    cancelado: {
        crearPedido: async (pedido) => {
            return cancelado.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return cancelado.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return cancelado.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return cancelado.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return cancelado.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return cancelado.cancelar(pedido);
        }
    },

    entregado: {
        crearPedido: async (pedido) => {
            return entregado.crearPedido(pedido);
        },
        tomarPedido: async (pedido) => {
            return entregado.tomarPedido(pedido);
        },
        preperar: async (pedido) => {
            return entregado.preparar(pedido);
        },
        pedidoPreparado: async (pedido) => {
            return entregado.pedidoPreparado(pedido);
        },
        pedidoEntregado: async (pedido) => {
            return entregado.pedidoEntregado(pedido);
        },
        cancelar: async (pedido) => {
            return entregado.cancelar(pedido);
        }
    },

};
