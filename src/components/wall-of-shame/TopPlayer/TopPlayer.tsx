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
                <rect
                    className={style.BackgroundRectangle}
                    width="100"
                    height="200"
                />
            </g>
        </svg>
    );
};
