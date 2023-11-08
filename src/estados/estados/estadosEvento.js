import { cancelado } from "../estadosConcretosEventos/canceladoEvento.state.js";
import { confirmado } from "../estadosConcretosEventos/confirmadoEvento.state.js";
import { enCurso } from "../estadosConcretosEventos/enCursoEvento.state.js";
import { enPreparacion } from "../estadosConcretosEventos/enPreparacionEvento.state.js";
import { finalizado } from "../estadosConcretosEventos/finalizadoEvento.state.js";
import { pausado } from "../estadosConcretosEventos/pausadoEvento.state.js";


export const estadosEvento = {
    enPreparacion: {
        crearEvento: async (evento) => {
            return enPreparacion.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return enPreparacion.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return enPreparacion.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return enPreparacion.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return enPreparacion.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return enPreparacion.reprogramarEvento(evento);
        }

    },

    enCurso: {
        crearEvento: async (evento) => {
            return enCurso.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return enCurso.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return enCurso.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return enCurso.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return enCurso.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return enCurso.reprogramarEvento(evento);
        }
    },

    confirmado: {
        crearEvento: async (evento) => {
            return confirmado.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return confirmado.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return confirmado.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return confirmado.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return confirmado.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return confirmado.reprogramarEvento(evento);
        }
    },

    pausado: {
        crearEvento: async (evento) => {
            return pausado.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return pausado.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return pausado.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return pausado.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return pausado.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return pausado.reprogramarEvento(evento);
        }
    },

    cancelado: {
        crearEvento: async (evento) => {
            return cancelado.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return cancelado.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return cancelado.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return cancelado.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return cancelado.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return cancelado.reprogramarEvento(evento);
        }
    },

    finalizado: {
        crearEvento: async (evento) => {
            return finalizado.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return finalizado.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return finalizado.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return finalizado.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return finalizado.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return finalizado.reprogramarEvento(evento);
        }
    },



};
