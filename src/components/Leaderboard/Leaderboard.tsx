import * as React from "react";

import style from "./Leaderboard.module.css";

interface Props {
    data: string[];
}

export const Leaderboard = (props: Props) => (
    <div className={style.Leaderboard}>
        <ol>
            {props.data.map(label => (
                <li key={label}>{label}</li>
            ))}
        </ol>
    </div>
);
