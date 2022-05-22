import {Event, api_key} from "../../db.js";


// Get event info from an event id
export async function getEvent(event_id) {
    const event_query = 
    `query Event($id: ID!){
        event(id: $id) {
            name
            startAt
            numEntrants
        }
    }`

    const event = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + api_key,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: event_query, variables: {"id": event_id}})
    });
    const event_json = await event.json();
    return event_json.data.event;
}

// Insert a set into the database using event and tournament ids
export async function insertEvent(event_id, tournament_id) {
    const event = await getEvent(event_id);
    //verify uniqueness
    const existing_event = await Event.findOne({where: {event_id: event_id}});
    if (existing_event) {
        return false;
    }
    const event_insert = await Event.create({
        event_id: event_id,
        tourney_id: tournament_id,
        event_name: event.name,
        event_start_time: event.startAt*1000,
        event_entrants: event.numEntrants
    });
    return event_insert.toJSON();
}

//delete an event from the database
export async function deleteEvent(event_id) {
    const event = await Event.findOne({
        where: {
            event_id: event_id
        }
    });
    await event.destroy();
}
