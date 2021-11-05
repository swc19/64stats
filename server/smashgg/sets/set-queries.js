import fetch from 'node-fetch';
import {Set, api_key} from '../../db.js';

// Get all sets
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
                    startAt
                    fullRoundText
                    slots {
                        entrant{
                            id
                            name
                            participant{
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
        const data = await fetch('https://api.smash.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: set_query, variables: {"eventId": event_id, "page": pages, "perPage": 50}})
        });
        const data_json = await data.json();
        return data_json.data.event;
    }
    const first_page = await setData(1);
    const num_of_pages = first_page.sets.pageInfo.totalPages;

    for(let i = 1; i <= num_of_pages; i++){ 
        const page = await setData(i);
        page.sets.nodes.forEach(set => {
            //TODO implement rest when player lookup is implemented
            let set_object = {
                set_id: set.id,
                set_start_time: set.startAt*1000,
                set_bracket_location: set.fullRoundText,
                tourney_id: first_page.tournament.id,
                event_id: event_id,
                //winner_id: set.winnerId,
                //entrant_0: set.slots[0].entrant.participant.user.id,
                //entrant_1: set.slots[1].entrant.participant.user.id,
                entrant_0_score: set.slots[0].standing.stats.score.value,
                entrant_1_score: set.slots[1].standing.stats.score.value,
            }
            if(set_object.set_start_time === 0){
                set_object.set_start_time = null;
            } 
            sets.push(set_object);
        }
    )};
    for(const set of sets){
        await Set.create(set);
    }
    return true;
}
