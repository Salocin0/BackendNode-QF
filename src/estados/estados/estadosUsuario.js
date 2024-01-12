import { creado } from '../estadosConcretosUsuario/creadoUsuario.state.js';
import { deshabilitado } from '../estadosConcretosUsuario/deshabilitadoUsuario.state.js';
import { pendienteDeValidacion } from '../estadosConcretosUsuario/pendienteDeValidacionUsuario.state.js';
import { validado } from '../estadosConcretosUsuario/validadoUsuario.state.js';

export const estadosUsuario = {
  creado: {
    crearUsuario: async (usuario) => {
      return creado.crearUsuario(usuario);
    },

    solicitarRol: async (usuario) => {
      return creado.solicitarRol(rolActual, nuevoRol);
    },

    rechazar: async (usuario) => {
      return creado.rechazar(usuario);
    },

    validar: async (usuario, nuevoRol) => {
      return creado.validar(usuario, nuevoRol);
    },

    modificarRol: async (usuario, rolActual, nuevoRol) => {
      return creado.validar(usuario, rolActual, nuevoRol);
    },

    cancelarRol: async (usuario, rolActual) => {
      return creado.cancelarRol(usuario, rolActual);
    },

    deshabilitar: async (usuario) => {
      return creado.deshabilitar(usuario);
    },

    habilitarCreado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },

    habilitarValidado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },
  },

  pendienteDeValidacion: {
    crearUsuario: async (usuario) => {
      return pendienteDeValidacion.crearUsuario(usuario);
    },

    solicitarRol: async (usuario) => {
      return pendienteDeValidacion.solicitarRol(rolActual, nuevoRol);
    },

    rechazar: async (usuario) => {
      return pendienteDeValidacion.rechazar(usuario);
    },

    validar: async (usuario, nuevoRol) => {
      return creado.validar(usuario, nuevoRol);
    },

    modificarRol: async (usuario, rolActual, nuevoRol) => {
      return pendienteDeValidacion.validar(usuario, rolActual, nuevoRol);
    },

    cancelarRol: async (usuario, rolActual) => {
      return pendienteDeValidacion.cancelarRol(usuario, rolActual);
    },

    deshabilitar: async (usuario) => {
      return pendienteDeValidacion.deshabilitar(usuario);
    },

    habilitarCreado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },

    habilitarValidado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },
  },

  validado: {
    crearUsuario: async (usuario) => {
      return validado.crearUsuario(usuario);
    },

    solicitarRol: async (usuario) => {
      return validado.solicitarRol(rolActual, nuevoRol);
    },

    rechazar: async (usuario) => {
      return validado.rechazar(usuario);
    },

    validar: async (usuario, nuevoRol) => {
      return creado.validar(usuario, nuevoRol);
    },

    modificarRol: async (usuario, rolActual, nuevoRol) => {
      return validado.validar(usuario, rolActual, nuevoRol);
    },

    cancelarRol: async (usuario, rolActual) => {
      return validado.cancelarRol(usuario, rolActual);
    },

    deshabilitar: async (usuario) => {
      return validado.deshabilitar(usuario);
    },

    habilitarCreado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },

    habilitarValidado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },
  },

  deshabilitado: {
    crearUsuario: async (usuario) => {
      return deshabilitado.crearUsuario(usuario);
    },

    solicitarRol: async (usuario) => {
      return deshabilitado.solicitarRol(rolActual, nuevoRol);
    },

    rechazar: async (usuario) => {
      return deshabilitado.rechazar(usuario);
    },

    validar: async (usuario, nuevoRol) => {
      return creado.validar(usuario, nuevoRol);
    },

    modificarRol: async (usuario, rolActual, nuevoRol) => {
      return deshabilitado.validar(usuario, rolActual, nuevoRol);
    },

    cancelarRol: async (usuario, rolActual) => {
      return deshabilitado.cancelarRol(usuario, rolActual);
    },

    deshabilitar: async (usuario) => {
      return deshabilitado.deshabilitar(usuario);
    },

    habilitarCreado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },

    habilitarValidado: async (usuario, estado) => {
      return creado.habilitar(usuario, estado);
    },
  },
};
