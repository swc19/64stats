import express from 'express';
import {Player} from "../../db.js"

export const router = express.Router();
router.use(express.json());


// Get a player's details
router.get('/:id', async (req, res, next) => {
    const player = await Player.findByPk(req.params.id);
    res.json(player);
});

// Get events a player has entered

// Get standings from a player

// Insert a player into the database
