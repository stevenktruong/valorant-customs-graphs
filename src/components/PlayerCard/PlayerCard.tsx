import * as React from "react";

import { AGENT_COLORS, Player, ValorantAgent } from "config";

import style from "./PlayerCard.module.scss";

interface Props {
    player: Player;
    alias: string;
    agent: ValorantAgent;
    roles: string[];
}

export const PlayerCard = (props: Props) => {
    return (
        <svg className={style.PlayerCard} viewBox="-200 0 600 700">
            <mask id="agentMask">
                <rect x="0" y="0" width="400" height="700" fill="white" />
            </mask>
            <mask id="nameMask">
                <rect x="-200" y="0" width="430" height="700" fill="white" />
            </mask>
            <rect
                x="0"
                y="0"
                width="400"
                height="700"
                fill={AGENT_COLORS[props.agent][0]}
            />
            <polygon
                points="0,700 400,700 400,0"
                fill={AGENT_COLORS[props.agent][1]}
            />
            <g mask="url(#nameMask)" className={style.NameContainer}>
                {Array(3)
                    .fill(null)
                    .map((_, i) => (
                        <text y={125 * i} transform="translate(-200, 300)">
                            {props.player.toUpperCase()}
                        </text>
                    ))}
            </g>
            <g className={style.AgentImageContainer}>
                <image
                    href={`/agents/full-body/${props.agent
                        .split("/")
                        .join("")}.png`}
                    x="-40"
                    y="100"
                    width="587"
                    height="900"
                    mask="url(#agentMask)"
                />
            </g>
            <g transform="translate(20,30)" className={style.AliasContainer}>
                <text>ALIAS</text>
                <text y="20">{props.alias.toUpperCase()}</text>
            </g>
            <g
                transform="translate(370, 20) rotate(90)"
                className={style.RoleContainer}
            >
                <text fontStyle="italicized">ROLE</text>
                {props.roles.map((role, i) => (
                    <text y={20 * (i + 1)}>{role.toUpperCase()}</text>
                ))}
            </g>
        </svg>
    );
};
