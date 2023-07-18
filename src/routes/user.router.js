import express from "express";
export const RouterUser = express.Router();

RouterUser.get('/', async (req, res) => {
  try{
    const carts = await  cartService.getAllCarts()
    const limit = req.query.limit || -1;
    if(limit==-1 && carts.length>0){
      return res.status(200).json({
        status: "sucess",
        msg: "Found all carts",
        data: carts,
      })
    }else if(limit!=-1 && carts.length>0){
      return res.status(200).json({
        status: "sucess",
        msg: "Found "+ limit+ " carts",
        data: carts.slice(0, limit),
      })
    }else{
      return res.status(404).json({
        status: "Error",
        msg: "Carts not found",
        data: carts.slice(0, limit),
      })
    }
  }catch (e) {
    console.log(e);
    return res.status(500).json({
      status: 'error',
      msg: 'something went wrong :(',
      data: {},
    });
  }
  });

  RouterUser.get('/:id', async(req, res) => {
    try {
      const cart = await cartService.getCart(req.params.id)
      if (typeof cart !== {}) {
        return res.status(200).json({
          status: "sucess",
          msg: "Cart found",
          data: cart,
        })
      } else {
        return res.status(404).json({
          status: "Error",
          msg: "Cart with id " + req.params.id + " not found",
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

  RouterUser.put("/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
      const cart = await cartService.updateCart(cid,products);
      return res.status(200).json({
        status: 'success',
        msg: 'product in cart updated',
        data: cart,
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

  RouterUser.put("/:cid/products/:pid", async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateCantProd(cid,pid,quantity);
      if(cart){
        return res.status(200).json({
          status: 'success',
          msg: 'product quantity updated',
          data: cart,
        });
      }else{
        return res.status(200).json({
          status: 'success',
          msg: 'bad card id or product id',
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

  RouterUser.delete("/:cid/products/:pid", async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const cart = await cartService.deleteProductInCart(cid,pid);
      return res.status(200).json({
        status: 'success',
        msg: 'product deleted in cart',
        data: cart,
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

  RouterUser.delete("/:cid", async (req, res) => {
    try {
      const cid = req.params.cid;
      let products = new Array();
      const cart = await cartService.updateCart(cid,products);
      return res.status(200).json({
        status: 'success',
        msg: 'products deleted in cart',
        data: cart,
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

  RouterUser.post("/", async (req, res) => {
    try {
      const cartCreated = await cartService.createCart();
      return res.status(201).json({
        status: 'success',
        msg: 'cart created',
        data: cartCreated,
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

  RouterUser.post("/:cid/product/:pid", async (req, res) => {
    try {
      const { cid,pid } = req.params;
      const cartUptaded = await cartService.addProductToCart(cid,pid);
      if (typeof cart !== {}) {
        return res.status(200).json({
          status: "sucess",
          msg: "Product added",
          data: cartUptaded,
        })
      } else {
        return res.status(404).json({
          status: "Error",
          msg: "error to add product: " + productId + " to cart: "+ cartId,
          data: {cart},
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
/*
def post(self, request):
        try:
            data = json.loads(request.body.decode('utf-8'))
            consumidor_data = data.get('consumidor')
            usuario_data = consumidor_data.get('usuario') 

            usuario = Usuario.objects.create(
                contraseña=usuario_data['contraseña'],
                nombreDeUsuario=usuario_data['nombreDeUsuario'],
                correoElectronico=usuario_data['correoElectronico']
            )

            consumidor = Consumidor.objects.create(
                nombre=consumidor_data['nombre'],
                apellido=consumidor_data['apellido'],
                fechaDeNacimiento=consumidor_data['fechaDeNacimiento'],
                dni=consumidor_data['dni'],
                localidad=consumidor_data['localidad'],
                telefono=consumidor_data['telefono'],
                usuario=usuario
            )

            response_data = {
                'message': 'Consumidor created successfully',
                'code':200
            }
        except Exception as e:
            print(str(e))
            response_data = {
                'message': 'Error al guardar',
                'code': 400
            }
        return JsonResponse(response_data)

    def get(self, request, id=None):
        if id is None:
            usuarios = Usuario.objects.all()
            response_data = {
                'message': 'Usuarios encontrados.',
                'usuarios': []
            }
            for usuario in usuarios:
                usuario_data = {
                    'id': usuario.id,
                    'nombreDeUsuario': usuario.nombreDeUsuario,
                    'fechaAlta':usuario.fechaAlta,
                    'correoElectronico':usuario.correoElectronico
                }
                response_data['usuarios'].append(usuario_data)
        else:
            try:
                user = Usuario.objects.get(id=id)
                user_data = model_to_dict(user)
                response_data = {
                    'message': 'Usuario encontrado',
                    'user':user_data
                }
            except Usuario.DoesNotExist:
                response_data = {
                    'message': 'Usuario no encontrado.',
                    'user': {},
                }
        return JsonResponse(response_data)*/