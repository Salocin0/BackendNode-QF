import { Asociacion } from '../DAO/models/asociacion.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { Puesto } from '../DAO/models/puesto.model.js';
import { Repartidor } from '../DAO/models/repartidor.model.js';
import { estadosAsociacion } from '../estados/estados/estadosAsociacion.js';
import { asociacionService } from '../services/asociacion.service.js';
import { puestoService } from '../services/puesto.service.js';
import { repartidorService } from '../services/repartidor.service.js';
class AsociacionController {
  async getAllController(req, res) {
    try {
      const consumidorid = req.headers['consumidorid'];
      const asociaciones = await asociacionService.getAll(consumidorid);
      if (asociaciones) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all asociaciones',
          data: asociaciones,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociaciones not found',
          data: {},
        });
      }
    } catch (e) {
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }
  async getAllInEventController(req, res) {
    try {
      const eventId = req.params.id;
      console.log('Evento ID: ' + eventId);

      const asociaciones = await asociacionService.getAllInEvent(eventId);

      if (!asociaciones || asociaciones.length === 0) {
        return res.status(404).json({
          status: 'error',
          msg: 'Asociaciones not found for the event',
          data: {},
          code: 404,
        });
      }

      const asociacionesConDetalles = await Promise.all(
        asociaciones.map(async (asociacion) => {
          const detallesPuesto = await puestoService.getPuestoDetails(asociacion.puestoId);
          let detallesRepartidor = null;

          if (asociacion.repartidoreId) {
            detallesRepartidor = await repartidorService.getRepartidorDetails(asociacion.repartidoreId);
          }

          return {
            ...asociacion.toJSON(),
            puesto: detallesPuesto,
            repartidor: detallesRepartidor,
          };
        })
      );

      return res.status(200).json({
        status: 'success',
        msg: 'Found all associations with puestos and/or repartidores',
        data: asociacionesConDetalles,
        code: 200,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        data: {},
        code: 500,
      });
    }
  }

  async getOneController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.getOne(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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

  async rechazarController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.rechazar(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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

  async aceptarController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.aceptar(Id);
      if (asociacion !== null) {

        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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

  async cancelarController(req, res) {
    try {
      const Id = req.params.id;
      const asociacion = await asociacionService.cancelar(Id);
      if (asociacion !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'asociacion found',
          data: asociacion,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'asociacion with id ' + req.params.id + ' not found',
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

  async createOneController(req, res) {
    try {
      const eventoid = req.params.eventoId;
      const puestoId = req.params.puestoId;
      const consumidorId = req.params.consumidorId;
      const { restricciones } = req.body;
      const nuevaAsociacion = {
        puestoId: Number(puestoId),
        repartidorId: consumidorId,
        eventoId: Number(eventoid),
      };
      console.log(nuevaAsociacion);
      const asociacionCreado = await asociacionService.create(nuevaAsociacion, restricciones, consumidorId);

      return res.status(200).json({
        status: 'success',
        msg: 'Restriccion created',
        code: 200,
        data: asociacionCreado,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async createSimpleOneController(req, res) {
    try {
      const eventoid = req.params.eventoId;
      const puestoId = req.params.puestoId;
      const consumidorId = req.params.consumidorId;
      console.log(puestoId);
      const existingAsociacion = null;
      if(Number(puestoId)===0){
        existingAsociacion = await asociacionService.getEventoByRepartidor(Number(eventoid),Number(consumidorId))
      }else{
        existingAsociacion = await asociacionService.getByEventoPuesto(Number(eventoid), Number(puestoId));
      }

      if (existingAsociacion) {
        return res.status(400).json({
          status: 'error',
          msg: 'La asociación para este evento y puesto ya existe',
          code: 400,
          data: {},
        });
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'Asociación creada exitosamente',
          code: 200,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async verifyRepartidorController(req, res) {
    try {
      const eventoid = req.params.eventoId;
      const consumidorId = req.params.consumidorId;

      const existingAsociacion = await asociacionService.getEventoByRepartidor(Number(eventoid), Number(consumidorId));
      if (existingAsociacion) {
        const asociacionNotificaciones = await asociacionService.sendNotificacionesWebRepartidorAsociacion(eventoid)

        return res.status(400).json({
          status: 'error',
          msg: 'La asociación para este evento y puesto ya existe',
          code: 400,
          data: {},
        });
      } else {
        console.log("Entre!")

        return res.status(200).json({
          status: 'success',
          msg: 'Asociación creada exitosamente',
          code: 200,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async createAsociacion(req, res) {
    try {
      const eventoid = req.params.eventoId;
      const puestoId = req.params.puestoId;
      const consumidorId = req.params.consumidorId;
      var nuevaAsociacion = null;
      if(puestoId==0 || puestoId==="0"){
        nuevaAsociacion = {
          puestoId: 0,
          repartidoreId: Number(consumidorId),
          eventoId: Number(eventoid),
        };
      }else if(consumidorId==0 || consumidorId==="0"){
        nuevaAsociacion = {
          puestoId: Number(puestoId),
          repartidoreId: 0,
          eventoId: Number(eventoid),
        };
      }else{
        nuevaAsociacion = {
          puestoId: Number(puestoId),
          repartidoreId: Number(consumidorId),
          eventoId: Number(eventoid),
        };
      }

      const asociacionCreada = await asociacionService.create(nuevaAsociacion, null, consumidorId);

      if (asociacionCreada) {
        //const asociacionNotificaciones = await asociacionService.sendNotificacionesWebEventoAsociacion(eventoid)

        return res.status(200).json({
          status: 'success',
          msg: 'Asociación creada exitosamente',
          code: 200,
          data: asociacionCreada,
        });
      } else {
        return res.status(500).json({
          status: 'error',
          msg: 'No se pudo crear la asociación',
          code: 500,
          data: {},
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        status: 'error',
        msg: 'Algo salió mal :(',
        code: 500,
        data: {},
      });
    }
  }

  async getAllByConsumidorId(req, res) {
    try {
      const { consumidorId } = req.params;
      
      // Obtener el consumidor
      const consumidor = await Consumidor.findByPk(consumidorId);
  
      if (!consumidor) {
        return res.status(404).json({
          status: 'error',
          msg: 'Consumidor not found',
          code: 404,
          data: {},
        });
      }
  
      const encargadoId = consumidor.encargadoId;
  
      // Obtener todos los puestos relacionados al encargado
      const puestos = await Puesto.findAll({
        where: { encargadoId: encargadoId },
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // Puedes excluir campos si no los necesitas
      });
  
      // Obtener los IDs de los puestos
      const puestosIds = puestos.map((puesto) => puesto.id);
  
      // Obtener asociaciones relacionadas a los puestos
      const asociaciones = await Asociacion.findAll({
        where: { puestoId: puestosIds },
        include: [
          {
            model: Puesto,
            attributes: { exclude: ['createdAt', 'updatedAt'] }, // Excluir campos innecesarios
          },
          {
            model: Evento,
            attributes: { exclude: ['createdAt', 'updatedAt'] }, // Incluir Evento y excluir campos innecesarios
          },
        ],
      });
  
      // Obtener IDs de eventos de las asociaciones
      const eventoIds = asociaciones.map((asociacion) => asociacion.eventoId);
  
      // Obtener eventos relacionados a las asociaciones
      const eventos = await Evento.findAll({
        where: { id: eventoIds },
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // Excluir campos innecesarios
      });
  
      return res.status(200).json({
        status: 'success',
        msg: 'Eventos found',
        code: 200,
        data: {
          consumidor: consumidor, // Incluir el consumidor en la respuesta
          puestos: puestos,       // Incluir los puestos
          asociaciones: asociaciones, // Incluir asociaciones
          eventos: eventos,       // Incluir eventos
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }
  

  async getAllByConsumidorR(req, res) {
    try {
      const { consumidorId } = req.params;
      console.log('Consumidor ID: ' + consumidorId);

      const consumidor = await Consumidor.findByPk(consumidorId);

      if (!consumidor) {
        return res.status(404).json({
          status: 'error',
          msg: 'Consumidor not found',
          code: 404,
          data: {},
        });
      }

      const repartidorId = consumidor.repartidorId;

      const repartidor = await Repartidor.findByPk(repartidorId);

      let asociaciones = [];
      if (repartidor) {
        asociaciones = await Asociacion.findAll({
          include: [
            {
              model: Repartidor,
              where: { id: repartidor.id },
            },
            {
              model: Puesto,
            },
          ],
        });
      }

      const eventoIds = asociaciones.map((asociacion) => asociacion.eventoId);

      const eventos = await Evento.findAll({
        where: {
          id: eventoIds,
        },
      });

      return res.status(200).json({
        status: 'success',
        msg: 'Eventos found',
        code: 200,
        data: {
          eventos: eventos,
          asociaciones: asociaciones,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        msg: 'Something went wrong :(',
        code: 500,
        data: {},
      });
    }
  }

  async updateStateController(req, res) {
    const asociacionId = req.params.asociacionId;
    const accion = req.params.accion;

    try {
      const asociacion = await asociacionService.getOne(asociacionId);
      const estadoActual = asociacion.estado;

      console.log("Estado actual: " + estadoActual);
      console.log("Acción: " + accion);

      if (estadosAsociacion[estadoActual] && estadosAsociacion[estadoActual][accion]) {
        await estadosAsociacion[estadoActual][accion](asociacion,asociacionId);

        // Supongamos que necesitas pasar asociacionId o alguna otra información

        res.status(200).json({ message: 'Estado del evento actualizado.' });
      } else {
        res.status(400).json({ message: 'No se encontró la acción para el estado actual.' });
      }
    } catch (error) {
      console.error('Error al cambiar el estado del evento:', error);
      res.status(500).json({ message: 'Error al cambiar el estado del evento.', error: error.message });
    }
  }
}

export const asociacionController = new AsociacionController();
