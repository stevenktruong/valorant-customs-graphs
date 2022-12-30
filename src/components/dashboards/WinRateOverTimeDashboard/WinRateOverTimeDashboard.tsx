import * as React from "react";

import { PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import LineGraph from "components/graphs/LineGraph";

import style from "./WinRateOverTimeDashboard.module.scss";

interface Props {
    player: string;
    winrateOverTimeData: Record<string, any>[];
}

export const WinRateOverTimeDashboard = (props: Props) => {
    return (
        <Dashboard direction="column">
            <Caption
                title="Win Rate Over Time"
                description="Individiual performance since October 2022"
                height="20%"
            />
            <LineGraph
                data={props.winrateOverTimeData
                    .map(d => ({
                        date: new Date(d.block_end_time),
                        value: d.data[props.player].winrate || 0,
                    }))
                    .filter(d => d.date >= new Date("2022-10-16"))}
                color={PLAYER_COLORS[props.player]}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </Dashboard>
    );
};
