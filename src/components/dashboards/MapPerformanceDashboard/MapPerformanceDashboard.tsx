import * as React from "react";

import Caption from "components/Caption";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";
import { MAP_COLORS, Player, ValorantMap } from "config";

import style from "./MapPerformanceDashboard.module.scss";

interface Props {
    player: Player;
    individualData: Record<string, any>;

    className?: string;
}

export const MapPerformanceDashboard = (props: Props) => {
    return (
        <div className={`${style.MapPerformanceDashboard} ${props.className}`}>
            <Caption
                title="Map Performance"
                description="Average combat score per map"
            />
            <HorizontalBarGraph
                data={Object.entries(props.individualData[props.player].maps)
                    .map(
                        ([map, playerMapStats]: [
                            ValorantMap,
                            Record<string, any>
                        ]) => ({
                            label: map,
                            color: MAP_COLORS[map],
                            value: playerMapStats.acs || 0,
                        })
                    )
                    .sort((a, b) => a.value - b.value)}
                labels={Object.keys(props.individualData[props.player].maps)}
                initialDrawDuration={1000}
                transitionDuration={1000}
                percentage={false}
                ticks={[0, 100, 200, 300, 400, 500]}
            />
        </div>
    );
};
