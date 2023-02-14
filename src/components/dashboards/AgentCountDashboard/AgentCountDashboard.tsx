import * as React from "react";

import Caption from "components/Caption";
import StratifiedPieGraph from "components/graphs/StratifiedPieGraph";
import { PLAYER_ROLE_COLORS, Player } from "config";

import style from "./AgentCountDashboard.module.scss";

interface Props {
    player: Player;
    individualData: Record<string, any>;

    className?: string;
}

export const AgentCountDashboard = (props: Props) => {
    const playerColors = PLAYER_ROLE_COLORS[props.player];

    // Pick hex colors based on which roles are played the most
    const orderedRoles: Record<string, number> = {};
    Object.entries(props.individualData[props.player].roles)
        .map(([role, playerRoleStats]: [string, Record<string, any>]) => ({
            label: role,
            count: Number(playerRoleStats.games),
        }))
        .sort((a, b) => b.count - a.count)
        .forEach((d, i) => {
            orderedRoles[d.label] = i;
        });

    const roleData = Object.entries(
        props.individualData[props.player].roles
    ).map(([role, playerRoleStats]: [string, Record<string, any>]) => ({
        label: role,
        count: 0, // d3 will compute this again for us
        parent: "root",
        color: playerColors[orderedRoles[role]],
    }));

    const data = Object.entries(props.individualData[props.player].agents)
        .map(([agent, playerAgentStats]: [string, Record<string, any>]) => ({
            label: agent,
            parent: String(playerAgentStats.role),
            color: playerColors[orderedRoles[playerAgentStats.role]],
            count: Number(playerAgentStats.games),
        }))
        // d3.stratify() requires entries for parents and the root
        .concat(roleData)
        .concat({ label: "root", parent: "", color: "", count: 0 });

    return (
        <div className={`${style.AgentCountDashboard} ${props.className}`}>
            <Caption
                title="Agent Select"
                description="Agent and role pick rates"
            />
            <StratifiedPieGraph
                data={data}
                initialDrawDuration={1000}
                transitionDuration={1000}
                percentage={true}
            />
        </div>
    );
};
