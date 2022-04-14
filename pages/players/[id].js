import {path} from '../../server/db.js';

export default function Player({player}){
    return;
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