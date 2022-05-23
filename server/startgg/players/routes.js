import express from 'express';
import {Player} from "../../db.js"
import { handlePost, event_info} from '../players/handlers.js';

export const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
    const players = await Player.findAll();
    res.json(players);
});

router.use('/:id/events', async (req, res, next) => {
    const player_event_info = await event_info(req, res);
    res.json(player_event_info);
});

// Get a player's details
router.use('/:id', async (req, res, next) => {
    if(req.method === 'GET') {
        const player = await Player.findOne({where: {player_id: req.params.id}});
        res.json(player);
    } else if (req.method === 'POST') {
        await handlePost(req, res)
    }
});



// Get events a player has entered

// Get standings from a player

// Insert a player into the database
