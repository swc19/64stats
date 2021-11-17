import express from 'express';
import asyncHandler from "express-async-handler";
import {Tournament} from "../../db.js"

export const router = express.Router();
router.use(express.json());

router.get('/:id', async (req, res, next) => {
    const tournament = await Tournament.findByPk(req.params.id);
    res.json(tournament);
});
