import * as Query from './queries.js';

export async function handlePost(req, res) {
    try{
        await Query.getStandings(req.params.event_id);
        res.status(200).send();
    } catch (e){
        res.status(404).send("Event not found");
    }
}
