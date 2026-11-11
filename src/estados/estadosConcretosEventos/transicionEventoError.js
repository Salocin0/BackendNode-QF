/** A state transition the event cannot make in its current state. The API answers it with 400 and its message. */
export class TransicionEventoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TransicionEventoError';
    this.status = 400;
  }
}

export const MENSAJE_EVENTO_INCOMPLETO =
  'No se puede confirmar el evento: faltan completar pasos de su creación. Editalo y completá todos los datos.';
