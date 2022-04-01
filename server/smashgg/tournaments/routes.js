import express from 'express';
import { Tournament } from "../../db.js"
import { handlePost } from "./handlers.js"
import { getTournamentEvents } from './queries.js';

export const router = express.Router();
router.use(express.json());

router.use('/:id', async (req, res, next) => {
    if(req.method === 'GET') {
        const tournament = await Tournament.findByPk(req.params.id);
        res.json(tournament);
    }
    if(req.method === 'POST') {
        await handlePost(req, res);
    }
});

//Get all events from tournament
router.get('/:id/events', async (req, res, next) => {
    res.json(await getTournamentEvents(req.params.id));
});
