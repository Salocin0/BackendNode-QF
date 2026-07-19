import { Puesto } from '../DAO/models/puesto.model.js';
import { EstadosAsociaciones } from '../enums/Estados.enums.js';
import { estadosPuestoDeComida } from '../estados/estados/estadosPuestosDeComida.js';
import { asociacionService } from './asociacion.service.js';
import { consumidorService } from './consumidor.service.js';
import { sequelize } from '../util/connections.js';

class PuestoService {
  async getAll(consumidorId) {
    // Validar que consumidorId exista
    if (!consumidorId) {
      console.warn('⚠️ consumidorId no proporcionado');
      return [];
    }
    
    try {
      const consumidor = await consumidorService.getOne(consumidorId);
      
      if (!consumidor) {
        console.warn(`⚠️ Consumidor no encontrado: ${consumidorId}`);
        return [];
      }
      
      if (!consumidor.encargadoId) {
        console.warn(`⚠️ Consumidor sin encargadoId: ${consumidorId}`);
        return [];
      }
      
      const puestos = await Puesto.findAll({
        where: {
          encargadoId: consumidor.encargadoId,
          estado: 'Creado',
        },
      });
      return puestos;
    } catch (error) {
      console.error('Error en getAll:', error);
      return [];
    }
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
    if (!consumidorId) {
      console.warn('⚠️ consumidorId no proporcionado');
      return [];
    }
    
    try {
      const consumidor = await consumidorService.getOne(consumidorId);
      if (!consumidor || !consumidor.encargadoId) {
        return [];
      }
      
      const puestos = await Puesto.findAll({
        where: {
          encargadoId: consumidor.encargadoId,
          habilitado: false,
        },
      });
      return puestos;
    } catch (error) {
      console.error('Error en getAllDeshabilitados:', error);
      return [];
    }
  }

  // services/puestoService.js

  async getEncargadoIdByPuestoId(puestoId) {
    try {
      const puesto = await Puesto.findByPk(puestoId);
      return puesto ? puesto.encargadoId : null;
    } catch (error) {
      console.error(`Error al recuperar el encargadoId para puestoId ${puestoId}:`, error);
      return null;
    }
  };


  async getAllByEncargado(consumidorId) {
    if (!consumidorId) {
      console.warn('⚠️ consumidorId no proporcionado');
      return [];
    }
    
    try {
      const consumidor = await consumidorService.getOne(consumidorId);
      if (!consumidor || !consumidor.encargadoId) {
        return [];
      }
      
      const puestos = await Puesto.findAll({
        where: {
          encargadoId: consumidor.encargadoId,
        },
      });
      return puestos;
    } catch (error) {
      console.error('Error en getAllByEncargado:', error);
      return [];
    }
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
      if (asociacionesValidas == null) {
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

  async getEstadisticas(puestoId) {
    try {
      const query = `
        SELECT 
            ROUND(AVG(vp.puntuacion) ,2) AS promedio_valoracion_puesto
          FROM 
            public."Pedidos" p
          JOIN 
            public."valoracionPuestos" v ON v."pedidoId" = p.id
          JOIN 
            public."valoracionPuestos" vp ON vp."puestoId" = p."puestoId"
          WHERE 
            p.estado = 'Valorado'
            AND p."puestoId" = :puestoId
      `;
  
      const [result] = await sequelize.query(query, {
        replacements: { puestoId },
        type: sequelize.QueryTypes.SELECT,
      });

      const query2 = `
        SELECT 
            ROUND(AVG(EXTRACT(EPOCH FROM (p."fechaEntrega" - p."fecha"))) / 60, 2) AS tiempo_promedio_entrega_minutos
          FROM 
            public."Pedidos" p
          WHERE 
            (p.estado = 'Valorado' OR p.estado = 'Entregado')
            AND p."puestoId" = :puestoId
            AND p."fechaEntrega" IS NOT NULL;
      `;
  
      const [result2] = await sequelize.query(query2, {
        replacements: { puestoId },
        type: sequelize.QueryTypes.SELECT,
      });
  
      return {
        estrellas: result.promedio_valoracion_puesto,
        tiempo: result2.tiempo_promedio_entrega_minutos,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw new Error("No se pudieron obtener los detalles del puesto");
    }
  }
  

}

export const puestoService = new PuestoService();
export const { getEncargadoIdByPuestoId } = puestoService;
