import pkg from 'sequelize';
const {DataTypes, Model} = pkg;
import {sequelize} from '../db.js';
export class Tournament extends Model {}

Tournament.init({
    tourney_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    tourney_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tourney_location: {
        type: DataTypes.STRING,
    },
    tourney_start_time: {
        type: DataTypes.DATE,
    },
    tourney_entrants: {
        type: DataTypes.INTEGER,
    }
}, {
    sequelize,
    modelName: 'Tournament'
});


