import { DataTypes } from 'sequelize';
import { sequelize } from '../../util/connections.js';
import { Producto } from './producto.model.js';
import { Consumidor } from './consumidor.model.js';

export const Carrito = sequelize.define('Carrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

export const ItemCarrito = sequelize.define('ItemCarrito', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  eventoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

Carrito.belongsToMany(Producto, { through: ItemCarrito });
Producto.belongsToMany(Carrito, { through: ItemCarrito });

ItemCarrito.belongsTo(Carrito);
ItemCarrito.belongsTo(Producto);

Carrito.prototype.agregarProducto = async function (productoId, cantidad = 1, fecha = null,eventoId) {
  const producto = await Producto.findByPk(productoId);
  if (producto) {
    // Buscar el producto en el carrito, filtrando también por fecha (o su ausencia)
    const itemCarrito = await this.getProductos({
      where: { id: productoId },
      through: {
        where: { fecha },
      },
    });

    if (itemCarrito && itemCarrito.length > 0) {
      // Si el producto ya existe con la misma fecha (incluido null), actualizamos la cantidad
      const nuevaCantidad = itemCarrito[0].ItemCarrito.cantidad + cantidad;
      await this.addProducto(producto, { through: { cantidad: nuevaCantidad, fecha,eventoId } });
    } else {
      // Si no existe, lo agregamos con la cantidad inicial y la fecha proporcionada
      await this.addProducto(producto, { through: { cantidad, fecha , eventoId} });
    }
  }
};

Carrito.prototype.quitarProducto = async function (productoId, cantidad = 1, fecha = null) {
  const producto = await Producto.findByPk(productoId);
  if (producto) {
    const itemCarrito = await this.getProductos({
      where: { id: productoId },
      through: {
        where: { fecha },
      },
    });

    if (itemCarrito && itemCarrito.length > 0) {
      const nuevaCantidad = itemCarrito[0].ItemCarrito.cantidad - cantidad;

      if (nuevaCantidad > 0) {
        // Actualizamos la cantidad si es mayor que 0
        await this.addProducto(producto, { through: { cantidad: nuevaCantidad, fecha } });
      } else {
        // Eliminamos el producto si la cantidad es 0 o menor
        await this.removeProducto(producto, { through: { fecha } });
      }
    }
  }
};

Carrito.prototype.actualizarCantidad = async function (productoId, nuevaCantidad, fecha = null) {
  const producto = await Producto.findByPk(productoId);
  if (producto) {
    const item = await ItemCarrito.findOne({
      where: {
        CarritoId: this.id,
        ProductoId: productoId,
        fecha,
      },
    });

    if (item) {
      if (nuevaCantidad > 0) {
        item.cantidad = nuevaCantidad;
        await item.save();
      } else {
        await item.destroy(); // Elimina el producto si la nueva cantidad es 0
      }
    }
  }
};


Consumidor.hasOne(Carrito, {
  foreignKey: 'consumidorId',
  sourceKey: 'id',
});

Carrito.belongsTo(Consumidor, {
  foreignKey: 'consumidorId',
  targetKey: 'id',
});
