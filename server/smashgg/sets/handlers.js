import * as Query from './queries.js';

export async function handlePost(req, res){
    const event_id = req.params.id;
    const sets = await Query.setImport(event_id);
    if (sets) {
        const response = await Query.insertSets(sets);
        response ? res.status(200).send(response) : res.status(400).send("Sets already Exist");
    } else {
        res.status(404).send("Event not found");
    }

}
