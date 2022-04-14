import {path} from '../../server/db.js';

export default function Tournament({tournament}){
    return(
        <div>
            <h1>{tournament.tourney_name}</h1>
            <p>{tournament.tourney_location}</p>
            <p>{tournament.tourney_start_time}</p>
            <p>{tournament.tourney_entrants}</p>
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
    return {paths, fallback: false}
}

export async function getStaticProps({params}){
    const slug = params.slug;
    const tournament_data = await fetch(`${path}/api/v1/tournament/slug/${slug}`).then(res => res.json());
    return{
        props: {
            tournament: tournament_data
        }
    }
}