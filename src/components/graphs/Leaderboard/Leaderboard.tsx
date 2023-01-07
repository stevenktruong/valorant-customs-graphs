import * as React from "react";

import style from "./Leaderboard.module.scss";

interface Props {
    data: { label: string; score: number }[];
}

export const Leaderboard = (props: Props) => (
    <div className={style.Leaderboard}>
        <ol>
            {props.data.map((d, i) => (
                <li key={d.label}>
                    <span>
                        {i + 1}. {d.label}
                    </span>
                    <span>{d.score}%</span>
                </li>
            ))}
        </ol>
    </div>
);
