import * as React from "react";

import style from "./Leaderboard.module.scss";

interface Props {
    data: { label: string; score: number }[];
}

export const Leaderboard = (props: Props) => (
    <div className={style.Leaderboard}>
        <ol>
            {props.data.map(d => (
                <li key={d.label}>
                    {d.label} - {d.score}%
                </li>
            ))}
        </ol>
    </div>
);
