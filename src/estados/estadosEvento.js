import { enPreparacion } from "./enPreparacionEvento.state.js";

export const estadosEvento = {
    enPreparacion: {
        crearEvento: async (evento) => {
            return enPreparacion.crearEvento(evento);
        },
        confirmar: (evento) => {
            return enPreparacion.confirmar(evento);
        },
    },
    enCurso: {
        iniciar: (evento) => {
        },
        accionB: (evento) => {
        },
    },
};
