import { DataTypes } from 'sequelize';
import { sequelize } from './../../util/connections.js';

/* Librerias de las clases relacionadas estado, consumidor, butaca
import { consumidor } from './consumidor.model.js';
import { estado } from './estado.model.js';
import { butaca } from './butaca.model.js';
*/

export const Repartidor = sequelize.define('repartidores', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estaValido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    habilitado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    /*Ver relación con la clase ESTADO 
    estado: {
      type: DataTypes.ARRAY,
      allowNull: false,
      defaultValue: 'CREADO',
    },
    */
      
    
  });
  

/*  
//Ver relación con la clase butaca, con estado y con Consumidor
//---------------------------------------------------------------------
  Repartidor.hasMany(estado, {
    foreignKey: 'estadoId',
    sourceKey: 'id',
  });
  
  estado.belongsTo(Repartidor, {
    foreignKey: 'estadoId',
    targetKey: 'id',
  });
  
  Repartidor.hasMany(Butaca, {
    foreignKey: 'butacaId', 
    sourceKey: 'id', 
  });
  
  Butaca.belongsTo(Repartidor, {
    foreignKey: 'butacaId', 
    targetKey: 'id', 
  });
//-----------------------------------------------------------------------
*/