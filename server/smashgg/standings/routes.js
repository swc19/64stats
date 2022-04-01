import express from 'express';
import {Standings} from "../../db.js"
import { handlePost } from './handlers.js';

export const router = express.Router();
router.use(express.json());

// Get standings from an event
router.use('/:event_id', async (req, res, next) => {
    if(req.method === 'GET') {
        const standings = await Standings.findByPk(req.params.event_id);
        res.json(standings);
    }
    if(req.method === 'POST') {
        await handlePost(req, res);
    }
});