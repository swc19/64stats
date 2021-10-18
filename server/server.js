import fetch from 'node-fetch';
import express from 'express';
import asyncHandler from "express-async-handler";
const api_key = process.env.API_KEY;
const server = express()
const port = 3000

server.get('/', asyncHandler(async (req, res) => {
    res.send(await test());
}))

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

async function test(){
    var test_query = `query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) {
        event(id: $eventId) {
            id
            name
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
                    slots {
                        entrant{
                            id
                            name
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
    let new_object = {};
    let sets_counted = [];
    for (let x=0; x<32; x+=1){
        const testData = await fetch('https://api.smash.gg/gql/alpha', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + api_key,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({query: test_query, variables: {"eventId": 99485, "page": x, "perPage": 50}})
        });

        let result = await testData.json();
        for(let item of result.data.event.sets.nodes){
            if(!sets_counted.includes(item.id)){
                //item.winnerId in new_object ? new_object[item.winnerId] += 1 : new_object[item.winnerId] = 1;

                item.slots[0].entrant.name in new_object ? new_object[item.slots[0].entrant.name] += 1 : new_object[item.slots[0].entrant.name] = 1;
                item.slots[1].entrant.name in new_object ? new_object[item.slots[1].entrant.name] += 1 : new_object[item.slots[1].entrant.name] = 1;
                sets_counted.push(item.id);
            }

        }
    }
    console.log(sets_counted);
    return new_object;
}