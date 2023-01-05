import * as React from "react";

import { MAP_COLORS } from "config";

import Caption from "components/Caption";
import VerticalBarGraph from "components/graphs/VerticalBarGraph";

import style from "./MapPerformanceDashboard.module.scss";

interface Props {
    player: string;
    individualData: Record<string, any>;
}

export const MapPerformanceDashboard = (props: Props) => {
    return (
        <div className={style.MapPerformanceDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Map Performance"
                    description="Average combat score per map"
                />
            </div>
            <VerticalBarGraph
                data={Object.entries(props.individualData[props.player].maps)
                    .map(
                        ([map, playerMapStats]: [
                            string,
                            Record<string, any>
                        ]) => ({
                            label: map,
                            color: MAP_COLORS[map],
                            value: playerMapStats.acs || 0,
                        })
                    )
                    .sort((a, b) => b.value - a.value)}
                initialDrawDuration={1000}
                transitionDuration={1000}
                percentage={false}
                ticks={[0, 100, 200, 300, 400]}
            />
        </div>
    );
};
