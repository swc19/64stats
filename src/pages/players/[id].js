import {path} from '../../server/db.js';
import React, {useEffect} from 'react';
import Head from 'next/head';

export default function Player({player}){
    return(
        <><Head><title>{player.player_tag}</title></Head></>
    );
}

export async function getStaticPaths(){
    const players = await fetch(`${path}/api/v1/player`).then(res => res.json());
    const paths = players.map(player => {
        const id = player.player_id;
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
    return{
        props: {
            player: player_data
        }
    }
}