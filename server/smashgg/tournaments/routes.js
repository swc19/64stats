import express from 'express';
import {Tournament} from "../../db.js"

export const router = express.Router();
router.use(express.json());

router.get('/:id', async (req, res, next) => {
    const tournament = await Tournament.findByPk(req.params.id);
    res.json(tournament);
});

// Get all events from tournament
// router.get('/:id/events', async (req, res, next) => {

// })

// Insert a tournament into the database
// router.post('/:id', async (req, res, next) => {

// })