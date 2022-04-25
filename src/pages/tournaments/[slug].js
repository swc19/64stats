import {path} from '../../../server/db.js';
import React, { useEffect } from 'react';
import styles from '../../styles/tournament.module.css';
import {Accordion} from 'react-bootstrap';
import {Pagination} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Tournament({tournament, events, singles_tourney, singles_standings}){
    async function eventImport(id, tourney_id){
        const event = await fetch(`/api/v1/event/${id}/${tourney_id}`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        });
        window.location.reload();
        console.log(event.status);  
    }

    /* Pagination Setup */
    const [active, setActive] = React.useState(1);
    const [standings, setStandings] = React.useState([]);
    const resultsPerPage = 15;
    let lastIndex = active * resultsPerPage;
    let firstIndex = lastIndex - resultsPerPage;
    let pages = [];
    for(let i = 1; i < (Math.ceil(Object.values(singles_standings).length / resultsPerPage)+1); i++){
        pages.push(
            <Pagination.Item key={i} active={active === i} onClick={() => paginate(i)}>{i}</Pagination.Item>
        );
    }

    function paginate(page){
        lastIndex = page * resultsPerPage;
        firstIndex = lastIndex - resultsPerPage;
        setActive(page);
        setStandings(Object.values(singles_standings).sort((a, b) => a.placement - b.placement).slice(firstIndex, lastIndex));
    }
    useEffect(() => {
        if (active === 1){
            setStandings(Object.values(singles_standings).sort((a, b) => a.placement - b.placement).slice(0, resultsPerPage));
        }}, [active]);
    
    return(
        <div className={styles['main']}>
            <div className={styles['tournament-info']}>
                <h1>{tournament.tourney_name}</h1>
                <p>{tournament.tourney_location}</p>
                <p>{tournament.tourney_start_time}</p>
                <p>{tournament.tourney_entrants}</p>
                <p>{tournament.tourney_slug}</p>
                <p>{tournament.tourney_id}</p>
            </div>
            Events:
            <ul>
                {events.filter(event => event.name.includes("64") && event.name.includes("Singles")).map(event => {
                    return (
                        <li key={event.id}>
                            {event.id} - {event.name} <button onClick={() => eventImport(event.id, tournament.tourney_id)}>Import This Event</button>
                        </li>                        
                        )
                })}
            </ul>
            
                {singles_tourney 
                    ? <><div>Events Imported: {singles_tourney.event_name} - {singles_tourney.event_entrants} Entrants</div><br />
                        <div className={styles['standing-wrapper']}>
                            <Accordion defaultActiveKey="0" className={styles['accordion']} alwaysOpen>
                            {singles_standings ? standings.map(player => {
                                return (
                                    <div key={player.player_id}>
                                        <Accordion.Item eventKey={player.player_id}>
                                            <Accordion.Header>{player.placement}{nth(player.placement)} -- {player.player_tag}</Accordion.Header>
                                            <Accordion.Body>
                                                {player.player_tag} got {player.placement}{nth(player.placement)} in {singles_tourney.event_name} at {tournament.tourney_name}. 
                                                Their sets will go here once done.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </div>
                                );
                            }) : null }
                            </Accordion>
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => paginate(active - 1)}
                                    disabled={active === 1}
                                />
                                {pages}
                                <Pagination.Next
                                    onClick={() => paginate(active + 1)}
                                    disabled={active === Math.ceil(Object.values(singles_standings).length / resultsPerPage)}
                                />
                            </Pagination>
                        </div><br /></>
                : <p>No Event Imported</p>}
        
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

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}