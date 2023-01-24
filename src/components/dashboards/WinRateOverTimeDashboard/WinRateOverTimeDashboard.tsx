import * as React from "react";

import { PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import LineGraph from "components/graphs/LineGraph";

import style from "./WinRateOverTimeDashboard.module.scss";

interface Props {
    player: string;
    winrateOverTimeData: Record<string, any>[];

    className?: string;
}

export const WinRateOverTimeDashboard = (props: Props) => {
    const data = props.winrateOverTimeData
        .map(d => ({
            date: new Date(d.block_end_time),
            value: d.data[props.player].winrate || 0,
        }))
        .filter(d => d.date >= new Date("2022-10-16"));

    // If the last two data points correspond to the same day, remove one of them
    if (
        data[data.length - 1].date.getDay() ===
        data[data.length - 2].date.getDay()
    ) {
        data.splice(-2, 1);
    }
    return (
        <div className={`${style.WinRateOverTimeDashboard} ${props.className}`}>
            <Caption
                title="Win Rate Over Time"
                description="Individual performance over a 90-day moving average"
            />
            <LineGraph
                data={data}
                color={PLAYER_COLORS[props.player]}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </div>
    );
};
