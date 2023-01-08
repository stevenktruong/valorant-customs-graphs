import * as React from "react";

import { PLAYERS, PLAYER_COLORS } from "config";

import { luminance } from "helpers";

import Caption from "components/Caption";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";

import style from "./MatchupsDashboard.module.scss";

interface Props {
    player: string;
    matchupsData: Record<string, Record<string, any>[]>;
}

export const MatchupsDashboard = (props: Props) => {
    return (
        <div className={style.MatchupsDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Matchups"
                    description="Win rate against player on opposing team"
                />
            </div>
            <HorizontalBarGraph
                data={props.matchupsData[props.player]
                    .map(d => ({
                        label: d.opponent_name,
                        color: PLAYER_COLORS[props.player],
                        textColor:
                            luminance(PLAYER_COLORS[props.player]) > 128
                                ? "#000000"
                                : "#ffffff",
                        value: d.winrate || 0,
                    }))
                    .filter(d => d.label !== props.player)
                    .sort((a, b) => b.value - a.value)}
                initialDrawDuration={1000}
                transitionDuration={1000}
                labels={PLAYERS}
            />
        </div>
    );
};
