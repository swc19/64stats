import * as Query from './queries.js';
import * as StandingsQuery from '../standings/queries.js';
export async function handlePost(req, res) {
    const response = await Query.insertEvent(req.params.id, req.params.tourneyid);
    const standings = await StandingsQuery.getStandings(req.params.id);
    if(response){
        if(standings){
            res.status(200).send(response);
        } else {
            res.status(400).send('Error getting the standings for this event');
        }
    } else { 
        res.status(400).send("Event already Exists or Wasn't Found");
    }
}
