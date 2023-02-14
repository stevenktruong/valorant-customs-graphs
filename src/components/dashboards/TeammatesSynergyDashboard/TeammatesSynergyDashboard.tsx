import * as React from "react";

import Caption from "components/Caption";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";
import { PLAYERS, PLAYER_COLORS, Player } from "config";
import { luminance } from "helpers";

import style from "./TeammatesSynergyDashboard.module.scss";

interface Props {
    player: Player;
    teammatesSynergyData: Record<string, Record<string, any>[]>;

    className?: string;
}

export const TeammatesSynergyDashboard = (props: Props) => {
    return (
        <div
            className={`${style.TeammatesSynergyDashboard} ${props.className}`}
        >
            <Caption
                title="Teammate Synergy"
                description="Win rate with player on same team"
            />
            <HorizontalBarGraph
                data={props.teammatesSynergyData[props.player]
                    .map(d => ({
                        label: d.teammate_name,
                        color: PLAYER_COLORS[props.player],
                        textColor:
                            luminance(PLAYER_COLORS[props.player]) > 128
                                ? "#000000"
                                : "#ffffff",
                        value: d.winrate || 0,
                    }))
                    .filter(d => d.label !== props.player)
                    .sort((a, b) => a.value - b.value)}
                initialDrawDuration={1000}
                transitionDuration={1000}
                labels={PLAYERS}
                percentage={true}
                ticks={[0, 50, 100]}
            />
        </div>
    );
};
