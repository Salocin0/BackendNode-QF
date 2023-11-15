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
});

Carrito.belongsToMany(Producto, { through: ItemCarrito });
Producto.belongsToMany(Carrito, { through: ItemCarrito });

ItemCarrito.belongsTo(Carrito);
ItemCarrito.belongsTo(Producto);

Carrito.prototype.agregarProducto = async function (productoId, cantidad = 1) {
    const producto = await Producto.findByPk(productoId);
    if (producto) {
      const itemCarrito = await this.getProductos({
        where: { id: productoId },
      });
  
      if (itemCarrito && itemCarrito.length > 0) {
        const nuevaCantidad = itemCarrito[0].ItemCarrito.cantidad + cantidad;
        await this.addProducto(producto, { through: { cantidad: nuevaCantidad } });
      } else {
        await this.addProducto(producto, { through: { cantidad } });
      }
    }
  };
  
  Carrito.prototype.quitarProducto = async function (productoId, cantidad = 1) {
    const producto = await Producto.findByPk(productoId);
    if (producto) {
      const itemCarrito = await this.getProductos({
        where: { id: productoId },
      });
  
      if (itemCarrito && itemCarrito.length > 0) {
        const nuevaCantidad = itemCarrito[0].ItemCarrito.cantidad - cantidad;
  
        if (nuevaCantidad > 0) {
          await this.addProducto(producto, { through: { cantidad: nuevaCantidad } });
        } else {
          await this.removeProducto(producto);
        }
      }
    }
  };

Carrito.prototype.actualizarCantidad = async function (productoId, nuevaCantidad) {
  const producto = await Producto.findByPk(productoId);
  if (producto) {
    const item = await ItemCarrito.findOne({
      where: { CarritoId: this.id, ProductoId: productoId },
    });
    if (item) {
      item.cantidad = nuevaCantidad;
      await item.save();
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
