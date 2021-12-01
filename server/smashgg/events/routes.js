import express from 'express';
import {Event} from "../../db.js"

export const router = express.Router();
router.use(express.json());

// Get an event's details
router.get('/:id', async (req, res, next) => {
    const event = await Event.findByPk(req.params.id);
    res.json(event);
});


// Get all entrants for an event

// Insert an event into the database