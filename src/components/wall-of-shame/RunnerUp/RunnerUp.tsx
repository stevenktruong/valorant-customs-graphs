import * as React from "react";

import style from "./RunnerUp.module.scss";

interface Props {
    name: string;
    rank: number;
    value: string;
}

export const RunnerUp = (props: Props) => {
    return (
        <svg className={style.RunnerUp} viewBox="0 0 426 175">
            <g className={style.AvatarContainer}>
                <image
                    href={`/players/${props.name}.png`}
                    x="25"
                    y="25"
                    width="125"
                    height="125"
                    transform="translate(15, 25)"
                />
                <text x="0" y="65">
                    0{props.rank}
                </text>
            </g>
            <g className={style.PlayerInfo}>
                <rect
                    x="25"
                    y="285"
                    width="250"
                    height="40"
                    transform="translate(150, -235)"
                    mask={`url(#${style.Mask})`}
                />
                <text
                    x="25"
                    y="285"
                    dx="10"
                    dy="22"
                    alignmentBaseline="middle"
                    transform="translate(150, -235)"
                >
                    {props.name}
                </text>
                <text
                    x="275"
                    y="285"
                    dx="-10"
                    dy="22"
                    textAnchor="end"
                    alignmentBaseline="middle"
                    transform="translate(150, -235)"
                >
                    {props.value}
                </text>
            </g>
            <mask id={style.Mask}>
                <rect width="100%" height="200%" />
                <path d="M 200,280 L 235,280 L 210,330 L 175,330" />
            </mask>
            <g className={style.Ticks}>
                <path
                    d="M 210,280 L 220,280 L 195,330 L 185,330"
                    transform="translate(145, -235)"
                />
                <path
                    d="M 210,280 L 220,280 L 195,330 L 185,330"
                    transform="translate(160, -235)"
                />
            </g>
        </svg>
    );
};
