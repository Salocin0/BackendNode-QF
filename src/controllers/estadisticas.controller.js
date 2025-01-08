import { estadisticasService } from "../services/estadisticas.service.js";

class EstadisticasController {
  async getTotalRecaudadoPorPuestoEnEvento(req, res) {
    try {
      const id = req.params.id;
      const datos = await estadisticasService.getTotalRecaudadoPorPuestoEnEvento(id);
      if (datos) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found data',
          data: datos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'not found data',
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
  async getTotalRecaudadoEvento(req, res) {
    try {
      const id = req.params.id;
      const datos = await estadisticasService.getTotalRecaudadoEvento(id);
      if (datos !== null) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found data',
          data: datos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'not found data',
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
  async getPedidosPorTiempoYCarrito(req, res) {
    try {
      const id = req.params.id;
      const datos = await estadisticasService.getPedidosPorTiempoYCarrito(id);
      if (datos!==null) {
        return res.status(200).json({
          status: 'success',
          msg: 'Found data',
          data: datos,
        });
      } else {
        return res.status(404).json({
          status: 'Error',
          msg: 'not found data',
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
}

export const estadisticasController = new EstadisticasController();
