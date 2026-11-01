import { Asociacion } from '../DAO/models/asociacion.model.js';
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { Evento } from '../DAO/models/evento.model.js';
import { RTARestriccion } from '../DAO/models/RTARestriccion.model.js';
import { Restriccion } from '../DAO/models/Restriccion.model.js';
import { RequisitoError, decodeRequirementFile } from '../util/requisitosAsociacion.js';
export const requisitosAsociacionController = {
  async getRequirementAnswers(req, res) {
    try {
      const actorId = Number(req.headers.consumidorid);
      if (!Number.isInteger(actorId) || actorId <= 0) throw new RequisitoError('Se requiere una sesión de productor', 401);
      const [actor, association] = await Promise.all([Consumidor.findByPk(actorId), Asociacion.findByPk(req.params.id)]);
      if (!association) throw new RequisitoError('Solicitud no encontrada', 404);
      const event = await Evento.findByPk(association.eventoId);
      if (!actor?.productorId || !event || Number(actor.productorId) !== Number(event.productorId)) throw new RequisitoError('No tenés acceso a los documentos de esta solicitud', 403);
      const answers = await RTARestriccion.findAll({ where: { asociacionId: association.id }, include: [{ model: Restriccion }] });
      if (req.params.respuestaId) {
        const answer = answers.find((item) => String(item.id) === String(req.params.respuestaId));
        const file = answer && decodeRequirementFile(answer.respuesta);
        if (!file) throw new RequisitoError('Archivo no encontrado', 404);
        res.set('Cache-Control', 'no-store');
        res.set('X-Content-Type-Options', 'nosniff');
        res.attachment(file.name);
        res.type(file.mimeType);
        return res.send(Buffer.from(file.base64, 'base64'));
      }
      return res.json({ status: 'success', data: answers.map((answer) => {
        const file = decodeRequirementFile(answer.respuesta);
        return { id: answer.id, titulo: answer.Restriccion?.titulo || 'Requisito', tipo: answer.Restriccion?.tipo, respuesta: file ? null : answer.respuesta, archivo: file ? { nombre: file.name, mimeType: file.mimeType } : null };
      }) });
    } catch (error) {
      return res.status(error instanceof RequisitoError ? error.status : 500).json({ status: 'error', msg: error instanceof RequisitoError ? error.message : 'No se pudieron cargar los requisitos de la solicitud' });
    }
  }

};
