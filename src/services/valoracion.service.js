import { ValoracionPuesto } from "../DAO/models/valoracionCarrito.model.js";
import { ValoracionRepartidor } from "../DAO/models/valoracionRepartidor.model.js";

class ValoracionService {
    async create(idPuestoAsociado, idRepartidor, valorValoracionPuesto, valorValoracionRepartidor) {
        try {
            const nuevaValoracionPuesto = await ValoracionPuesto.create({
                valorValoracionPuesto: valorValoracionPuesto,
                puestoId: idPuestoAsociado
            });

            const nuevaValoracionRepartidor = await ValoracionRepartidor.create({
                valorValoracion: valorValoracionRepartidor,
                repartidorId: idRepartidor
            });

            return { valoracionPuesto: nuevaValoracionPuesto, valoracionRepartidor: nuevaValoracionRepartidor };
        } catch (error) {
            console.error('Error al crear la valoración:', error);
            throw new Error('Ocurrió un error al crear la valoración');
        }
    }
}

export const valoracionService = new ValoracionService();
