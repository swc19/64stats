import * as Query from './queries.js';
import {Player} from '../../db.js';

export async function handlePost(req, res) {
    // Check if player exists
    const player_exists = await Player.findOne({where: {player_id: req.params.id}});
    if(player_exists) {
        res.status(400).json({error: 'Player already exists'});
        return;
    }
    const player = await Query.insertPlayer(req.params.id);
    if (player) {
        res.status(200).send(player);
    } else {
        res.status(404).send("Player not found");
    }
}

export async function event_info(req, res){
    let all_tournaments = [];
    const list_of_tournaments = await Query.getPlayerEvents(req.params.id);
    for(let tournament of list_of_tournaments){
        tournament = tournament.dataValues; 
        const tourney_info = await Query.playerAtEvent(tournament, req.params.id);
        all_tournaments.push(tourney_info);
    }
    all_tournaments.sort((a, b) => {
        return b.event_start_time - a.event_start_time;
    });
    return all_tournaments;
}

export async function getH2H(req, res){
    return await Query.getPlayerH2H(req.params.id);
}


// Get event entrances for a player
// output: json of event id's



// Get standings for a player
// output: json of tuples with tourney id, event id, placement