import * as React from "react";

import { MAP_COLORS } from "config";

import Caption from "components/Caption";
import PieGraph from "components/graphs/PieGraph";

import style from "./MapCountDashboard.module.scss";

interface Props {
    mapsData: Record<string, number>;

    className?: string;
}

export const MapCountDashboard = (props: Props) => {
    return (
        <div className={`${style.MapCountDashboard} ${props.className}`}>
            <Caption
                title="Map Counter"
                description="Lobby map pick frequency"
            />
            <PieGraph
                data={Object.entries(props.mapsData).map(([map, count]) => ({
                    label: map,
                    color: MAP_COLORS[map],
                    count: Number(count),
                }))}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </div>
    );
};
