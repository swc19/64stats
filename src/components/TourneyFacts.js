

export default function TourneyFacts(props){

    return(
        <div>
            <h2>Tourney Facts</h2>
            <p>Most games won: {props.data.most_wins.map(player => {
                return(<span key={player[0]}>{player[0]} ({player[1]}) </span>)
            })}</p>
            <p>Most sets won: {props.data.most_set_wins.map(player => {
                return(<span key={player[0]}>{player[0]} ({player[1]}) </span>)
            })}</p>
            <p>Most sets played: {props.data.most_set_plays.map(player => {
                return(<span key={player[0]}>{player[0]} ({player[1]}) </span>)
            })}</p>
        </div>
    )

}

