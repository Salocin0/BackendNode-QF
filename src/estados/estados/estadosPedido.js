import { aceptado } from '../estadosConcretoPedido/aceptadoPedido.state.js';
import { cancelado } from '../estadosConcretoPedido/canceladoPedido.state.js';
import { enCamino } from '../estadosConcretoPedido/enCaminoPedido.state.js';
import { enPreparacion } from '../estadosConcretoPedido/enPreparacion.state.js';
import { entregado } from '../estadosConcretoPedido/entregadoPedido.state.js';
import { pendiente } from '../estadosConcretoPedido/pendientePedido.state.js';
import { listo } from '../estadosConcretoPedido/listoPedido.state.js';
import { valorado } from '../estadosConcretoPedido/valoradoPedido.state.js';

export const estadosPedido = {
  Pendiente: {
    crearPedido: async (pedido) => {
      return pendiente.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return pendiente.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return pendiente.asignar(pedido);
    },
    
    valorado: async (pedido) => {
      return pendiente.valorado(pedido);
    },
  },

  Aceptado: {
    crearPedido: async (pedido) => {
      return aceptado.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return aceptado.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return aceptado.asignar(pedido);
    },

    valorado: async (pedido) => {
      return aceptado.valorado(pedido);
    },
  },

  EnPreparacion: {
    crearPedido: async (pedido) => {
      return enPreparacion.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return enPreparacion.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return enPreparacion.asignar(pedido);
    },

    valorado: async (pedido) => {
      return enPreparacion.valorado(pedido);
    },
  },

  EnCamino: {
    crearPedido: async (pedido) => {
      return enCamino.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return enCamino.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return enCamino.asignar(pedido);
    },

    valorado: async (pedido) => {
      return enCamino.valorado(pedido);
    },
  },

  Cancelado: {
    crearPedido: async (pedido) => {
      return cancelado.crearPedido(pedido);
    },
    
    tomarPedido: async (pedido) => {
      return cancelado.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return cancelado.asignar(pedido);
    },

    valorado: async (pedido) => {
      return cancelado.valorado(pedido);
    },
  },

  Entregado: {
    crearPedido: async (pedido) => {
      return entregado.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return entregado.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
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
    },

    asignar: async (pedido) => {
      return entregado.asignar(pedido);
    },
    
    valorado: async (pedido) => {
      return entregado.valorado(pedido);
    },
  },

  Listo: {
    crearPedido: async (pedido) => {
      return listo.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return listo.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
      return listo.preparar(pedido);
    },

    pedidoPreparado: async (pedido) => {
      return listo.pedidoPreparado(pedido);
    },

    pedidoEntregado: async (pedido) => {
      return listo.pedidoEntregado(pedido);
    },

    cancelar: async (pedido) => {
      return listo.cancelar(pedido);
    },
    
    asignar: async (pedido) => {
      return listo.asignar(pedido);
    },
        
    valorado: async (pedido) => {
      return listo.valorado(pedido);
    },
  },

  Valorado: {
    crearPedido: async (pedido) => {
      return valorado.crearPedido(pedido);
    },

    tomarPedido: async (pedido) => {
      return valorado.tomarPedido(pedido);
    },

    preparar: async (pedido) => {
      return valorado.preparar(pedido);
    },

    pedidoPreparado: async (pedido) => {
      return valorado.pedidoPreparado(pedido);
    },

    pedidoEntregado: async (pedido) => {
      return valorado.pedidoEntregado(pedido);
    },

    cancelar: async (pedido) => {
      return valorado.cancelar(pedido);
    },
    
    asignar: async (pedido) => {
      return valorado.asignar(pedido);
    },
        
    valorado: async (pedido) => {
      return valorado.valorado(pedido);
    },
  },
};
