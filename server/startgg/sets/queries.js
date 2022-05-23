import pkg from 'sequelize';
const { Op } = pkg;
import { sequelize } from '../../db.js';
import {Set, api_key} from '../../db.js';

// Get all sets based on event id
export async function setImport(event_id) {
    const set_query = 
    `query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
        event(id: $eventId) {
            id
            name
            tournament{
                id
            }
            sets(
                page: $page
                perPage: $perPage
                sortType: RECENT
            ) {
                pageInfo {
                    total
                    totalPages
                }
                nodes {
                    id
                    displayScore
                    winnerId
                    completedAt
                    lPlacement
                    fullRoundText
                    slots {
                        entrant{
                            id
                            name
                            participants{
                                gamerTag
                                user{
                                    id
                                }
                            }
                        }
                        standing{
                            stats{
                                score {
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;    

    let sets = [];
    const setData = async function(pages){
        const data = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: set_query, variables: {"eventId": event_id, "page": pages, "perPage": 45}})
        });
        const data_json = await data.json();
        return data_json.data.event;
    }
    const first_page = await setData(1);
    const num_of_pages = first_page.sets.pageInfo.totalPages;
    for(let i = 1; i <= num_of_pages; i++){ 
        const page = await setData(i);
        page.sets.nodes.forEach(set => {
            // This assumes a singles bracket, hence the [0] in participants. Doubles is not in scope of this project (yet)
            let user_id_entrant_0 = -1;
            let user_id_entrant_1 = -1;
            let winner_tag = '';
            if(set.slots[0].entrant.participants[0].user !== null){
                // If anonymous user, there is no id, so set it to -1 to handle later
                // TODO check winner id case for anon winner
                user_id_entrant_0 = set.slots[0].entrant.participants[0].user.id;
            }
            if(set.slots[1].entrant.participants[0].user !== null){
                user_id_entrant_1 = set.slots[1].entrant.participants[0].user.id;
            }
            let set_object = {
                set_id: set.id,
                set_completed_at: set.completedAt*1000,
                set_bracket_location: set.fullRoundText,
                set_lPlacement: set.lPlacement,
                tourney_id: first_page.tournament.id,
                event_id: event_id,
                winner_id: set.winnerId,
                winner_tag: winner_tag,
                entrant_0: user_id_entrant_0,
                entrant_0_tag: set.slots[0].entrant.participants[0].gamerTag,
                entrant_1: user_id_entrant_1,
                entrant_1_tag: set.slots[1].entrant.participants[0].gamerTag,
                entrant_0_score: set.slots[0].standing.stats.score.value,
                entrant_1_score: set.slots[1].standing.stats.score.value,
            }
            const entrant_0_entrant_id =  set.slots[0].entrant.id;
            const entrant_1_entrant_id =  set.slots[1].entrant.id;

            if(set_object.set_start_time === 0){
                set_object.set_start_time = null;
            } 

            // If score is -1, then there was a DQ
            if(set_object.entrant_0_score === -1){
                set_object.entrant_0_score = "DQ";
            }
            if(set_object.entrant_1_score === -1){
                set_object.entrant_1_score = "DQ";
            }           
            
            // If score is null, then there is no "score", DQ is indeterminate
            // Consider it an actual win anyways, report "No game data found" in the frontend
            if(set_object.entrant_0_score === null && set_object.winner_id === entrant_0_entrant_id){
                set_object.entrant_0_score = "W";
                set_object.entrant_1_score = "L";
            }
            if(set_object.entrant_1_score === null && set_object.winner_id === entrant_1_entrant_id){
                set_object.entrant_1_score = "W";
                set_object.entrant_0_score = "L";
            }
            
            // Map the winner id to the user's id, instead of the entrant id
            if(set_object.winner_id === entrant_0_entrant_id){
                set_object.winner_id = set_object.entrant_0;
            }
            if(set_object.winner_id === entrant_1_entrant_id){
                set_object.winner_id = set_object.entrant_1;
            }

            if(set_object.winner_id === set_object.entrant_0){
                set_object.winner_tag = set_object.entrant_0_tag;
            }
            if(set_object.winner_id === set_object.entrant_1){
                set_object.winner_tag = set_object.entrant_1_tag;
            }
            if(set_object.entrant_0 === -1 && set_object.entrant_1 === -1){

                if(set_object.entrant_0_score === "W" || set_object.entrant_1_score === "DQ"){
                    set_object.winner_tag = set_object.entrant_0_tag;
                }
                if(set_object.entrant_1_score === "W" || set_object.entrant_0_score === "DQ"){
                    set_object.winner_tag = set_object.entrant_1_tag;
                }
            }
            // TODO check if player exists, if not add them
            // else this will violate foreign key constraint
            sets.push(set_object);
        }
    )};    
    return sets;
}

export async function insertSets(sets){
    // parameter sets - an array of set objects
    for(const set of sets){
        // Check if set id is in database
        const set_unique = await Set.findOne({where: {set_id: set.set_id}});
        // Realistically, if there's one duplicate set then everything will be a duplicate, but check all to be sure
        if(!set_unique){
            await Set.create(set);
        }
    }
    return true;
}

export async function getMostGamesWon(event_id){
    const players = {};
    const when_entrant_0 = await Set.findAll({
        where:{
            event_id: event_id,
            entrant_0_score: {
                [Op.notRegexp]: '^[DQ|L|W]',   
            }
        },
        attributes: ['entrant_0_tag', [sequelize.fn('SUM', sequelize.cast(sequelize.col('entrant_0_score'), 'int')), 'count']],
        group: ['entrant_0_tag'],
        order: [[sequelize.literal('count'), 'DESC']],
    });
    when_entrant_0.forEach(player => {
        player = player.dataValues;
        if(parseInt(player.count)){
            players[player.entrant_0_tag] = parseInt(player.count);
        } else {
            players[player.entrant_0_tag] = 0;
        }
    });
    const when_entrant_1 = await Set.findAll({
        where:{
            event_id: event_id,
            entrant_1_score: {
                [Op.notRegexp]: '^[DQ|L|W]',
            }
        },
        attributes: ['entrant_1_tag', [sequelize.fn('SUM', sequelize.cast(sequelize.col('entrant_1_score'), 'int')), 'count']],
        group: ['entrant_1_tag'],
        order: [[sequelize.literal('count'), 'DESC']],
    });
    when_entrant_1.forEach(player => {
        player = player.dataValues;
        if(players[player.entrant_1_tag]){
            if(parseInt(player.count)){
                players[player.entrant_1_tag] += parseInt(player.count);
            }
        }
        else{
            players[player.entrant_1_tag] = parseInt(player.count) ? parseInt(player.count) : 0;
        }
    });
    const most_games_won = Object.entries(players).sort((a, b) => b[1] - a[1])[0][1];
    const all_most_games_won = Object.entries(players).filter(player => player[1] === most_games_won);
    return(all_most_games_won);
}

export async function getMostSetWins(event_id){
    const players = {};
    const win_list = await Set.findAll({
        where:{
            event_id: event_id,
        },
        attributes: ['winner_tag', [sequelize.fn('COUNT', sequelize.col('winner_tag')), 'count']],
        group: ['winner_tag'],
        order: [[sequelize.literal('count'), 'DESC']],
    });
    win_list.forEach(player => {
        player = player.dataValues;
        if(parseInt(player.count)){
            players[player.winner_tag] = parseInt(player.count);
        } else {
            players[player.winner_tag] = '';
        }
    });
    const most_sets_won = Object.entries(players).sort((a, b) => b[1] - a[1])[0][1];
    const all_most_sets_won = Object.entries(players).filter(player => player[1] === most_sets_won);
    return(all_most_sets_won);
}

export async function getMostSetsPlayed(event_id){
    const players = {}
    const when_entrant_0 = await Set.findAll({
        where:{
            event_id: event_id
        },
        attributes: ['entrant_0_tag', [sequelize.fn('COUNT', sequelize.col('set_id')), 'count']],
        group: ['entrant_0_tag'],
        order: [[sequelize.literal('count'), 'DESC']],
    });
    when_entrant_0.forEach(player => {
        player = player.dataValues;
        players[player.entrant_0_tag] = parseInt(player.count);
    });
    const when_entrant_1 = await Set.findAll({
        where:{
            event_id: event_id
        },
        attributes: ['entrant_1_tag', [sequelize.fn('COUNT', sequelize.col('set_id')), 'count']],
        group: ['entrant_1_tag'],
        order: [[sequelize.literal('count'), 'DESC']],
    });
    when_entrant_1.forEach(player => {
        player = player.dataValues;
        if(players[player.entrant_1_tag]){
            if(parseInt(player.count)){
                players[player.entrant_1_tag] += parseInt(player.count);
            }
        }
        else{
            players[player.entrant_1_tag] = parseInt(player.count);
        }
    });
    const most_sets_played = Object.entries(players).sort((a, b) => b[1] - a[1])[0][1];
    const all_most_sets_played = Object.entries(players).filter(player => player[1] === most_sets_played);
    return(all_most_sets_played);
}