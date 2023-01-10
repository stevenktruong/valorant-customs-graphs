import * as React from "react";

import { PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import Leaderboard from "components/graphs/Leaderboard";

import {
    ControllerIcon,
    DuelistIcon,
    InitiatorIcon,
    SentinelIcon,
} from "./Icons";

import style from "./RoleLeaderboardDashboard.module.scss";

interface Props {
    player: string;
    individualData: Record<string, any>;
}

export const RoleLeaderboardDashboard = (props: Props) => (
    <div className={style.RoleLeaderboardDashboard}>
        <div className={style.CaptionContainer}>
            <Caption
                title="Top Performers by Role"
                description="Ranked by win rate, requiring a minimum 25% play rate for consideration"
            />
        </div>
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
                        <d.Icon fill={PLAYER_COLORS[props.player]} />
                    </div>
                    <Leaderboard
                        data={Object.entries(props.individualData)
                            .filter(
                                ([name, playerStats]) =>
                                    playerStats.games &&
                                    playerStats.roles[d.role].games /
                                        playerStats.games >
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
