import express from 'express';
import {Standings} from "../../db.js"

export const router = express.Router();
router.use(express.json());

// Get standings from an event
router.get('/:id', async (req, res, next) => {
    const standings = await Standings.findByPk(req.params.id);
    res.json(standings);
});


// Insert standings from an event into the database