import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import asyncHandler from "express-async-handler";
const server = express();
const port = 3000;
import {sequelize} from "./db.js";
import {insertTournament, tourneyImport} from "./smashgg/tournaments/tournament-queries.js";
import * as event_query from "./smashgg/events/event-queries.js";
import * as set_query from "./smashgg/sets/set-queries.js";
import * as player_query from "./smashgg/players/player-queries.js";

await sequelize.sync({force: true});

server.get('/', asyncHandler(async (req, res) => {
    res.send(await test());
}));

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

async function test(){
    // const tourney =  await tourneyImport("ceo-2016");
    // await insertTournament(tourney);
    // const events = await event_query.getTournamentEvents(tourney.id);
    // const event = await event_query.getEvent(events[0].id);
    // await event_query.insertEvent(events[0].id, tourney.id);
    // const full_info = Object.assign({}, tourney, {events: events}, event);
    
    // const sets = await set_query.setImport(11789);
    
    // return sets;
    const player = await player_query.insertPlayer(123);
    return player
}