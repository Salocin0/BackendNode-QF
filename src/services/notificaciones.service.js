
import { userController } from "../controllers/users.controller.js";
import { sendNotificaciones } from "../util/Notificaciones.js";
import { puestoService } from "./puesto.service.js";


class NotificacionesService {
    async enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion) {
        console.log("LLLEGA O NO LLEGA" + puestoId);
        const TokenEncargado = await this.buscarTokenPorPuesto(puestoId)

        if (TokenEncargado) {
            const titulo = tituloNotificacion;
            const descripcion = descripcionNotificacion;
            await sendNotificaciones(TokenEncargado, titulo, descripcion);
        }

    }

    async buscarTokenPorPuesto(puestoId) {

        console.log("y aca llega?" + puestoId)
        const encargadoId = await puestoService.getEncargadoIdByPuestoId(puestoId);
        console.log("ENCARGADO ID:" + encargadoId)

        const token = await userController.getTokenByEncargadoId(encargadoId);

        console.log(token);

        return token;

    }

}

export const notificacionesService = new NotificacionesService();
