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
    nombreCarro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numeroCarro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoNegocio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner:{
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    img:{
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    /*telefonoContacto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    razonSocial: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cuit: {
      type: DataTypes.STRING,
      allowNull: false,
    },*/
    telefonoCarro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /*Ver relación con la clase ESTADO [CREADO,HABILITADO,DESHABILITADO,ACTIVO,INACTIVO] 
    estado: {
      type: DataTypes.ARRAY,
      allowNull: false,
      defaultValue: 'CREADO',
    },
    */
    estado: {
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