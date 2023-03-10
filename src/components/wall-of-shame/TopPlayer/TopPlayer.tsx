import * as React from "react";

import style from "./TopPlayer.module.scss";

interface Props {
    name: string;
    value: string;
}

export const TopPlayer = (props: Props) => {
    return (
        <svg className={style.TopPlayer} viewBox="0 0 341 356">
            <g className={style.AvatarContainer}>
                <path
                    d="M 100,300 L 100,0 L325,0 L325,300 L275,300"
                    transform="translate(15, 25)"
                    mask={`url(#${style.Mask})`}
                />
                <image
                    href={`/players/${props.name}.png`}
                    x="25"
                    y="25"
                    width="250"
                    height="250"
                    transform="translate(15, 25)"
                />
                <text x="0" y="65">
                    01
                </text>
            </g>
            <g className={style.PlayerInfo}>
                <rect
                    x="25"
                    y="285"
                    width="250"
                    height="40"
                    transform="translate(15, 25)"
                    mask={`url(#${style.Mask})`}
                />
                <text
                    x="25"
                    y="285"
                    dx="10"
                    dy="22"
                    alignmentBaseline="middle"
                    transform="translate(15, 25)"
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
                    transform="translate(15, 25)"
                >
                    {props.value}
                </text>
            </g>
            <mask id={style.Mask}>
                <rect width="100%" height="100%" />
                <path
                    d="M 200,280 L 235,280 L 210,330 L 175,330"
                    transform="translate(-10, 0)"
                />
            </mask>
            <g className={style.Ticks}>
                <path
                    d="M 210,280 L 220,280 L 195,330 L 185,330"
                    transform="translate(0, 25)"
                />
                <path
                    d="M 210,280 L 220,280 L 195,330 L 185,330"
                    transform="translate(15, 25)"
                />
            </g>
        </svg>
    );
};
