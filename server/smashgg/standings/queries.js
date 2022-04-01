import {Standings, Event, api_key} from "../../db.js";

// Get standings from an event
export async function getStandings(event_id) {
  const event = await Event.findOne({where: {event_id: event_id}});
  if (!event) {
    throw new Error("Event does not exist");
  }
    const standings_query = 
    `query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {
        event(id: $eventId) {
          tournament{
            id
          }
          standings(query: {
            perPage: $perPage,
            page: $page
          }){
            pageInfo{
              totalPages
            }
            nodes {
              placement
              entrant {
                participants{
                  user{
                    id
                  }
                } 
              }
            }
          }
        }
      }`;
      const standingsData = async function(pages){
        const data = await fetch('https://api.smash.gg/gql/alpha', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + api_key,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({query: standings_query, variables: {"eventId": event_id, "page": pages, "perPage": 150}})
        });
        const data_json = await data.json();
        return data_json.data.event;
    }
    const first_page = await standingsData(1);
    const num_of_pages = first_page.standings.pageInfo.totalPages;

    let standings_obj = {};
    for(let i = 1; i < num_of_pages; i++){
        const page = await standingsData(i);
        page.standings.nodes.forEach(function(standings){
            if(standings.entrant.participants[0].user === null){
                return;
            }
            standings_obj[standings.entrant.participants[0].user.id] = standings.placement;
        });
    }
    await Standings.create({
        event_id: event_id,
        tournament_id: first_page.tournament.id,
        placements: standings_obj
    });
    return true;
}