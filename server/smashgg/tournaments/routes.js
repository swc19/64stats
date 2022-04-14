import express from 'express';
import { Tournament } from "../../db.js"
import { handlePost } from "./handlers.js"
import { getTournamentEvents } from './queries.js';

export const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
    const tournaments = await Tournament.findAll();
    res.json(tournaments);
});



router.get('/id/:id', async (req, res, next) => {
    if(req.method === 'GET') {
        const tournament = await Tournament.findByPk(req.params.id);
        res.json(tournament);
    }
});

//post tournament based on slug
router.use('/slug/:slug', async (req, res) => {
    if(req.method === 'GET'){
        const tournament = await Tournament.findOne({
            where: {
                tourney_slug: req.params.slug
            }
        });
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
