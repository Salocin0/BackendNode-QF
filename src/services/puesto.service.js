import { Puesto } from '../DAO/models/puesto.model.js';
import { EstadosAsociaciones } from '../enums/Estados.enums.js';
import { estadosPuestoDeComida } from '../estados/estados/estadosPuestosDeComida.js';
import { asociacionService } from './asociacion.service.js';
import { consumidorService } from './consumidor.service.js';
import { eventoService } from './evento.service.js';

class PuestoService {
  async getAll(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: consumidor.encargadoId,
        habilitado: true,
      },
    });
    return puestos;
  }

  async getAllInEvent(eventoId) {
    const asociaciones = await asociacionService.getAllInEvent(eventoId);
    const puestosPromises = asociaciones
      .filter((asociacion) => asociacion.puestoId !== null)
      .filter((asociacion) => asociacion.estado == EstadosAsociaciones.Aceptada)
      .map(async (asociacion) => {
        const puesto = await Puesto.findByPk(asociacion.puestoId);
        return puesto ? puesto : null;
      });
    const puestos = await Promise.all(puestosPromises);
    const filteredPuestos = puestos.filter((puesto) => puesto !== null);
    return filteredPuestos;
  }

  async getAllDeshabilitados(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: consumidor.encargadoId,
        habilitado: false,
      },
    });
    return puestos;
  }

  async getAllByEncargado(consumidorId) {
    const consumidor = await consumidorService.getOne(consumidorId);
    const puestos = await Puesto.findAll({
      where: {
        encargadoId: consumidor.encargadoId,
      },
    });
    return puestos;
  }

  async getOne(id) {
    const puesto = Puesto.findByPk(id);
    return puesto;
  }

  async update(id, puesto) {
    const puestodb = await Puesto.findByPk(id);
    puestodb.numeroCarro = puesto.numeroCarro;
    puestodb.nombreCarro = puesto.nombreCarro;
    puestodb.tipoNegocio = puesto.tipoNegocio;
    puestodb.telefonoCarro = puesto.telefonoCarro;
    await puestodb.save();
    return puestodb;
  }

  async updateHabilitado(id) {
    const puesto = await Puesto.findByPk(id);
    puesto.habilitado = true;
    await puesto.save();
  }

  async create(puesto) {
    const consumidor = await consumidorService.getOne(puesto.consumidorId);
    console.log('Muestro');
    console.log(consumidor);
    const puestoendb = await Puesto.findOne({
      where: {
        numeroCarro: puesto.numeroCarro,
        encargadoId: consumidor.encargadoId,
      },
    });
    puesto.encargadoId = consumidor.encargadoId;
    if (puestoendb) {
      return false;
    } else {
      const puestoCreado = await Puesto.create(puesto);
      this.crearPuesto(puestoCreado);
      return puestoCreado;
    }
  }

  async delete(id) {
    const puesto = await Puesto.findByPk(id);
    puesto.habilitado = false;
    await puesto.save();
  }

  async crearPuesto(puestoCreado) {
    estadosPuestoDeComida.Creado.crearPuesto(puestoCreado);
  }

  async getPuestoDetails(puestoId) {
    try {
      const puestoDetails = await Puesto.findByPk(puestoId);
      return puestoDetails;
    } catch (error) {
      throw new Error('No se pudieron obtener los detalles del puesto');
    }
  }

  async getPuestosSinAsociacionValidaEnEventosEnEstado(estado, idConsumidor) {
    try {
      const asociacionesValidas = await asociacionService.getAllByPuesto(estado, idConsumidor);
      if(asociacionesValidas==null){
        return []
      }
      const puestosInvalidos = asociacionesValidas.map(asociacionValida => asociacionValida.puestoId);
      const puestos = await puestoService.getAllByEncargado(idConsumidor);
      const puestosValidos = puestos.filter(puesto => !puestosInvalidos.includes(puesto.id));
      
      return puestosValidos;
    } catch (error) {
      console.error('Error al obtener puestos sin asociación válida:', error);
      throw error;
    }
  }
  
}

export const puestoService = new PuestoService();
