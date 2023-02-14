import * as React from "react";

import Caption from "components/Caption";
import PieGraph from "components/graphs/PieGraph";
import { MAP_COLORS, ValorantMap } from "config";

import style from "./MapCountDashboard.module.scss";

interface Props {
    mapsData: Record<ValorantMap, number>;

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
                data={Object.entries(props.mapsData).map(
                    ([map, count]: [ValorantMap, number]) => ({
                        label: map,
                        color: MAP_COLORS[map],
                        count: Number(count),
                    })
                )}
                initialDrawDuration={1000}
                transitionDuration={1000}
            />
        </div>
    );
};
