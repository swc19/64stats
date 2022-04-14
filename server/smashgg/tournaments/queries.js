import {Tournament, api_key} from "../../db.js";

export async function tourneyImport(slug){
    const tourn_info_query = 
    `query Tournament($slug:String!){
        tournament(slug:$slug){
          id
          name
          countryCode
          venueAddress
          numAttendees
          startAt
          slug
        }
      }`

    const tourn_info = await fetch('https://api.smash.gg/gql/alpha', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + api_key,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: tourn_info_query, variables: {"slug": slug}})
    });

    const tourn_info_json = await tourn_info.json();
    return tourn_info_json.data.tournament;
}

// Get events from a tournament
export async function getTournamentEvents(tournament_id) {
  const tournament_event_query = 
  `query TournamentEvents($id: ID!){
      tournament(id: $id) {
          events {
              id
              name
          }
      }
  }`;

  const event = await fetch('https://api.smash.gg/gql/alpha', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + api_key,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({query: tournament_event_query, variables: {"id": tournament_id}})
  });
  const event_json = await event.json();
  return event_json.data.tournament.events;
}


//Insert a new tournament into the database using a tournament object
export async function insertTournament(tournament){
  // Verify unique tournament id
  const tourneyExists = await Tournament.count({where: {tourney_id: tournament.id}});
  if(tourneyExists){
    return false;
  }
    const tourn = await Tournament.create({
        tourney_id: tournament.id,
        tourney_name: tournament.name,
        tourney_country: tournament.countryCode,
        tourney_location: tournament.venueAddress,
        tourney_start_time: tournament.startAt*1000,
        tourney_entrants: tournament.numAttendees,
        tourney_slug: tournament.slug.replace('tournament/', '')
    });
    return tourn.toJSON();
}
