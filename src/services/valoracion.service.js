import { Consumidor } from "../DAO/models/consumidor.model.js";
import { ValoracionPuesto } from "../DAO/models/valoracionCarrito.model.js";
import { ValoracionRepartidor } from "../DAO/models/valoracionRepartidor.model.js";
import { EstadosPedido } from "../enums/Estados.enums.js";
import { pedidoService } from "./pedido.service.js";

class ValoracionService {
    async getAllByPuesto(idPuesto) {
        const valoraciones = await ValoracionPuesto.findAll({
            where: {
                puestoId: idPuesto
            }
        });
        return valoraciones;
    }

    async getAllByUser(idConsumidor) {
        const consumidor = await Consumidor.findByPk(idConsumidor);
        const repartidorId = consumidor.repartidorId;
        const valoraciones = await ValoracionRepartidor.findAll({
            where: {
                repartidorId: repartidorId
            }
        });
        return valoraciones;
    }

    async create(idPuestoAsociado, idRepartidor, valoracion,idPedido) {
        const puntualidad = valoracion.puntualidad
        const eficiencia = valoracion.eficiencia
        const calidad = valoracion.calidad
        const tiempo = valoracion.tiempo
        
        try {

            const nuevaValoracionPuesto = await ValoracionPuesto.create({
                calidad: calidad,
                tiempo:tiempo,
                puestoId: idPuestoAsociado
            });

            const nuevaValoracionRepartidor = await ValoracionRepartidor.create({
                puntualidad:puntualidad,
                eficiencia:eficiencia,
                repartidorId: idRepartidor
            });

            pedidoService.updateState(idPedido,EstadosPedido.valorado)            

            return { valoracionPuesto: nuevaValoracionPuesto, valoracionRepartidor: nuevaValoracionRepartidor };
        } catch (error) {
            console.error('Error al crear la valoración:', error);
            throw new Error('Ocurrió un error al crear la valoración');
        }
    }





}

export const valoracionService = new ValoracionService();
