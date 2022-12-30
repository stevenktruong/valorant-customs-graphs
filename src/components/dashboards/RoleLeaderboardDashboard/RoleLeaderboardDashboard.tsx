import * as React from "react";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import Leaderboard from "components/graphs/Leaderboard";

import { ReactComponent as ControllerIcon } from "assets/agent-classes/controller.svg";
import { ReactComponent as DuelistIcon } from "assets/agent-classes/duelist.svg";
import { ReactComponent as InitiatorIcon } from "assets/agent-classes/initiator.svg";
import { ReactComponent as SentinelIcon } from "assets/agent-classes/sentinel.svg";

import style from "./RoleLeaderboardDashboard.module.scss";

interface Props {
    individualData: Record<string, any>;
}

export const RoleLeaderboardDashboard = (props: Props) => (
    <Dashboard direction="row">
        <Caption
            title="Top Performers by Role"
            description="Ranked by win rate, requiring a minimum 25% play rate for consideration"
            width="20%"
        />
        {[
            { role: "Duelist", Icon: DuelistIcon },
            { role: "Initiator", Icon: InitiatorIcon },
            { role: "Controller", Icon: ControllerIcon },
            { role: "Sentinel", Icon: SentinelIcon },
        ].map(d => (
            <div
                className={style.LeaderboardContainer}
                id={style[`Top${d.role}`]}
                key={`${d.role}`}
            >
                <h2>{d.role}s</h2>
                <div className={style.IconContainer}>
                    <d.Icon id="icon" />
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
                            name,
                            winrate: playerStats.roles[d.role].winrate,
                        }))
                        .sort((a, b) => b.winrate - a.winrate)
                        .map(d => d.name)
                        .slice(0, 5)}
                />
            </div>
        ))}
    </Dashboard>
);
