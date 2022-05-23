import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import next from 'next';
import { apiRouter } from './startgg/routes.js';

const port = 3000;
import {sequelize} from "./db.js";


async function sync() {
    console.log('syncing db');
    await sequelize.sync({alter: true});
}
sync();

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();


app.prepare().then(() => {
    const server = express();

    server.use('/api/v1', apiRouter);

    server.get('*', ((req, res) => {
        handle(req, res);
    }));

    server.listen(port, () => {
        console.log(`64stats running at http://localhost:${port}`);
    });

    
});