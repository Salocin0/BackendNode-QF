
import { sendNotificacionesMobile } from "../../dist/util/NotificacionesMobile.js";
import { userController } from "../controllers/users.controller.js";
import { sendNotificacionesWeb } from "../util/Notificaciones.js";
import { productorService } from "./productor.service.js";
import { puestoService } from "./puesto.service.js";
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

    async enviarNotificacionesAsociacion(eventoId, tituloNotificacion, descripcionNotificacion) {
        const {tokenUsuarioWeb,tokenUsuarioMobile} = await this.buscarTokenPorEvento(eventoId)
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

    async buscarTokenPorEvento(eventoId) {
        const productorId = await productorService.getProductorByEvento(eventoId);
        const tokens = await userController.getTokenByProductorId(productorId);
        return tokens;
    }



}

export const notificacionesService = new NotificacionesService();
