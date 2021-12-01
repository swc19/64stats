import express from 'express';
import {Set} from "../../db.js"

export const router = express.Router();
router.use(express.json());

// Get a set's details
router.get('/:id', async (req, res, next) => {
    const set = await Set.findByPk(req.params.id);
    res.json(set);
});


// Get all sets from an event
// router.get('/event/:id', async (req, res, next) => {

// })

// Insert a set into a database
