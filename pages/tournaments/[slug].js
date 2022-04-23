import {path} from '../../server/db.js';
import React from 'react';
import { password } from 'pg/lib/defaults';

export default function Tournament({tournament, events, singles_tourney, singles_standings}){
    async function eventImport(id, tourney_id){
        const event = await fetch(`/api/v1/event/${id}/${tourney_id}`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        });
        console.log(event.status);  
    }


    
    return(
        <div>
            <h1>{tournament.tourney_name}</h1>
            <p>{tournament.tourney_location}</p>
            <p>{tournament.tourney_start_time}</p>
            <p>{tournament.tourney_entrants}</p>
            <p>{tournament.tourney_slug}</p>
            <p>{tournament.tourney_id}</p>
            {singles_tourney 
                ? <><div>Events Imported: {singles_tourney.event_name}<br />
                    {singles_standings ? Object.entries(singles_standings).sort((a, b) => a[1].placement - b[1].placement).map(e => {
                        return (
                            <div>
                                <p key={e[0]}>{e[1].player_tag}, {e[1].placement}, {e[1].player_id}</p>
                            </div>
                        );
                    }) : null} </div><br /></>
             : <p>No Event Found</p>}
            

            Events:
            <ul>
                {events.map(event => {
                    return (
                        <li key={event.id}>
                            {event.id} - {event.name} <button onClick={() => eventImport(event.id, tournament.tourney_id)}>Import This Event</button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}


export async function getStaticPaths(){
    const tournaments = await fetch(`${path}/api/v1/tournament`).then(res => res.json());
    const paths = tournaments.map(tournament => {
        const slug = tournament.tourney_slug;
        return {
            params: {
                slug
            }
        }
    });
    //TODO: make fallback true once testing is complete for tourney pages
    return {paths, fallback: false}
}

export async function getStaticProps({params}){
    const slug = params.slug;
    const id = await fetch(`${path}/api/v1/tournament/${slug}/getId`).then(res => res.json());
    const tournament_data = await fetch(`${path}/api/v1/tournament/slug/${slug}`).then(res => res.json());
    const event_data = await fetch(`${path}/api/v1/tournament/${slug}/events`).then(res => res.json());
    const singles_data = await fetch (`${path}/api/v1/tournament/${id}/getSinglesEvents`).then(res => res.json());
    let singles_standings_data = null;
    if(singles_data !== null){
        const singles_id = singles_data.event_id;
        singles_standings_data = await fetch(`${path}/api/v1/standings/${singles_id}`).then(res => res.json());
    } else {}
    
    
    return{
        props: {
            tournament: tournament_data,
            events: event_data,
            singles_tourney: singles_data ? singles_data : null,
            singles_standings: singles_standings_data ? singles_standings_data.placements : null,
        }
    }
}