import { useState } from 'react';
import styles from '../../styles/Home.module.css'


export default function DataLoader(){
    const [tourneySlug, setNewTourneySlug] = useState('');

    async function tournamentImport(slug){
      const tournament = await fetch(`/api/v1/tournament/slug/` + slug, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      console.log(tournament.status);
    }


    return(
        <div className={styles.main}>
            <input type="text" name="tournament" placeholder="Enter tournament slug" autoComplete="off" onChange={(e) => setNewTourneySlug(e.target.value)} />
            <button onClick={() => tournamentImport(tourneySlug)}>Import Tournament</button>
        </div>
    );
}