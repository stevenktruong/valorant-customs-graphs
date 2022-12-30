import * as React from "react";

import { PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";

import style from "./LobbyWinRateDashboard.module.scss";

interface Props {
    individualData: Record<string, any>;
}

export const LobbyWinRateDashboard = (props: Props) => {
    return (
        <Dashboard direction="column">
            <Caption
                title="Lobby Win Rates"
                description="Lifetime performances"
                height="15%"
            />
            <HorizontalBarGraph
                data={Object.entries(props.individualData)
                    .map(([name, playerStats]) => ({
                        label: name,
                        color: PLAYER_COLORS[name],
                        value: playerStats.winrate || 0,
                    }))
                    .sort((a, b) => a.value - b.value)}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </Dashboard>
    );
};
