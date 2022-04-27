import express from 'express';
import {Set} from "../../db.js"
import { handlePost } from './handlers.js';
import * as Query from './queries.js';

export const router = express.Router();
router.use(express.json());

// Get a set's details
router.get('/:id', async (req, res, next) => {
    const set = await Set.findByPk(req.params.id);
    res.json(set);
});

router.get('/event/:id/mostGameWins', async (req, res, next) => {
    const player = await Query.getMostGamesWon(req.params.id);
    res.json(player);
}) 

router.get('/event/:id/mostSetWins', async (req, res, next) => {
    const player = await Query.getMostSetWins(req.params.id);
    res.json(player);
}) 

router.get('/event/:id/mostSetPlays', async (req, res, next) => {
    const player = await Query.getMostSetsPlayed(req.params.id);
    res.json(player);
    })

// Get all sets from an event
router.use('/event/:id', async (req, res, next) => {
    if(req.method === 'POST'){
        await handlePost(req, res)
    }
    if(req.method === 'GET'){
        const sets = await Set.findAll({
            where: {
                event_id: req.params.id
            }
        });
        res.json(sets);
    }
})



// Insert a set into a database
