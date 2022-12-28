import * as React from "react";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import Leaderboard from "components/Leaderboard";

import individualJson from "data/individual.json";

import { ReactComponent as ControllerIcon } from "assets/agent-classes/controller.svg";
import { ReactComponent as DuelistIcon } from "assets/agent-classes/duelist.svg";
import { ReactComponent as InitiatorIcon } from "assets/agent-classes/initiator.svg";
import { ReactComponent as SentinelIcon } from "assets/agent-classes/sentinel.svg";

import style from "./RoleLeaderboard.module.scss";

const individualData: Record<string, any> = individualJson;

interface Props {
    id?: string;
}

export const RoleLeaderboard = (props: Props) => (
    <Dashboard
        className={`${style.RoleLeaderboard} dashboard`}
        id={props.id}
        direction="row"
    >
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
                    data={Object.entries(individualData)
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
