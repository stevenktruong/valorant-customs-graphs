import * as React from "react";

import Caption from "components/Caption";
import HorizontalBarGraph from "components/graphs/HorizontalBarGraph";
import { PLAYERS, PLAYER_COLORS, Player } from "config";

import style from "./LobbyWinRateDashboard.module.scss";

interface Props {
    recentLobbyWinRates: Record<Player, any>;

    className?: string;
}

export const LobbyWinRateDashboard = (props: Props) => {
    return (
        <div className={`${style.LobbyWinRateDashboard} ${props.className}`}>
            <Caption
                title="Lobby Win Rates"
                description="Performance over the last 90 days"
            />
            <HorizontalBarGraph
                data={Object.entries(props.recentLobbyWinRates)
                    .map(([name, playerStats]: [Player, any]) => ({
                        label: name,
                        color: PLAYER_COLORS[name][0],
                        value: playerStats.winrate || 0,
                    }))
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
