import fetch from 'node-fetch';
import {Player, api_key} from '../../db.js';
import { getCountryCode } from '../util.js';


export async function getPlayer(player_id) {
    // Get the User from smash.gg
    // User is the highest "level" of data, as opposed to participant or entrant
    const player_query = 
    `query User($playerId:ID!) {
        user(id:$playerId){
          id
          name
          location{
            country
          }
          player{
            gamerTag
          }
          authorizations{
            type
            externalUsername
          }
        }
      }`;

    const player_data = await fetch('https://api.smash.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: player_query, variables: {"playerId": player_id}})
    });
    const player_json = await player_data.json();
    return player_json.data.user;
}

export async function insertPlayer(player_id) {
    // Verify uniqueness of user
    const player_unique = await Player.findOne({where: {player_id: player_id}});
    if(!player_unique) {
        return;
    }
    // Add player into database
    const player = await getPlayer(player_id);

    player.location.country === "United States" ? player.location.country = "United States of America" : player.location.country;
    player.location.country = await getCountryCode(player.location.country);

    const player_object = {
        player_id: player.id,
        player_tag: player.player.gamerTag,
        player_realname: player.name,
        player_country: player.location.country,
    }
    if(player.authorizations.find(auth => auth.type === 'TWITCH')) {
        player_object.player_twitch = player.authorizations.find(auth => auth.type === 'TWITCH').externalUsername;
    }
    if(player.authorizations.find(auth => auth.type === 'TWITTER')) {
        player_object.player_twitter = player.authorizations.find(auth => auth.type === 'TWITTER').externalUsername;
    }
    const player_insert = await Player.create(player_object);
    return player_insert.toJSON();
}
