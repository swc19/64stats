import {Tournament} from '../../db.js';
import * as Query from './queries.js';
import * as EventQuery from '../events/queries.js';

export async function handlePost(req, res) {
    const tournament = await Query.tourneyImport(req.params.slug);
    if (tournament) {
        const response = await Query.insertTournament(tournament);
        response ? res.status(200).send(response) : res.status(400).send("Tournament already Exists");
    } else {
        res.status(404).send("Tournament not found");
    }
}