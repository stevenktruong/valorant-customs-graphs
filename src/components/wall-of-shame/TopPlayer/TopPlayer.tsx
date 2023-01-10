import * as React from "react";

import style from "./TopPlayer.module.scss";

interface Props {
    name: string;
    value: number;
}

export const TopPlayer = (props: Props) => {
    return (
        <svg className={style.TopPlayer}>
            <g>
                <path
                    className={style.BackgroundRectangle}
                    d="M 100,0 L300,0 L300,300 L100,300 Z"
                />
                <image href="/players/andy.png" />
            </g>
        </svg>
    );
};
