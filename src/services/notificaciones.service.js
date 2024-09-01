import { sendNotificacionesMobile } from "../../dist/util/NotificacionesMobile.js";
import { userController } from "../controllers/users.controller.js";
import { sendNotificacionesWeb } from "../util/Notificaciones.js";
import { asociacionService } from "./asociacion.service.js";
import { productorService } from "./productor.service.js";
import { puestoService } from "./puesto.service.js";
import { pregunta, consola } from "../util/chatbot.js";

class NotificacionesService {
    async enviarNotificacionesAPuesto(puestoId, tituloNotificacion, descripcionNotificacion) {
        pregunta()
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


    async enviarNotificacionesAsociacionAceptaradaRepartidor(Id, tituloNotificacion, descripcionNotificacion) {
        const {tokenUsuarioWeb,tokenUsuarioMobile} = await this.buscarTokenPorEvento(Id)
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

    async buscarTokenPorAsociacion(Id) {
        const asociacion = await asociacionService.getOne(Id);
        repartidorId = await(asociacion.repartidoreId);
        const tokens = await userController.getTokenByRepartidorrId(repartidorId);
        return tokens;
    }



}

export const notificacionesService = new NotificacionesService();
