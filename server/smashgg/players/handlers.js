import * as Query from './queries.js';

export async function handlePost(req, res) {
    const player = await Query.getPlayer(req.params.id);
    if (player) {
        const response = await Query.insertPlayer(player);
        response ? res.status(200).send(response) : res.status(400).send("Player already Exists");
    } else {
        res.status(404).send("Player not found");
    }
}

// Get event entrances for a player
// output: json of event id's



// Get standings for a player
// output: json of tuples with tourney id, event id, placement