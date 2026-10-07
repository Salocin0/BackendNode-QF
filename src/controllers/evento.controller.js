import { DiaEvento } from '../DAO/models/diaEvento.model.js';
import { estadosEvento } from '../estados/estados/estadosEvento.js';
import { eventoService } from '../services/evento.service.js';
import { notificacionesService } from '../services/notificaciones.service.js';
import { EventoPayloadError, normalizeEventoPayload } from '../util/eventoPayload.js';
import { parseIsoDate, withEstadoEfectivo } from '../util/validation.js';

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
      console.log(eventos);
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
          data: withEstadoEfectivo(evento),
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

  async getDaysOneController(req, res) {
    try {
      const eventoId = req.params.id;
      const cantidadDiasEvento = await eventoService.getOneDays(eventoId);
      console.log(cantidadDiasEvento)
      if (cantidadDiasEvento !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'evento found',
          data: cantidadDiasEvento,
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
      const evento = req.body.evento;

      const result = await eventoService.update(id, evento);
      return res.status(200).json({
        status: 'success',
        msg: 'evento is updated',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.log(e);
      if (e instanceof EventoPayloadError) {
        return res.status(400).json({ status: 'error', msg: e.message, data: {} });
      }
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async updateOneControllerPreparacion(req, res) {
    try {
      const id = req.params.id;
      const datosEventoActualizar = req.body;

      // Validate day dates up-front (ISO only) so we never persist a half-created event.
      const diasInvalidos = (datosEventoActualizar.diasEvento || []).filter(
        (dia) => !parseIsoDate(dia.horaInicio) || !parseIsoDate(dia.horaFin)
      );
      if (diasInvalidos.length > 0) {
        return res.status(400).json({
          status: 'error',
          msg: 'horaInicio y horaFin de cada día deben ser fechas ISO válidas',
          data: {},
        });
      }

      const result = await eventoService.update(id, datosEventoActualizar);

      if (datosEventoActualizar.diasEvento && datosEventoActualizar.diasEvento.length > 0) {
        // One transaction and one bulk insert (instead of one round trip per day). Replacing the
        // days makes a repeated save of step 3/4 idempotent instead of duplicating them.
        await DiaEvento.sequelize.transaction(async (transaction) => {
          await DiaEvento.destroy({ where: { eventoId: id }, transaction });
          await DiaEvento.bulkCreate(
            datosEventoActualizar.diasEvento.map((dia) => ({
              nombre: `Día ${dia.dia}`,
              descripcion: `Descripción para el día ${dia.dia}`,
              fechaHoraInicioDiaEvento: parseIsoDate(dia.horaInicio),
              fechaHoraFinDiaEvento: parseIsoDate(dia.horaFin),
              tienePreventa: dia.tienePreventa !== undefined ? dia.tienePreventa : false,
              eventoId: id,
            })),
            { transaction }
          );
        });
        // Days saved: the web wizard leaves the event ready to operate (done once, not once per day).
        await estadosEvento.EnPreparacion2.actualizarEvento(id);
      }

      return res.status(200).json({
        status: 'success',
        msg: 'Evento actualizado correctamente',
        code: 200,
        data: result,
      });
    } catch (e) {
      console.log('Error:', e);
      if (e instanceof EventoPayloadError) {
        return res.status(400).json({ status: 'error', msg: e.message, data: {} });
      }
      if (e.message === 'No se encontró el evento con el id proporcionado') {
        return res.status(404).json({
          status: 'error',
          msg: e.message,
          data: {},
        });
      }
      return res.status(500).json({
        status: 'error',
        msg: 'Algo salió mal :(',
        data: {},
      });
    }
  }




  async createOneController(req, res) {
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
            cantidadDiasEvento,
            diasEvento,
            consumidorId,
            productorId,
        } = req.body;

        // ISO dates only: new Date() would silently swap day and month for dd/mm/yyyy strings.
        const parseDate = (dateStr) => parseIsoDate(dateStr);

        // A date that was sent but is not valid ISO must be rejected, not silently stored as null.
        const invalidDates = Object.entries({
            fechaHoraInicioEvento,
            fechaHoraFinEvento,
            fechaInicioPreventa,
            fechaFinPreventa,
        })
            .filter(([, value]) => value !== undefined && value !== null && value !== '' && !parseDate(value))
            .map(([name]) => name);
        if (invalidDates.length > 0) {
            return res.status(400).json({
                status: 'error',
                msg: `Fechas inválidas (se requiere formato ISO): ${invalidDates.join(', ')}`,
                code: 400,
                data: {},
            });
        }

        const nuevoEvento = {
            nombre,
            descripcion,
            img: imagenEvento,
            croquis,
            ubicacion,
            localidad,
            provincia,
            tipoEvento: normalizeEventoPayload({ tipoEvento }).tipoEvento,
            fechaHoraInicio: parseDate(fechaHoraInicioEvento),
            fechaHoraFin: parseDate(fechaHoraFinEvento),
            tienePreventa,
            fechaInicioPreventa: parseDate(fechaInicioPreventa),
            fechaFinPreventa: parseDate(fechaFinPreventa),
            horasAntesInicioEvento,
            plazoCancelacionPreventa,
            tipoPreventa,
            cantidadPuestos: cantidadPuestos || 0,
            conRepartidor: tieneRepartidores || false,
            cantidadRepartidores: cantidadRepartidores || 0,
            capacidadMaxima: capacidadMaxima || 0,
            tipoPago: normalizeEventoPayload({ tipoPago }).tipoPago,
            linkVentaEntradas,
            conButaca: tieneButacas || false,
            habilitado: true,
            estado: estado,
            latitud,
            longitud,
            restricciones,
            cantidadDiasEvento,
            consumidorId: consumidorId || req.headers['consumidorid'] || req.headers['ConsumidorId'] || 1,
            productorId,
            diasEvento: diasEvento || [],
        };

        const eventoCreado = await eventoService.create(nuevoEvento);

        if (eventoCreado) {
            if (diasEvento && diasEvento.length > 0) {
                for (const dia of diasEvento) {
                    console.log('Creando día:', {
                        nombre: `Día ${dia.dia}`,
                        descripcion: `Descripción para el día ${dia.dia}`,
                        horarioInicioEvento: dia.horaInicio,
                        horarioFinEvento: dia.horaFin,
                        tienePreventa: tienePreventa,
                        eventoId: eventoCreado.id,
                    });

                    try {
                        await DiaEvento.create({
                            nombre: `Día ${dia.dia}`,
                            descripcion: `Descripción para el día ${dia.dia}`,
                            fechaHoraInicioDiaEvento: parseDate(dia.horaInicio),
                            fechaHoraFinDiaEvento: parseDate(dia.horaFin),
                            tienePreventa: tienePreventa,
                            eventoId: eventoCreado.id,
                        });
                    } catch (error) {
                        console.error("Error al crear el día del evento:", error);
                    }
                }
            } else {
                console.log("No hay días para crear.");
            }

            return res.status(200).json({
                status: 'success',
                msg: 'Evento creado',
                code: 200,
                data: {
                    eventoId: eventoCreado.id,
                    ...eventoCreado,
                },
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
        if(accion === 'iniciarEvento'){
          notificacionesService.enviarNotificacionesPrecompra(eventoId);
        }
        res.status(200).json({ message: 'Estado del evento actualizado.',data: {message:"Estado del evento actualizado."} });
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
          data: [],
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
          data: [],
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
