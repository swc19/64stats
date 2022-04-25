import { useState } from 'react';
import styles from '../../styles/Home.module.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        toast("Importing Tournament...")
        switch(tournament.status){
            case 200:
                toast.dismiss();
                toast.success("Tournament Imported");
                break;
            case 400:
                toast.dismiss();
                toast.info("Tournament Already Exists");
                break;
            case 404:
                toast.dismiss();
                toast.error("Tournament Not Found");
                break;
        }
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
            
            <ToastContainer 
                position="bottom-right"
                hideProgressBar={true}
                autoClose={5000}
            />
        </main>
    );
}