import styles from '../styles/setindicator.module.css';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';


export default function SetIndicator(props) {
    const player_slot = props.player.player_tag === props.set.entrant_0_tag ? 0 : 1;
    const player_score = player_slot === 0 ? props.set.entrant_0_score : props.set.entrant_1_score;

    function getWin(set, player){
        if(player_score === "DQ"){
            return 'DQ';
        }
        if(player.player_tag === set.winner_tag){  
            if(player_slot === 0 && set.entrant_1_score == "DQ"){
                return 'W - DQ';
            } else if(player_slot === 1 && set.entrant_0_score == "DQ"){
                return 'W - DQ';
            }
            return 'W';
        } else {
            return 'L';
        }
    }
      
    function setColor(status){
        if (status === "W" || status === "W - DQ"){
            return 'lightgreen'
        } else if (status === "L"){
            return 'lightcoral'
        } else {
            return 'grey'
        }
    }

    function getScoreOrder(set){
        if(player_slot === 0){
            return `${set.entrant_0_score}-${set.entrant_1_score}`;
        } else {
            return `${set.entrant_1_score}-${set.entrant_0_score}`;
        }
    }

    function getPlayerText(set){
        if(player_slot === 0){
            return `${set.entrant_1_tag}`;
        } else {
            return `${set.entrant_0_tag}`;
        }
    }

    return (
        <div className={styles['tooltip']}>
        <Tooltip
                title={
                    <React.Fragment>
                        <p style={{
                            fontSize: "2em", 
                            padding: ".5em 2em 0 2em", 
                            textAlign: "center"
                            }}>
                            vs. {getPlayerText(props.set)}
                        </p>
                        <hr></hr>
                        <p style={{
                            fontSize: "1.5em", 
                            padding: "0 2em 0 2em", 
                            textAlign: "center"
                            }}>
                            {props.set.set_bracket_location} -- {getScoreOrder(props.set)}
                        </p>
                    </React.Fragment>
                    }
                placement="top"
                PopperProps={{
                    sx: {
                        "& .MuiTooltip-tooltipArrow": {
                            backgroundColor: 'rgba(126, 126, 126, 1)',
                            border: "2px solid black",
                            maxWidth: "none",
                            "& hr": {
                                backgroundColor: "black",
                                border: "2px solid black",
                                width: "100%",
                            }
                        },
                        "& .MuiTooltip-arrow": {
                            color: 'rgba(126, 126, 126, 1)',
                            "&::before": {
                                border: "2px solid black",
                            },
                        }
                    }
                }}
                arrow
                disableInteractive
        >
                    <div className={styles['set-indicator']} style={{ backgroundColor: setColor(getWin(props.set, props.player)) }}><strong>{getWin(props.set, props.player)}</strong></div>
        </Tooltip>
        </div>
   )
}
