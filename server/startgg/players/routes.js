import express from 'express';
import {Player} from "../../db.js"
import { handlePost } from '../players/handlers.js';

export const router = express.Router();
router.use(express.json());


// Get a player's details
router.use('/:id', async (req, res, next) => {
    if(req.method === 'GET') {
        const player = await Player.findByPk(req.params.id);
        res.json(player);
    } else if (req.method === 'POST') {
        await handlePost(req, res)
    }
});

// Get events a player has entered

// Get standings from a player

// Insert a player into the database
