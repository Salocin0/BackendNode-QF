import express from "express";
export const RouterProductor = express.Router();
import { Productor } from "../DAO/models/Productor.model.js";
import { productorController } from "../controllers/productor.controller.js";



RouterProductor.get('/', productorController.getAllcontroller)

RouterProductor.get('/:id', async(req, res) => {
  try {
    const productorId = req.params.id;
    const productor = await Productor.findByPk(productorId)
    if (productor !== null) {
      return res.status(200).json({
        status: "sucess",
        msg: "Productor found",
        data: productor,
      })
    } else {
      return res.status(404).json({
        status: "Error",
        msg: "Productor with id " + req.params.id + " not found",
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

/*RouterProductor.get('/user/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const productor = await Productor.findOne({
      where: {
        usuarioId: usuarioId
      },
    });

    if (productor !== null) {
      return res.status(200).json({
        status: "success",
        msg: "Encargado found",
        data: productor,
      });
    } else {
      return res.status(404).json({
        status: "error",
        msg: "Encargado with id " + req.params.id + " not found",
        data: {},
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      msg: 'Internal server error',
      data: {},
    });
  }
});*/

RouterProductor.put("/:id", async (req, res) => {
try {
  const { id } = req.params;
  const { razonSocial,cuit } = req.body;
  const productor = await Productor.findByPk(id)
  productor.razonSocial=razonSocial
  productor.cuit = cuit
  await productor.save()
  return res.status(200).json({
    status: 'success',
    msg: 'encargado is updated',
    code: 200,
    data: productor,
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

RouterProductor.post("/", async (req, res) => {
try {
  const { productor } = req.body;
  console.log(productor)
  const nuevoProductor = {
    cuit:productor.cuit,
    razonSocial:productor.razonSocial,
  }
  const productorendb = await Productor.findOne({
    where: {
      razonSocial: nuevoProductor.razonSocial
    },
  });
  console.log(productorendb)
  if(productorendb){
    return res.status(200).json({
      status: 'error',
      msg: 'encargado used',
      code: 400,
      data: {}
    });
  }else{
    const productorCreado = await Productor.create(nuevoProductor);
    return res.status(201).json({
      status: 'success',
      msg: 'encargado created',
      code: 200,
      data: productorCreado
    });
  }
} catch (e) {
  console.log(e);
return res.status(500).json({
  status: 'error',
  msg: 'something went wrong :(',
  code :500,
  data: {},
});
}
});

RouterProductor.delete("/:id", async (req, res) => {
try {
  const id = req.params.id;
  const productor = await Productor.findByPk(id);
  productor.habilitado=false
  await productor.save()
  console.log(productor)
  return res.status(200).json({
    status: 'success',
    msg: 'encargado deleted',
    code: 200,
    data: productor,
  });
} catch (e) {
  console.log(e);
  return res.status(500).json({
    status: 'error',
    msg: 'something went wrong :(',
    code: 500,
    data: {},
  });
}
});