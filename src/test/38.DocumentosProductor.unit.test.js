import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
process.env.DB_FORCE_SQLITE = 'true';
describe('Descarga de documentos del productor', () => {
  let app, models, originals;
  before(async () => {
    const { requisitosAsociacionController } = await import('../controllers/requisitosAsociacion.controller.js');
    const { Consumidor } = await import('../DAO/models/consumidor.model.js');
    const { Asociacion } = await import('../DAO/models/asociacion.model.js');
    const { Evento } = await import('../DAO/models/evento.model.js');
    const { RTARestriccion } = await import('../DAO/models/RTARestriccion.model.js');
    models = { Consumidor, Asociacion, Evento, RTARestriccion };
    originals = [Consumidor.findByPk, Asociacion.findByPk, Evento.findByPk, RTARestriccion.findAll];
    Consumidor.findByPk = async (id) => ({ productorId: Number(id) === 1 ? 5 : 9 });
    Asociacion.findByPk = async () => ({ id: 7, eventoId: 19 });
    Evento.findByPk = async () => ({ productorId: 5 });
    RTARestriccion.findAll = async () => [{ id: 8, respuesta: JSON.stringify({ kind: 'file', name: 'prueba.pdf', mimeType: 'application/pdf', base64: Buffer.from('%PDF-1.4 prueba').toString('base64') }), Restriccion: { titulo: 'Constancia', tipo: 'PDF' } }];
    app = express();
    app.get('/:id/requisitos', requisitosAsociacionController.getRequirementAnswers);
    app.get('/:id/requisitos/:respuestaId/archivo', requisitosAsociacionController.getRequirementAnswers);
  });
  after(() => { if (originals) [models.Consumidor.findByPk, models.Asociacion.findByPk, models.Evento.findByPk, models.RTARestriccion.findAll] = originals; });
  it('lista metadatos sin transferir el archivo completo', async () => {
    const response = await request(app).get('/7/requisitos').set('ConsumidorId', '1');
    expect(response.status).to.equal(200);
    expect(response.body.data[0].archivo.nombre).to.equal('prueba.pdf');
    expect(JSON.stringify(response.body)).not.to.contain('base64');
    expect(response.body.data[0].titulo).to.equal('Constancia');
  });
  it('permite descargar el PDF al productor propietario', async () => {
    const response = await request(app).get('/7/requisitos/8/archivo').set('ConsumidorId', '1');
    expect(response.status).to.equal(200);
    expect(response.headers['content-type']).to.contain('application/pdf');
    expect(response.headers['content-disposition']).to.contain('attachment');
    expect(response.body.toString()).to.equal('%PDF-1.4 prueba');
  });
  it('rechaza otro productor y peticiones sin consumidor', async () => {
    expect((await request(app).get('/7/requisitos/8/archivo').set('ConsumidorId', '2')).status).to.equal(403);
    expect((await request(app).get('/7/requisitos/8/archivo')).status).to.equal(401);
  });
});
