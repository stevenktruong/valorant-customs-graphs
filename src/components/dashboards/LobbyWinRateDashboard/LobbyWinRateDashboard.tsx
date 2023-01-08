import * as React from "react";

import { PLAYERS, PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";

import style from "./LobbyWinRateDashboard.module.scss";

interface Props {
    recentLobbyWinRates: Record<string, any>;
}

export const LobbyWinRateDashboard = (props: Props) => {
    return (
        <div className={style.LobbyWinRateDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Lobby Win Rates"
                    description="Performance over the last 90 days"
                />
            </div>
            <HorizontalBarGraph
                data={Object.entries(props.recentLobbyWinRates)
                    .map(([name, playerStats]) => ({
                        label: name,
                        color: PLAYER_COLORS[name],
                        value: playerStats.winrate || 0,
                    }))
                    .sort((a, b) => a.value - b.value)}
                initialDrawDuration={1000}
                transitionDuration={1000}
                labels={PLAYERS}
            />
        </div>
    );
};
