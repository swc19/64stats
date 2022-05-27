import pkg from 'sequelize';
const { Op } = pkg;
import {Player, Tournament, Event, Set, Standings, api_key} from '../../db.js';
import { getCountryCode } from '../util.js';


async function getPlayer(player_id) {
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
    // If player has a location, get the country code
    // Otherwise set it to null
    if(player){
      if(player.location){
        player.location.country === "United States" ? player.location.country = "United States of America" : player.location.country;
        player.location.country = await getCountryCode(player.location.country);
      } else {
        player.location = {country: null};
      }
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
}


export async function getPlayerEvents(player_id){
  // Get all events that a player has a standing in
    const player_events = await Set.findAll(
      {attributes: ['tourney_id', 'event_id'], 
        where: {[Op.or]: [{entrant_0: player_id}, {entrant_1: player_id}]},
        group: ['tourney_id', 'event_id']});
    return player_events;
}

export async function playerAtEvent(tournament, player_id){
    // Get specific results from a player at a tournament
    // This is to populate a player page's tournaments section
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

export async function getPlayerH2H(player_id){
    // Get a Head to Head comparison between a player and all other players they've played
    player_id = parseInt(player_id);
    const player_h2h = await Set.findAll(
      {attributes: ['entrant_0', 'entrant_1', 'winner_id', 'entrant_0_tag', 'entrant_1_tag'],
      where: {[Op.or]: [{entrant_0: player_id}, {entrant_1: player_id}]},
      group: ['entrant_0', 'entrant_1', 'winner_id', 'entrant_0_tag', 'entrant_1_tag']});
    let player_h2h_obj = {};
    for(let i = 0; i < player_h2h.length; i++){
      const set = player_h2h[i].dataValues;
      // Set an "other" variable if the player played against isn't a "player" according to start.gg
      // They have a -1 id, so just decrement the id further to preserve uniqueness in displaying on player page.
      let other = false;
      let other_id = -1;
      if(set.entrant_0 === -1 || set.entrant_1 === -1){
        other = true;
      }
      // So much repetitive code!
      if(set.entrant_0 === player_id){
        let entrant_1;
        if(!other){
          if(! await Player.findByPk(set.entrant_1)){
            // Insert player into database if they don't yet exist
            await insertPlayer(set.entrant_1);
          }
          entrant_1 = await Player.findByPk(set.entrant_1);
          entrant_1 = entrant_1.dataValues;
        } else {
          entrant_1 = {player_tag: set.entrant_1_tag, player_id: other_id};
          other_id -= 1;
        }
        if(set.winner_id === player_id){
          // If player won the set
          if(player_h2h_obj[entrant_1.player_tag]){
            // Increment wins, update win count and ratio
            player_h2h_obj[entrant_1.player_tag].wins++;
            player_h2h_obj[entrant_1.player_tag].win_ratio = player_h2h_obj[entrant_1.player_tag].wins/(player_h2h_obj[entrant_1.player_tag].wins+player_h2h_obj[entrant_1.player_tag].losses);
          } else {
            // If player doesn't yet exist in the h2h object, make an object
            player_h2h_obj[entrant_1.player_tag] = {wins: 1, losses: 0, id: entrant_1.player_id, win_ratio: 1, id: entrant_1.player_id};
          }
        } else {
          if(player_h2h_obj[entrant_1.player_tag]){
            player_h2h_obj[entrant_1.player_tag].losses++;
            player_h2h_obj[entrant_1.player_tag].win_ratio = player_h2h_obj[entrant_1.player_tag].wins/(player_h2h_obj[entrant_1.player_tag].wins+player_h2h_obj[entrant_1.player_tag].losses);
          } else {
            player_h2h_obj[entrant_1.player_tag] = {wins: 0, losses: 1, id: entrant_1.player_id, win_ratio: 0, id: entrant_1.player_id};
          }
        }
      } else {
        let entrant_0;
        if(!other){
          if(! await Player.findByPk(set.entrant_0)){
            await insertPlayer(set.entrant_0);
          }
          entrant_0 = await Player.findByPk(set.entrant_0);
          entrant_0 = entrant_0.dataValues;
        } else {
          entrant_0 = {player_tag: set.entrant_0_tag, player_id: other_id};
          other_id -= 1;
        }
        if(set.winner_id === player_id){
          if(player_h2h_obj[entrant_0.player_tag]){
            player_h2h_obj[entrant_0.player_tag].wins++;
            player_h2h_obj[entrant_0.player_tag].win_ratio = player_h2h_obj[entrant_0.player_tag].wins/(player_h2h_obj[entrant_0.player_tag].wins+player_h2h_obj[entrant_0.player_tag].losses);
          } else {
            player_h2h_obj[entrant_0.player_tag] = {wins: 1, losses: 0, id: entrant_0.player_id, win_ratio: 1, id: entrant_0.player_id};
          }
        } else {
          if(player_h2h_obj[entrant_0.player_tag]){
            player_h2h_obj[entrant_0.player_tag].losses++;
            player_h2h_obj[entrant_0.player_tag].win_ratio = player_h2h_obj[entrant_0.player_tag].wins/(player_h2h_obj[entrant_0.player_tag].wins+player_h2h_obj[entrant_0.player_tag].losses);
          } else {
            player_h2h_obj[entrant_0.player_tag] = {wins: 0, losses: 1, id: entrant_0.player_id, win_ratio: 0, id: entrant_0.player_id};
          }
        }
      }
    }
    return player_h2h_obj;
}