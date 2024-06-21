import { puntoEncuentroService } from "../services/puntoEncuentro.service.js";

class PuntoEncuentroController {
  async getAllController(req, res) {
    try {
      const consumidorId = req.headers['consumidorid'];
      const puntosEncuentro = await puntoEncuentroService.getAll(consumidorId);
      if (puntosEncuentro) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all puntos encuentros',
          data: puntosEncuentro,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'puntos encuentros not found',
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

  async getAllInEventController(req, res) {
    try {
      const eventoId = req.params.eventoId;
      const puntosEncuentro = await puntoEncuentroService.getAllInEvent(eventoId);
      if (puntosEncuentro.length > 0) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found all puntos encuentros',
          data: puntosEncuentro,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'puntos encuentros not found',
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
      const id = req.params.id;
      const puntoEncuentro = await puntoEncuentroService.getOne(id);
      if (puntoEncuentro !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'punto Encuentro found',
          data: puntoEncuentro,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'punto Encuentro with id ' + req.params.id + ' not found',
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
      const {nombre,latitud,longitud} =req.body;
      const result = await puntoEncuentroService.update(id, nombre,latitud,longitud);
      
      if (result) {
        return res.status(200).json({
          status: 'success',
          msg: 'punto Encuentro is updated',
          code: 200,
          data: result,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'punto Encuentro not found',
          code: 404,
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

  async CreateOneController(req, res) {
    try {
      const { nombre, longitud, latitud, eventoId } = req.body;
      const nuevoPunto = {
        nombre: nombre,
        longitud: longitud,
        latitud: latitud,
        eventoId: eventoId,
      };

      const puntoCreado = await puntoEncuentroService.create(nuevoPunto);
      return res.status(200).json({
        status: 'success',
        msg: 'punto Encuentro created',
        code: 200,
        data: puntoCreado,
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

  async deleteOneController(req, res) {
    try {
      const id = req.params.id;
      const puntoEncuentro = await puntoEncuentroService.delete(id);
      if (puntoEncuentro) {
        return res.status(200).json({
          status: 'success',
          msg: 'punto Encuentro deleted',
          code: 200,
          data: puntoEncuentro,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'punto Encuentro not found',
          code: 404,
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
}

export const puntoEncuentroController = new PuntoEncuentroController();
