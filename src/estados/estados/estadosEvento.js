import { cancelado } from "../estadosConcretosEventos/canceladoEvento.state.js";
import { confirmado } from "../estadosConcretosEventos/confirmadoEvento.state.js";
import { EnCurso } from "../estadosConcretosEventos/enCursoEvento.state.js";
import { EnPreparacion } from "../estadosConcretosEventos/enPreparacionEvento.state.js";
import { finalizado } from "../estadosConcretosEventos/finalizadoEvento.state.js";
import { pausado } from "../estadosConcretosEventos/pausadoEvento.state.js";


export const estadosEvento = {
    EnPreparacion: {
        crearEvento: async (evento) => {
            return EnPreparacion.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return EnPreparacion.confirmarEvento(evento);
        },
        cancelarEvento: (evento) => {
            return EnPreparacion.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return EnPreparacion.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return EnPreparacion.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return EnPreparacion.reprogramarEvento(evento);
        },
        activarEvento: (evento) => {
            return EnPreparacion.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return EnPreparacion.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return EnPreparacion.continuarEvento(evento);
        }
    },

    EnCurso: {
        crearEvento: async (evento) => {
            return EnCurso.crearEvento(evento);
        },
        confirmarEvento: (evento) => {
            return EnCurso.confirmar(evento);
        },
        cancelarEvento: (evento) => {
            return EnCurso.cancelar(evento);
        },
        iniciarEvento: (evento) => {
            return EnCurso.iniciarEvento(evento);
        },
        finalizarEvento: (evento) => {
            return EnCurso.finalizarEvento(evento);
        },
        reprogramarEvento: (evento) => {
            return EnCurso.reprogramarEvento(evento);
        },
        activarEvento: (evento) => {
            return EnCurso.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return EnCurso.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return EnCurso.continuarEvento(evento);
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
        },
        activarEvento: (evento) => {
            return confirmado.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return confirmado.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return confirmado.continuarEvento(evento);
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
        },
                activarEvento: (evento) => {
            return pausado.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return pausado.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return pausado.continuarEvento(evento);
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
        },
        activarEvento: (evento) => {
            return cancelado.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return cancelado.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return cancelado.continuarEvento(evento);
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
        },
        activarEvento: (evento) => {
            return finalizado.activarEvento(evento);
        },
        desactivarEvento: (evento) => {
            return finalizado.desactivarEvento(evento);
        },
        continuarEvento: (evento) => {
            return finalizado.continuarEvento(evento);
        }
    },

};
