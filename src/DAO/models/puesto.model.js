import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

/* Librerias de las clases relacionadas puntuacionPuesto y producto
import { producto } from './producto.model.js';
import { puntuacionPuesto } from './puntuacionPuesto.model.js';
*/

export const Puesto = sequelize.define('puesto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fechaBromatologica: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    /*Ver relación con la clase ESTADO [CREADO,HABILITADO,DESHABILITADO,ACTIVO,INACTIVO] 
    estado: {
      type: DataTypes.ARRAY,
      allowNull: false,
      defaultValue: 'CREADO',
    },
    */

    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
  });
  

/*  
//Ver relación con la clase PRODUCTO y con PUNTUACION PUESTO
//---------------------------------------------------------------------
  Puesto.hasMany(PuntuacionPuesto, {
    foreignKey: 'puntuacionPuestoId',
    sourceKey: 'id',
  });
  
  PuntuacionPuesto.belongsTo(Puesto, {
    foreignKey: 'puntuacionPuestoId',
    targetKey: 'id',
  });
  
  Puesto.hasMany(Producto, {
    foreignKey: 'productoId', 
    sourceKey: 'id', 
  });
  
  Producto.belongsTo(Puesto, {
    foreignKey: 'productoId', 
    targetKey: 'id', 
  });
//-----------------------------------------------------------------------
*/