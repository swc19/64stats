import {path} from '../../../server/db.js';
import React, {useEffect} from 'react';
import Head from 'next/Head';
import styles from '../../styles/player.module.css';

export default function Player({player, tournament_data}){
    return(
        <><Head><title>64Stats | {player.player_tag}</title></Head>
        <div className={styles['main']}>
            <div className={styles['sidebar']}>
                <div className={styles['player-info']}>
                    <h1><a href={`https://start.gg/user/${player.player_discriminator}`}>{player.player_tag}</a></h1>
                    <p>{player.player_realname}</p>
                    <p>{player.player_country}</p>
                    {player.player_twitter ? <p>Twitter: <a href={`https://twitter.com/${player.player_twitter}`}>{player.player_twitter}</a></p> : null}
                    {player.player_twitch ? <p>Twitch: <a href={`https://twitch.tv/${player.player_twitch}`}>{player.player_twitch}</a></p> : null}
                </div>
            </div>
            <div className={styles['content-container']}>
                <div className={styles['content']}>
                    Tournaments:
                    {tournament_data.map((tournament) => {
                        return(
                            <div key={tournament.tournament_id}>
                                <p>{tournament.placement}{nth(tournament.placement)} @ {tournament.tournament_name} - {tournament.event_name}</p>
                                <p>{makeDate(tournament.event_start_time)}</p>
                                <p>{tournament.event_entrants} Entrants</p>
                                <br />
                            </div>
                            
                        )
                    }
                    )}
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
    return{
        props: {
            player: player_data,
            tournament_data: player_tournament_data
        }
    }
}

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}

function makeDate(date){
    date = new Date(date);
    const dateString = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
    return dateString;
}