import { useState } from 'react';
import styles from '../../styles/Home.module.css'


export default function DataLoader(){
    const [tourneySlug, setNewTourneySlug] = useState('');
    const [playerID, setNewPlayerID] = useState('');

    async function tournamentImport(slug){
        const tournament = await fetch(`/api/v1/tournament/slug/` + slug, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
        });
        console.log(tournament.status);
    }

    async function playerImport(id){
        const player = await fetch(`/api/v1/player/` + id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });
        console.log(player.status);
    }

    return(
        <main className={styles.main}>
            <h3>Import Tournament</h3>
            <input type="text" name="tournament" placeholder="Enter tournament slug" autoComplete="off" onChange={(e) => setNewTourneySlug(e.target.value)} />
            <button onClick={() => tournamentImport(tourneySlug)}>Submit</button>

            <p>Import Player</p>
            <input type="text" name="player" placeholder="Enter player id" autoComplete="off" onChange={(e) => setNewPlayerID(e.target.value)} />
            <button onClick={() => PlayerImport(playerID)}>Submit</button>
        </main>
    );
}