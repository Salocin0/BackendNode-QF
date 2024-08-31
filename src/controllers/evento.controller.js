import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { estadosEvento } from '../estados/estados/estadosEvento.js';
import { eventoService } from '../services/evento.service.js';

class EventoController {
  async getAllController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const eventos = await eventoService.getAll(consumidorId);
      if (eventos.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all eventos',
          data: eventos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'eventos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getAllInStateController(req, res) {
    try {
      const estado = req.params.state;
      console.log('ESTADO' + estado);
      const eventos = await eventoService.getAllInState(estado);
      if (eventos.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all eventos',
          data: eventos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'eventos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getAllWithoutStateController(req, res) {
    try {
      const consumidorId = req.header('ConsumidorId');
      console.log(consumidorId);
      const eventos = await eventoService.getAll(consumidorId);
      if (eventos.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all eventos',
          data: eventos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'eventos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getOneController(req, res) {
    try {
      const eventoId = req.params.id;
      const evento = await eventoService.getOne(eventoId);
      if (evento !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'evento found',
          data: evento,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'evento with id ' + req.params.id + ' not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async updateOneController(req, res) {
    try {
      const id = req.params.id;
      const { evento } = req.body;
      const result = await eventoService.update(id, evento);
      return res.status(200).json({
        status: 'success',
        msg: 'evento is updated',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }
  async createOneController(req, res) {

    console.log("ENTRE");
    try {
        const {
            nombre,
            descripcion,
            imagenEvento,
            croquis,
            ubicacion,
            localidad,
            provincia,
            tipoEvento,
            fechaHoraInicioEvento,
            fechaHoraFinEvento,
            tienePreventa,
            fechaInicioPreventa,
            fechaFinPreventa,
            horasAntesInicioEvento,
            plazoCancelacionPreventa,
            tipoPreventa,
            cantidadPuestos,
            tieneRepartidores,
            cantidadRepartidores,
            capacidadMaxima,
            tipoPago,
            linkVentaEntradas,
            restricciones,
            tieneButacas,
            estado,
            latitud,
            longitud,
            diasEvento,
        } = req.body;

        console.log(req.body);

        // Validar campos requeridos
        if (!nombre || !fechaHoraInicioEvento || !fechaHoraFinEvento) {
            return res.status(400).json({
                status: 'error',
                msg: 'Nombre, fecha de inicio y fecha de fin son requeridos',
                code: 400,
                data: {},
            });
        }

        // Validar formato de diasEvento
        if (!Array.isArray(diasEvento) || !diasEvento.every(dia => dia.dia && dia.horaInicio && dia.horaFin)) {
            return res.status(400).json({
                status: 'error',
                msg: 'Formato de diasEvento incorrecto',
                code: 400,
                data: {},
            });
        }

        // Crear el objeto evento
        const nuevoEvento = {
            nombre,
            descripcion,
            img: imagenEvento,
            croquis,
            ubicacion,
            localidad,
            provincia,
            tipoEvento,
            fechaHoraInicio: fechaHoraInicioEvento,
            fechaHoraFin: fechaHoraFinEvento,
            tienePreventa: tienePreventa,
            fechaInicioPreventa: horasAntesInicioEvento,
            cantidadPuestos: cantidadPuestos || 0,
            conRepartidor: tieneRepartidores || false,
            cantidadRepartidores: cantidadRepartidores || 0,
            capacidadMaxima: capacidadMaxima || 0,
            tipoPago,
            linkVentaEntradas,
            conButaca: tieneButacas || false,
            habilitado: true,
            estado,
            latitud,
            longitud,
            restricciones,
            consumidorId: 1,
            diasEvento: diasEvento,
        };

        console.log('Datos del evento:', nuevoEvento);

        // Crear el evento
        const eventoCreado = await eventoService.create(nuevoEvento);

        if (eventoCreado) {
            for (const dia of diasEvento) {
                console.log('Creando día:', {
                    nombre: `Día ${dia.dia}`,
                    descripcion: `Descripción para el día ${dia.dia}`,
                    horarioInicioEvento: dia.horaInicio,
                    horarioFinEvento: dia.horaFin,
                    tienePreventa: tienePreventa,
                    eventoId: eventoCreado.id,
                });

                await DiaEvento.create({
                    nombre: `Día ${dia.dia}`,
                    descripcion: `Descripción para el día ${dia.dia}`,
                    fechaHoraInicioDiaEvento: dia.horaInicio,
                    fechaHoraFinDiaEvento: dia.horaFin,
                    tienePreventa: tienePreventa,
                    eventoId: eventoCreado.id,
                });
            }

            return res.status(200).json({
                status: 'success',
                msg: 'Evento creado',
                code: 200,
                data: eventoCreado,
            });
        } else {
            return res.status(400).json({
                status: 'error',
                msg: 'Error al crear el evento',
                code: 400,
                data: {},
            });
        }
    } catch (e) {
        console.log('Error:', e);
        return res.status(500).json({
            status: 'error',
            msg: 'Error interno del servidor',
            code: 500,
            data: {},
        });
    }
}






  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const evento = await eventoService.delete(id);
      return res.status(200).json({
        status: 'success',
        msg: 'encargado deleted',
        code: 200,
        data: evento,
      });
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async updateStateController(req, res) {
    const eventoId = req.params.id;
    const accion = req.params.accion;
    try {
      const evento = await eventoService.getOne(eventoId);
      const estadoActual = evento.estado;

      console.log(estadoActual);

      if (estadosEvento[estadoActual] && estadosEvento[estadoActual][accion]) {
        await estadosEvento[estadoActual][accion](evento);
        res.status(200).json({ message: 'Estado del evento actualizado.' });
      } else {
        res.status(400).json({ message: 'No se encontró la acción para el estado actual.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al cambiar el estado del evento.' });
    }
  }

  async getAllInStateAndWithoutAsociacionValidaController(req, res) {
    try {
      const estado = req.params.state;
      const idConsumidor = req.params.idConsumidor;

      const eventos = await eventoService.getAllInStateAndWithoutAsociacionValida(estado,idConsumidor);
      if (eventos.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all eventos',
          data: eventos,
        });
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'eventos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getAllInStateAndWithoutAsociacionValidaPuestoController(req, res) {
    try {
      const estado = req.params.state;
      const idConsumidor = req.params.idConsumidor;
      const idPuesto = req.params.idPuesto;

      const eventos = await eventoService.getAllInStateAndWithoutAsociacionPuestoValida(estado,idConsumidor,idPuesto);
      if (eventos.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all eventos',
          data: eventos,
        });
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'eventos not found',
          data: {},
        });
      }
    } catch (e) {
      console.log(e);

      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }
}

export const eventoController = new EventoController();
