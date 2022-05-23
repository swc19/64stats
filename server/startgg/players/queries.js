import pkg from 'sequelize';
const { Op } = pkg;
import {Player, Tournament, Event, Set, Standings, api_key} from '../../db.js';
import { getCountryCode } from '../util.js';


export async function getPlayer(player_id) {
    // Get the User from start.gg
    // User is the highest "level" of data, as opposed to participant or entrant
    const player_query = 
    `query User($playerId:ID!) {
        user(id:$playerId){
          id
          name
          discriminator
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

    const player_data = await fetch('https://api.start.gg/gql/alpha', {
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
    const player_exists = await Player.findOne({where: {player_id: player_id}});
    if(player_exists) {
        return;
    }
    // Add player into database
    const player = await getPlayer(player_id);

    player.location.country === "United States" ? player.location.country = "United States of America" : player.location.country;
    player.location.country = await getCountryCode(player.location.country);

    const player_object = {
        player_id: player.id,
        player_tag: player.player.gamerTag,
        player_discriminator: player.discriminator,
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


export async function getPlayerEvents(player_id){
    const player_events = await Set.findAll(
      {attributes: ['tourney_id', 'event_id'], 
        where: {[Op.or]: [{entrant_0: player_id}, {entrant_1: player_id}]},
        group: ['tourney_id', 'event_id']});
    return player_events;
}

export async function playerAtEvent(tournament, player_id){
    const tourney_info = await Tournament.findByPk(tournament.tourney_id);
    const event_info = await Event.findByPk(tournament.event_id);
    const event_placements = await Standings.findOne({attributes: ['placements'], where: {event_id: tournament.event_id}});
    const player_placement = event_placements.dataValues.placements[player_id].placement;
    //Populate all tournaments person was at
    let event_obj = {
        tournament_id: tournament.tourney_id,
        tournament_name: tourney_info.tourney_name,
        tournament_slug: tourney_info.tourney_slug,
        event_name: event_info.event_name,
        event_entrants: event_info.event_entrants,
        event_start_time: event_info.event_start_time,
        placement: player_placement,
        sets: {

        }
    };
    return event_obj;
}