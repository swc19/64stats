import {Tournament, Event, api_key} from "../../db.js";

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
          images(type:"profile"){
            url
          }
        }
      }`

    const tourn_info = await fetch('https://api.start.gg/gql/alpha', {
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
export async function getTournamentEvents(slug) {
    const tournament_id = await getIdFromSlug(slug);
    const tournament_event_query = 
    `query TournamentEvents($id: ID!){
        tournament(id: $id) {
            events {
                id
                name
                videogame{
                  id
                }
            }
        }
    }`;

    const event = await fetch('https://api.start.gg/gql/alpha', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + api_key,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({query: tournament_event_query, variables: {"id": tournament_id}})
    });
    const event_json = await event.json();
    const events = event_json.data.tournament.events;
    return events.filter(event => event.videogame.id == 4);
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
        tourney_slug: tournament.slug.replace('tournament/', ''),
        tourney_image: tournament.images[0].url
    });
    return tourn.toJSON();
}

export async function getIdFromSlug(slug){
  const tourn = await Tournament.findOne({where: {tourney_slug: slug}});
  return tourn.tourney_id;
}

export async function getSinglesEventsFromId(id){
  const events = await Event.findOne({where: {tourney_id: id}});
  return events;
  // if(events === null){
  //   return {};
  // } else {
  //   return events;
  // }
}