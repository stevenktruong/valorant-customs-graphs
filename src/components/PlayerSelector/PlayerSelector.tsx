import * as React from "react";
import "./PlayerSelector.css";

import { PLAYERS } from "config";

interface Props {
    setCurrentPlayer: CallableFunction;
}

export const PlayerSelector = (props: Props) => {
    return (
        <div className="PlayerSelector">
            <select onChange={e => props.setCurrentPlayer(e.target.value)}>
                {PLAYERS.map(player => (
                    <option key={player} value={player}>
                        {player}
                    </option>
                ))}
            </select>
        </div>
    );
};
