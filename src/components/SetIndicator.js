import styles from '../styles/setindicator.module.css';
import {Popover, OverlayTrigger} from 'react-bootstrap';


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

    return (<OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={
        <Popover id="popover-basic">
            <Popover.Header as="h3">vs. {getPlayerText(props.set)}</Popover.Header>
            <Popover.Body>
                {props.set.set_bracket_location} -- {getScoreOrder(props.set)}
            </Popover.Body>
        </Popover>}>
        <div className={styles['set-indicator']} style={{backgroundColor: setColor(getWin(props.set, props.player))}}><strong>{getWin(props.set, props.player)}</strong></div>
    </OverlayTrigger>)
}
