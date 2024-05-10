import { pedidoService } from "../services/pedido.service.js";
import { valoracionService } from "../services/valoracion.service.js";

class ValoracionController {
    async getAllByUser(req, res) {
        try {
            const idConsumidor = req.params.idConsumidor;
            const valoracionesUser = await valoracionService.getAllByUser(idConsumidor);
            if (valoracionesUser) {
                return res.status(200).json({
                    status: 'success',
                    msg: 'Found all valoraciones',
                    data: valoracionesUser,
                });
            } else {
                return res.status(404).json({
                    status: 'Error',
                    msg: 'valoraciones not found',
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

    async getAllByPedido(req, res) {
        try {
            const idPedido = req.params.idPedido;
            const valoracionesPedido = await valoracionService.getAllByUser(idPedido);
            if (valoracionesPedido) {
                return res.status(200).json({
                    status: 'success',
                    msg: 'Found all valoraciones',
                    data: valoraciones,
                });
            } else {
                return res.status(404).json({
                    status: 'Error',
                    msg: 'valoraciones not found',
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

    async getAllByPuesto(req, res) {
        try {
            const idPuesto = req.params.idPuesto;
            const valoracionesPuesto = await valoracionService.getAllByPuesto(idPuesto);
            if (valoracionesPuesto) {
                return res.status(200).json({
                    status: 'success',
                    msg: 'Found all valoraciones',
                    data: valoracionesPuesto,
                });
            } else {
                return res.status(404).json({
                    status: 'Error',
                    msg: 'valoraciones not found',
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

    async createOneController(req, res) {
        try {
            const idPedido = req.params.idPedido;

            const valoracion = req.body;
            const idPuestoAsociado = await pedidoService.getOnePuesto(idPedido);
            const idRepartidor = await pedidoService.getOneRepartidor(idPedido);
            const valoracionCreada = await valoracionService.create(idPuestoAsociado, idRepartidor, valoracion);

            if (valoracionCreada) {
                return res.status(201).json({
                    status: 'success',
                    msg: 'Valoración creada exitosamente',
                    data: valoracionCreada,
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: 'error',
                msg: 'Ocurrió un error al crear la valoración',
                data: {},
            });
        }
    }


}

export const valoracionController = new ValoracionController();
