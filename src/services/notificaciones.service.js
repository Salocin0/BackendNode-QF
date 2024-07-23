
import { userController } from "../controllers/users.controller.js";
import { sendNotificacionesWeb } from "../util/Notificaciones.js";
import { puestoService } from "./puesto.service.js";
import {sendNotificacionesMobile} from "../../dist/util/NotificacionesMobile.js"
class NotificacionesService {
    async enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion) {
        const {tokenUsuarioWeb,tokenUsuarioMobile} = await this.buscarTokenPorPuesto(puestoId)
        const titulo = tituloNotificacion;
        const descripcion = descripcionNotificacion;
        if (tokenUsuarioWeb) {
            await sendNotificacionesWeb(tokenUsuarioWeb, titulo, descripcion);
        }
        if(tokenUsuarioMobile){
            await sendNotificacionesMobile(tokenUsuarioMobile,titulo,descripcion);
        }
    }

    async buscarTokenPorPuesto(puestoId) {
        const encargadoId = await puestoService.getEncargadoIdByPuestoId(puestoId);
        const tokens = await userController.getTokenByEncargadoId(encargadoId);
        return tokens;
    }

}

export const notificacionesService = new NotificacionesService();
