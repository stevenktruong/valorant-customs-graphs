import * as React from "react";

import RunnerUp from "../RunnerUp";
import TopPlayer from "../TopPlayer";

import Header from "components/wall-of-shame/Header";

import style from "./Leaderboard.module.scss";

interface Props {
    title: string;
    description: string;
    data: {
        name: string;
        value: string;
    }[];
}

export const Leaderboard = (props: Props) => (
    <div className={style.Leaderboard}>
        <div className={style.HeaderContainer}>
            <Header title={props.title} description={props.description} />
        </div>
        <div className={style.PlayersContainer}>
            <div className={style.TopPlayer}>
                <TopPlayer
                    name={props.data[0].name}
                    value={props.data[0].value}
                />
            </div>
            <div className={style.RunnerUps}>
                {props.data.slice(1).map((d, i) => (
                    <RunnerUp
                        name={d.name}
                        value={d.value}
                        rank={i + 2}
                        key={d.name}
                    />
                ))}
            </div>
        </div>
    </div>
);
