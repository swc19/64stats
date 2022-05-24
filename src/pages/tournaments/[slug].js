import {path} from '../../../server/db.js';
import React, { useEffect } from 'react';
import Head from 'next/Head';
import Image from 'next/image';
import styles from '../../styles/tournament.module.css';
import {Accordion, Pagination} from 'react-bootstrap';
import SetIndicator from '../../components/SetIndicator.js';
import TourneyFacts from '../../components/TourneyFacts.js';


export default function Tournament({tournament, events, singles_tourney, singles_standings, sets, facts}){
    singles_standings = singles_standings ? singles_standings.placements : singles_standings;
    const bracketEnum = {
        "Winners Round 1": 0,
        "Winners Round 2": 1,
        "Winners Round 3": 2,
        "Winners Quarter-Final": 3,
        "Losers Round 1": 4,
        "Losers Round 2": 5,
        "Winners Semi-Final": 6,
        "Losers Round 3": 7,
        "Losers Round 4": 8,
        "Losers Quarter-Final": 9,
        "Winners Final": 10,
        "Losers Semi-Final": 11,
        "Losers Final": 12,
        "Grand Final": 13
    }

    const date = new Date(tournament.tourney_start_time);
    const dateString = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;


    async function eventImport(id, tourney_id){
        const event = await fetch(`/api/v1/event/${id}/${tourney_id}`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        });
        const set = await fetch(`/api/v1/set/event/${id}`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        });

        window.location.reload();
    }

    function getWinLoss(set_data, player_tag){
        let wins = 0;
        let total = 0;
        set_data.filter(set => set.entrant_0_tag === player_tag || set.entrant_1_tag === player_tag).forEach(set => {
            if(set.winner_tag === player_tag){
                wins++;
            }
            total++;
        });
        return `${wins}-${total-wins}`;
    }
    /* Pagination Setup */

    const [active, setActive] = React.useState(1);
    const [standings, setStandings] = React.useState([]);
    let [pages, setPages] = React.useState([]);
    const resultsPerPage = 14;
    let lastIndex = active * resultsPerPage;
    let firstIndex = lastIndex - resultsPerPage;

    function getPages(standings){
        if(standings){
            let page_array = [];
            for(let i = 1; i < (Math.ceil(Object.values(standings).length / resultsPerPage)+1); i++){
                page_array.push(
                    <Pagination.Item key={i} active={active === i} onClick={() => paginate(i)}>{i}</Pagination.Item>
                );
            }
            return page_array;
        }
    }

    useEffect(() => {
        setPages(getPages(singles_standings));
    }, [active]);

    function paginate(page){
        lastIndex = page * resultsPerPage;
        firstIndex = lastIndex - resultsPerPage;
        setActive(page);
        setStandings(Object.values(singles_standings).sort((a, b) => a.placement - b.placement).slice(firstIndex, lastIndex));
    }

    useEffect(() => {
        if (active === 1 && singles_standings) {
            setStandings(Object.values(singles_standings).sort((a, b) => a.placement - b.placement).slice(0, resultsPerPage));
        }}, [active]);
    

    /* Filter standings by player name */
    const [playerName, setPlayerName] = React.useState('');
    useEffect(() => {
        if(singles_standings){
            if (playerName) {
                const searched_standings = Object.values(singles_standings).sort((a, b) => a.placement - b.placement).filter(player => player.player_tag.toLowerCase().includes(playerName.toLowerCase()))
                setStandings(searched_standings.slice(firstIndex, lastIndex));
                /* update number of pagination pages based on filtered standings */
                let filtered_pages = getPages(searched_standings);
                setPages(filtered_pages);
                if(active > filtered_pages.length){
                    setActive(1);
                }
            } else {
                setPages(getPages(singles_standings));
                setStandings(Object.values(singles_standings).sort((a, b) => a.placement - b.placement).slice(firstIndex, lastIndex));
            }
        }
    }, [playerName, firstIndex, lastIndex]);

    //this sort is really awkward
    function setSort(set_array){
        let pools = [];
        let bracket = [];
        //Pools matches
        set_array.filter(set => set.set_lPlacement === null).forEach(set => {
            pools.push(set);
        });
        pools.sort((a, b) => a.set_completed_at - b.set_completed_at);
        set_array.filter(set => set.set_lPlacement !== null).forEach(set => {
            bracket.push(set);
        });
        bracket.sort((a, b) => bracketEnum[a.set_bracket_location] < bracketEnum[b.set_bracket_location]);
        return bracket.concat(pools);
    }
    
    return(
        <div><Head><title>{tournament.tourney_name}</title></Head>
            <div className={styles['main']}>
                <div className={styles['sidebar']}>
                    {tournament.tourney_image ? 
                        <div className={styles['tournament-logo']}>
                            <Image
                                alt="Tournament Logo"
                                src={tournament.tourney_image}
                                width={250}
                                height={250}
                                
                            />
                        </div>
                    : null}
                    <div className={styles['tournament-info']}>
                        <h1>{tournament.tourney_name}</h1>
                        <p>{tournament.tourney_location}</p>
                        <p>{dateString}</p>
                        <p>{tournament.tourney_entrants}</p>
                        <p>{tournament.tourney_slug}</p>
                        <p>{tournament.tourney_id}</p>
                        <br />
                    {singles_tourney && sets ?
                            <TourneyFacts data={facts} />
                    : null}
                    
                    Events:
                    <ul>
                        {events.filter(event => (event.name.includes("Singles") || event.name.includes("1v1"))).map(event => {
                            return (
                                <li key={event.id}>
                                    {event.id} - {event.name} {!sets ? <button onClick={() => eventImport(event.id, tournament.tourney_id)}>Import This Event</button> : null }
                                </li>
                            );
                        })} 
                    </ul>
                    {singles_tourney ? <div>Events Imported: {singles_tourney.event_name} - {singles_tourney.event_entrants} Entrants</div> : null}
                    </div>
                </div>

                <div className={styles['standings-container']}>
                    {singles_tourney? <><br />
                        <div className={styles['search-bar-container']}>
                            <input className={styles['search-bar']} type="text" placeholder="Search for a player" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                        </div>
                        <div className={styles['standings']}>
                            <Accordion defaultActiveKey="0" className={styles['accordion']} alwaysOpen>
                                {singles_standings ? standings.map(player => {
                                    return (
                                        <div key={player.player_id}>
                                            <Accordion.Item eventKey={player.player_id} className={styles['accordion-item']}>
                                                <Accordion.Button className={styles['accordion-button']}>
                                                
                                                    <span className={styles['accordion-header']}>
                                                        {player.placement}{nth(player.placement)} -- {player.player_tag}
                                                    </span>
                                                
                                                </Accordion.Button>
                                                <Accordion.Body>
                                                    <div className={styles['set-indicator-wrapper']}>
                                                        {setSort(sets.filter(set => set.entrant_0_tag === player.player_tag || set.entrant_1_tag === player.player_tag)).map(set => {
                                                            return (
                                                                <SetIndicator key={set.set_id} player={player} set={set} />
                                                            );
                                                        })}
                                                    </div>
                                                    {player.player_tag} got {player.placement}{nth(player.placement)} in {singles_tourney.event_name} at {tournament.tourney_name}.
                                                    They went {getWinLoss(sets, player.player_tag)}.
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                    );
                                }) : null}
                            </Accordion>
                            {singles_standings ? 
                            <div className={styles['pagination-wrapper']}><Pagination className={styles['pagination']}>
                                <Pagination.Prev
                                    onClick={() => paginate(active - 1)}
                                    disabled={active === 1} 
                                    />
                                {pages}
                                <Pagination.Next
                                    onClick={() => paginate(active + 1)}
                                    disabled={active === Math.ceil(Object.values(singles_standings).length / resultsPerPage)} 
                                    />
                            </Pagination></div> : null}
                        </div><br /></>
                        : <p>No Event Imported</p>}
                </div>
            </div>
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
    let singles_tourney_sets = null;
    let facts = null;
    if(singles_data !== null){
        const singles_id = singles_data.event_id;
        singles_standings_data = await fetch(`${path}/api/v1/standings/${singles_id}`).then(res => res.json());
        singles_tourney_sets = await fetch (`${path}/api/v1/set/event/${singles_id}`).then(res => res.json());
        facts = await makeFactsObject(singles_id);
    } else {}
    
    async function makeFactsObject(singles_id){
        const facts = {};
        facts['most_wins'] = await fetch(`${path}/api/v1/set/event/${singles_id}/mostGameWins`).then(res => res.json());
        facts['most_set_wins'] = await fetch(`${path}/api/v1/set/event/${singles_id}/mostSetWins`).then(res => res.json());
        facts['most_set_plays'] = await fetch(`${path}/api/v1/set/event/${singles_id}/mostSetPlays`).then(res => res.json());
        return facts;
    }

    return{
        props: {
            tournament: tournament_data,
            events: event_data,
            singles_tourney: singles_data ? singles_data : null,
            singles_standings: singles_standings_data,
            sets: singles_tourney_sets,
            facts: facts,
        }
    }
}

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}