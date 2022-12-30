import * as React from "react";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import StratifiedPieGraph from "components/graphs/StratifiedPieGraph";

import style from "./AgentCountDashboard.module.scss";

interface Props {
    player: string;
    individualData: Record<string, any>;
}

export const AgentCountDashboard = (props: Props) => {
    const data = ["Duelist", "Initiator", "Controller", "Sentinel"].map(
        role => ({
            stratumLabel: role,
            color: "green",
            stratumData: Object.entries(
                props.individualData[props.player].agents
            )
                .filter(
                    ([agent, playerAgentStats]: [
                        string,
                        Record<string, any>
                    ]) => playerAgentStats.role === role
                )
                .map(
                    ([agent, playerAgentStats]: [
                        string,
                        Record<string, any>
                    ]) => ({
                        label: agent,
                        count: Number(playerAgentStats.games),
                    })
                ),
        })
    );

    return (
        <Dashboard direction="column">
            <Caption
                title="Map Counter"
                description="Lobby map pick frequency"
                height="10%"
            />
            <StratifiedPieGraph
                data={data}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </Dashboard>
    );
};
