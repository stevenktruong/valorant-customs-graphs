import * as React from "react";

import Caption from "components/Caption";
import LineGraph from "components/graphs/LineGraph";
import { PLAYER_COLORS, Player } from "config";
import { useWindowDimensions } from "helpers";

import style from "./WinRateOverTimeDashboard.module.scss";

interface Props {
    player: Player;
    winrateOverTimeData: Record<string, any>[];

    className?: string;
}

export const WinRateOverTimeDashboard = (props: Props) => {
    const { width } = useWindowDimensions();
    const showFewerPoints: boolean = width && width <= 500 ? true : false;

    const data = props.winrateOverTimeData
        .map(d => ({
            date: new Date(d.block_end_time),
            value: d.data[props.player].winrate || 0,
        }))
        .slice(-((showFewerPoints ? 8 : 12) + 1)); // 8 or 12 weeks + today

    return (
        <div className={`${style.WinRateOverTimeDashboard} ${props.className}`}>
            <Caption
                title="Win Rate Over Time"
                description="Individual performance over a 90-day moving average"
            />
            <LineGraph
                data={data}
                color={PLAYER_COLORS[props.player][0]}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </div>
    );
};
