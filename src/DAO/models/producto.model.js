import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

/* Librerias de las clase relacionada con Puesto 
import { Puesto } from './puesto.model.js';
*/

export const Producto = sequelize.define('producto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    /*Ver relación con la clase ESTADO [HABILITADO,DESHABILITADO] 
    */
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    /*Ver si se crea una relación con la clase tipoProducto o si se arma un array [HeladoChocolate,HeladoVainilla,etc] 
    */
    tipoProducto: {
        type: DataTypes.ARRAY,
        allowNull: false,
    },
  });
  

/*  
//Ver relación con la clase PUESTO
//---------------------------------------------------------------------
 
   Puesto.hasMany(Producto, {
    foreignKey: 'productoId', 
    sourceKey: 'id', 
  });
  
  Producto.belongsTo(Puesto, {
    foreignKey: 'puestoId', 
    targetKey: 'id', 
  });
//-----------------------------------------------------------------------
*/