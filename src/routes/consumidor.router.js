import express from 'express';
export const RouterConsumidor = express.Router();
import { Consumidor } from '../DAO/models/consumidor.model.js';
import { EncargadosPuestos } from '../DAO/models/encargadoPuesto.model.js';
import { Productores } from '../DAO/models/Productor.model.js';

RouterConsumidor.get('/', async (req, res) => {
  try {
    const consumidores = await Consumidor.findAll({ include: [EncargadosPuestos, Productores /*,Repartidores*/] });
    if (consumidores.length > 0) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'Found all consumidores',
        data: consumidores,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'consumidores not found',
        data: {},
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
  }
});

RouterConsumidor.get('/:id', async (req, res) => {
  try {
    const consumidorId = req.params.id;
    const consumidor = await Consumidor.findByPk(consumidorId, { include: [EncargadosPuestos, Productores /*,Repartidores*/] });
    if (consumidor !== null) {
      return res.status(200).json({
        status: 'sucess',
        msg: 'consumidor found',
        data: consumidor,
      });
    } else {
      return res.status(404).json({
        status: 'Error',
        msg: 'consumidor with id ' + req.params.id + ' not found',
        data: {},
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
  }
});

//todo put para guardar consumidor con todos los include juntos
RouterConsumidor.put('/:id', async (req, res) => {
  try {
    const id = req.params;
    const { consumidor: consumidorguardar } = req.body;
    const consumidor = await Consumidor.findByPk(id);
    const encargado = await EncargadosPuestos.findOne({
      where: {
        razonSocial: consumidorguardar.encargado.razonSocial,
      },
    });
    const productor = await Productores.findOne({
      where: {
        razonSocial: consumidorguardar.productor.razonSocial,
      },
    });
    consumidor.nombre = consumidorguardar.nombre;
    consumidor.apellido = consumidorguardar.apellido;
    consumidor.fechaNacimiento = consumidorguardar.fechaNacimiento;
    consumidor.dni = consumidorguardar.dni;
    consumidor.localidad = consumidorguardar.localidad;
    consumidor.telefono = consumidorguardar.telefono;
    consumidor.habilidato = consumidorguardar.habilidato;
    await consumidor.save();
    encargado.cuit = consumidorguardar.encargado.cuit;
    encargado.razonSocial = consumidorguardar.encargado.razonSocial;
    encargado.estaValido = consumidorguardar.encargado.estaValido;
    encargado.habilidato = consumidorguardar.encargado.habilidato;
    await encargado.save();
    productor.cuit = consumidorguardar.productor.cuit;
    productor.razonSocial = consumidorguardar.productor.razonSocial;
    productor.estaValido = consumidorguardar.productor.estaValido;
    productor.habilidato = consumidorguardar.productor.habilidato;
    await productor.save();
    return res.status(200).json({
      status: 'success',
      msg: 'encargado is updated',
      code: 200,
      data: { consumidor, encargado, productor },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
  }
});

/*RouterConsumidor.get('/user/:id', async(req, res) => {
      try {
        const usuarioId = req.params.id;
        const consumidor = await Consumidor.findOne({
          where: {
            usuarioId: usuarioId
          },
        });
        if (consumidor !== null) {
          return res.status(200).json({
            status: "sucess",
            msg: "consumidor found",
            data: consumidor,
          })
        } else {
          return res.status(404).json({
            status: "Error",
            msg: "consumidor with id " + req.params.id + " not found",
            data: {},
          })
        }
      } catch (e) {
        console.log(e);
        return res.status(500).json({
          status: 'error',
          msg: 'something went wrong :(',
          data: {},
        });
      }
    });
*/
