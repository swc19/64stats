import dotenv from "dotenv";
import {Sequelize} from "sequelize";
import path from "path";

dotenv.config({path: '../.env'});

const database = process.env.PG_DB_NAME;
const password = process.env.PG_DB_PASSWORD;
const user = process.env.PG_USER;

export const sequelize = new Sequelize(database, user, password, {
    dialect: 'postgres',
    host: 'localhost',
    port: process.env.PG_DB_PORT,
    logging: false
});