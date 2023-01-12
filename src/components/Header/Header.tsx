import * as React from "react";

import { PLAYERS } from "config";

import PlayerSelector from "components/PlayerSelector";

import style from "./Header.module.scss";

interface Props {
    title: string;
    description: string;
    currentPlayer: string;
    setCurrentPlayer: CallableFunction;
}

export const Header = (props: Props) => (
    <div className={style.Header}>
        <div className={style.TextContainer}>
            <h1>{props.title}</h1>
            <p>{props.description}</p>
        </div>
        <div className={style.SelectorContainer}>
            <h2>Player:</h2>
            <PlayerSelector
                id={style.Selector}
                currentPlayer={props.currentPlayer}
                setCurrentPlayer={props.setCurrentPlayer}
                names={PLAYERS}
            />
        </div>
    </div>
);
