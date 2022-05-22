import express from 'express';
import {Event} from "../../db.js"
import { handlePost } from './handlers.js';

export const router = express.Router();
router.use(express.json());

// Get an event's details
router.use('/:id/:tourneyid?', async (req, res, next) => {
    if(req.method === 'GET') {  
        const event = await Event.findByPk(req.params.id);
        res.json(event);
    } else if (req.method === 'POST'){
        await handlePost(req, res);
    }
});


// Get all entrants for an event

// Insert an event into the database