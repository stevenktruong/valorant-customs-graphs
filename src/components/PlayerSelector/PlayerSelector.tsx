import { Player } from "config";
import * as React from "react";

import style from "./PlayerSelector.module.scss";

interface Props {
    id?: string;
    names: string[];
    currentPlayer: Player;
    setCurrentPlayer: CallableFunction;
}

export const PlayerSelector = (props: Props) => {
    return (
        <div className={style.PlayerSelector}>
            <select
                onChange={e => props.setCurrentPlayer(e.target.value)}
                defaultValue={props.currentPlayer}
            >
                {props.names.map(name => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
};
