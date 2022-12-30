import * as React from "react";

import { MAP_COLORS, PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import PieGraph from "components/graphs/PieGraph";

import style from "./MapCountDashboard.module.scss";

interface Props {
    mapsData: Record<string, number>;
}

export const MapCountDashboard = (props: Props) => {
    return (
        <Dashboard direction="row">
            <Caption
                title="Map Counter"
                description="Lobby map pick frequency"
                width="40%"
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
        </Dashboard>
    );
};
