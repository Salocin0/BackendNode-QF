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
    try {
      const consumidorId = req.headers["consumidorid"];
      const {
        nombre,
      descripcion,
      imagenEvento,
      croquis,
      ubicacion,
      localidad,
      provincia,
      tipoEvento,
      fechaInicioEvento,
      horaInicioEvento,
      fechaFinEvento,
      tienePreventa,
      fechaInicioPreventa,
      fechaFinPreventa,
      plazoCancelacionPreventa,
      tipoPreventa,
      cantidadPuestos,
      tieneRepartidores,
      cantidadRepartidores,
      capacidadMaxima,
      tipoPago,
      linkVentaEntradas,

      tieneButacas,
      estado,
      } = req.body;
      const nuevoEvento = {
        nombre: nombre,
        descripcion: descripcion,
        img: imagenEvento,
        croquis: croquis,
        ubicacion: ubicacion,
        localidad: localidad,
        provincia: provincia,
        tipoEvento: tipoEvento,
        fechaInicio: fechaInicioEvento,
        horaInicio: horaInicioEvento,
        fechaFin: fechaFinEvento,
        conPreventa: tienePreventa,
        fechaInicioPreventa: fechaInicioPreventa,
        fechaFinPreventa: fechaFinPreventa,
        plazoCancelacionPreventa: plazoCancelacionPreventa,
        tipoPreventa: tipoPreventa,
        cantidadPuestos: cantidadPuestos,
        conRepartidor: tieneRepartidores,
        cantidadRepartidores: cantidadRepartidores,
        capacidadMaxima: capacidadMaxima,
        tipoPago: tipoPago,
        linkVentaEntradas: linkVentaEntradas,
        conButaca: tieneButacas,
        habilitado: true,
        estado: estado,
        consumidorId:consumidorId,
      };
      console.log(nuevoEvento);
      const eventoCreado = await eventoService.create(nuevoEvento);
      if (eventoCreado === false) {
        return res.status(400).json({
          status: 'error',
          msg: 'evento used',
          code: 400,
          data: {},
        });
      } else {
        return res.status(200).json({
          status: 'success',
          msg: 'evento created',
          code: 200,
          data: eventoCreado,
        });
      }
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
}

export const eventoController = new EventoController();
