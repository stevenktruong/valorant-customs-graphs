import * as React from "react";

import { PLAYERS } from "config";

import style from "./PlayerSelector.module.scss";

interface Props {
    setCurrentPlayer: CallableFunction;
}

export const PlayerSelector = (props: Props) => {
    return (
        <div className={style.PlayerSelector}>
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
