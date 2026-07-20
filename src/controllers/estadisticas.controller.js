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
      const idevento = req.params.idevento;
      const idpuesto = req.params.idpuesto;
      const datos = await estadisticasService.getPedidosPorTiempoYCarrito(idevento,idpuesto);
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

  async getProductosVendidosDiaEvento(req, res) {
    try {
      const idevento = req.params.idevento;
      const idpuesto = req.params.idpuesto;
      const diaevento = req.params.diaevento;
      const datos = await estadisticasService.getProductosVendidosDiaEvento(idevento,idpuesto,diaevento);
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

  async getPromedioValoracionPuesto(req, res) {
    try {
      const id = req.params.id;
      const datos = await estadisticasService.getPromedioValoracionPuesto(id);
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

  async getTotalRecaudadoPuestoEvento(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const {idPuesto, idEvento} = req.body;
      console.log(idConsumidor, idPuesto, idEvento)
      const datos = await estadisticasService.getTotalRecaudadoPuestoEvento(idConsumidor, idPuesto, idEvento);
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

  async getPromedioValoracionPuestoEvento(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const {idPuesto, idEvento} = req.body;
      console.log(idConsumidor, idPuesto, idEvento)
      const datos = await estadisticasService.getPromedioValoracionPuestoEvento(idConsumidor, idPuesto, idEvento);
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

  async getTiempoPromedioEntrega(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const {idPuesto, idEvento} = req.body;
      console.log(idConsumidor, idPuesto, idEvento)
      const datos = await estadisticasService.getTiempoPromedioEntrega(idConsumidor, idPuesto, idEvento);
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
  async getTopProductosPorEventoYpuesto(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const {idPuesto, idEvento} = req.body;
      console.log(idConsumidor, idPuesto, idEvento)
      const datos = await estadisticasService.getTopProductosPorEventoYpuesto(idEvento, idPuesto );
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

  async getEstadisticasConsumidor(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const datos = await estadisticasService.getEstadisticasConsumidor(idConsumidor);
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

  async getEstadisticasRepartidor(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const datos = await estadisticasService.getEstadisticasRepartidor(idConsumidor);
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
      console.log(e)
      return res.status(500).json({
        status: 'error',
        msg: 'something went wrong :(',
        data: {},
      });
    }
  }

  async getPuestosConPedidos(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const datos = await estadisticasService.getPuestosConPedidos(idConsumidor);
      return res.status(200).json({
        status: 'success',
        msg: 'Found puestos with pedidos',
        data: datos,
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

  async getEventosConPedidos(req, res) {
    try {
      const idConsumidor = req.params.idConsumidor;
      const datos = await estadisticasService.getEventosConPedidos(idConsumidor);
      return res.status(200).json({
        status: 'success',
        msg: 'Found eventos with pedidos',
        data: datos,
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

  async getAnalisisLLM(req, res) {
    try {
      const { tipo, idConsumidor, idEvento, idPuesto } = req.body;
      if (!tipo || !idConsumidor) {
        return res.status(400).json({ status: 'error', msg: 'Faltan parámetros requeridos', data: {} });
      }
      const datos = await estadisticasService.getAnalisisLLM(
        tipo,
        idConsumidor,
        idEvento || 'Todos',
        idPuesto || 'Todos'
      );
      return res.status(200).json({ status: 'success', msg: 'Análisis generado', data: datos });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ status: 'error', msg: 'Error generando análisis', data: {} });
    }
  }
}

export const estadisticasController = new EstadisticasController();
