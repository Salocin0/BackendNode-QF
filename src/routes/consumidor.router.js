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
    const consumidor = await Consumidor.findOne({
      where: { id: consumidorId },
      include: [EncargadosPuestos, Productores/*, Repartidores*/]
    });

    if (consumidor !== null) {
      return res.status(200).json({
        status: 'success',
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
    const id = req.params.id;
    const { consumidor } = req.body;
    console.log(consumidor)
    const consumidorbase = await Consumidor.findByPk(id);
    const encargado = await EncargadosPuestos.findByPk(consumidor.encargadoId);
    const productor = await Productores.findByPk(consumidor.productorId);
    if(consumidorbase){
      consumidorbase.nombre = consumidor.nombre;
      consumidorbase.apellido = consumidor.apellido;
      consumidorbase.fechaNacimiento = consumidor.fechaNacimiento;
      consumidorbase.dni = consumidor.dni;
      consumidorbase.localidad = consumidor.localidad;
      consumidorbase.telefono = consumidor.telefono;
      consumidorbase.habilidato = consumidor.habilidato;
      consumidorbase.encargadoId = consumidor.encargadoId;
      consumidorbase.productorId = consumidor.productorId;
      await consumidorbase.save();
    }
    if(encargado && consumidor.encargadosPuesto){
      encargado.cuit = consumidor.encargadosPuesto.cuit;
      encargado.razonSocial = consumidor.encargadosPuesto.razonSocial;
      encargado.estaValido = consumidor.encargadosPuesto.estaValido;
      encargado.habilidato = consumidor.encargadosPuesto.habilidato;
      await encargado.save();
    }
    if(productor && consumidor.productore){
      productor.cuit = consumidor.productor.cuit;
      productor.razonSocial = consumidor.productor.razonSocial;
      productor.estaValido = consumidor.productor.estaValido;
      productor.habilidato = consumidor.productor.habilidato;
      await productor.save();
    }    
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
