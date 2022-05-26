import {path} from '../../../server/db.js';
import React, {useEffect} from 'react';
import Head from 'next/Head';
import Image from 'next/image';
import styles from '../../styles/player.module.css';


export default function Player({player, tournament_data, player_h2h}){
    const logo_height = 24;
    const logo_width = 24;

    function getBestPlacements(){
        let placing_ratios = {};
        tournament_data.map(tournament => {
            placing_ratios[tournament.tournament_name] = parseInt(tournament.placement)/parseInt(tournament.event_entrants);
        });
        const sorted_placings = Object.entries(placing_ratios).sort((a,b) => a[1] - b[1])
        const best_placing = sorted_placings[0][1];
        let i=0;
        let best_placing_obj = {};
        while(sorted_placings[i][1] === best_placing){
            const tourney_placement = tournament_data.filter(tournament => tournament.tournament_name === sorted_placings[i][0])[0].placement;
            const tourney_entrants = tournament_data.filter(tournament => tournament.tournament_name === sorted_placings[i][0])[0].event_entrants;
            best_placing_obj[sorted_placings[i][0]] = [tourney_placement, tourney_entrants];
            i++;
        }
        return best_placing_obj;
    }
    function numberOfTopEights(){
        let top_eight_count = 0;
        tournament_data.map(tournament => {
            if(parseInt(tournament.placement) <= 8){
                top_eight_count++;
            }
        });
        return top_eight_count;
    }
    
    function totalSetCount(){
        let wins = 0;
        let losses = 0;
        Object.entries(player_h2h).map((h2h) => {
            wins+=parseInt(h2h[1].wins);
            losses+=parseInt(h2h[1].losses);
        })
        return [wins,losses];
    }

    return(
        <><Head><title>64Stats | {player.player_tag}</title></Head>
        <div className={styles['main']}>
            <div className={styles['sidebar']}>
                <div className={styles['player-info']}>
                    <h1><a href={`https://start.gg/user/${player.player_discriminator}`}>{player.player_tag}</a></h1>
                    <p>{player.player_realname}</p>
                    <p>
                        <Image
                            alt={player.player_country}
                            src={`https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/${player.player_country}.svg`}
                            width={45}
                            height={30}
                        />
                    </p>
                    {player.player_twitter || player.player_twitch ? <div className={styles['social-media']}>
                        {player.player_twitter ? <a href={`https://twitter.com/${player.player_twitter}`}><div className={styles['twitter']}>
                            <Image 
                                src="/Logo white.svg"
                                width={logo_width}
                                height={logo_height}>
                            </Image>
                            <span style={{marginLeft: '.35em'}}>{player.player_twitter}</span></div></a> : null}
                        {player.player_twitch ? <a href={`https://twitch.tv/${player.player_twitch}`}><div className={styles['twitch']}>
                            <Image 
                                src="/TwitchGlitchPurple.svg"
                                width={logo_width}
                                height={logo_height}>
                            </Image>
                            <span style={{marginLeft: '.35em'}}>{player.player_twitch}</span></div></a> : null}
                    </div> : null}
                    <br />
                    <br />
                    <div>Best Placing: {Object.entries(getBestPlacements()).map(placement => {
                        return(<span key={placement[0]}>{placement[0]} - {placement[1][0]}{nth(placement[1][0])} out of {placement[1][1]}</span>)
                    })}</div>
                    <div>Top 8s: {numberOfTopEights()}</div>
                    <div>Total Set Count: {totalSetCount()[0]}-{totalSetCount()[1]}</div>
                </div>
            </div>
            <div className={styles['content-container']}>
                <div className={styles['tournament-placings']}>
                    {/*TODO - Pagination, Accordion*/}
                    Tournaments:
                    {tournament_data.map((tournament) => {
                        return(
                            <div key={tournament.tournament_id}>
                                <p>{tournament.placement}{nth(tournament.placement)} @ <a href={`/tournaments/${tournament.tournament_slug}`}>{tournament.tournament_name}</a> - {tournament.event_name}</p>
                                <p>{makeDate(tournament.event_start_time)}</p>
                                <p>{tournament.event_entrants} Entrants</p>
                                <br />
                            </div>
                        )
                    }
                    )}
                </div>

                <div className={styles['h2h']}>
                    <h2>Head to Head</h2>
                    {Object.entries(player_h2h).map((h2h) => {
                        return(
                            <div key={h2h[1].id}>
                                <p>{h2h[0]} - {h2h[1].wins}-{h2h[1].losses}</p>
                            </div>
                        )
                    })}
                </div>
            </div>


            
        </div></>
    );
}

export async function getStaticPaths(){
    const players = await fetch(`${path}/api/v1/player`).then(res => res.json());
    const paths = players.map(player => {
        const id = player.player_id.toString();
        return {
            params: {
                id
            }
        }
    });
    return {paths, fallback: false}
}

export async function getStaticProps({params}){
    const id = params.id;
    const player_data = await fetch(`${path}/api/v1/player/${id}`).then(res => res.json());
    const player_tournament_data = await fetch(`${path}/api/v1/player/${id}/events`).then(res => res.json());
    const player_h2h = await fetch(`${path}/api/v1/player/${id}/h2h`).then(res => res.json());
    return{
        props: {
            player: player_data,
            tournament_data: player_tournament_data,
            player_h2h: player_h2h,
        }
    }
}

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}

function makeDate(date){
    date = new Date(date);
    const dateString = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
    return dateString;
}