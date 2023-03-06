import * as React from "react";

import {
    ControllerIcon,
    DuelistIcon,
    InitiatorIcon,
    SentinelIcon,
} from "./Icons";

import Caption from "components/Caption";
import Leaderboard from "components/graphs/Leaderboard";
import { PLAYER_COLORS, Player } from "config";

import style from "./RoleLeaderboardDashboard.module.scss";

interface Props {
    player: Player;
    individualData: Record<string, any>;

    className?: string;
}

export const RoleLeaderboardDashboard = (props: Props) => (
    <div className={`${style.RoleLeaderboardDashboard} ${props.className}`}>
        <Caption
            title="Top Performers by Role"
            description="Ranked by win rate, requiring a minimum 25% play rate for consideration"
        />
        <div className={style.LeaderboardContainer}>
            {[
                { role: "Duelist", Icon: DuelistIcon },
                { role: "Initiator", Icon: InitiatorIcon },
                { role: "Controller", Icon: ControllerIcon },
                { role: "Sentinel", Icon: SentinelIcon },
            ].map(d => (
                <div
                    className={style.Leaderboard}
                    id={style[`Top${d.role}`]}
                    key={`${d.role}`}
                >
                    <h2>{d.role}s</h2>
                    <div className={style.IconContainer}>
                        <d.Icon fill={PLAYER_COLORS[props.player][0]} />
                    </div>
                    <Leaderboard
                        data={Object.entries(props.individualData)
                            .filter(
                                ([name, playerStats]) =>
                                    playerStats.games &&
                                    playerStats.roles[d.role].games /
                                        playerStats.games >=
                                        0.25
                            )
                            .map(([name, playerStats]) => ({
                                label: name,
                                score: Number(
                                    playerStats.roles[d.role].winrate
                                ),
                            }))
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)}
                    />
                </div>
            ))}
        </div>
    </div>
);
