import * as React from "react";

import style from "./Leaderboard.module.css";

interface Props {
    data: string[];
    margin: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}

export const Leaderboard = (props: Props) => (
    <div
        className={style.Leaderboard}
        style={{
            marginTop: props.margin.top,
            marginLeft: props.margin.left,
            marginRight: props.margin.right,
            marginBottom: props.margin.bottom,
        }}
    >
        <ol>
            {props.data.map(label => (
                <li>{label}</li>
            ))}
        </ol>
    </div>
);
