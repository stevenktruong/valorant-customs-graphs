import * as React from "react";

import style from "./PlayerSummary.module.scss";

interface Props {
    player: Player;
    individualData: Record<string, any>;
}

export const PlayerSummary = (props: Props) => {
    return (
        <div className={style.PlayerSummary}>
            <div className={style.PlayerContainer}>
                <div className={style.PlayerAvatarContainer}>
                    <img
                        src={`/players/${props.player}.png`}
                        alt={`${props.player} avatar`}
                    />
                    <h1>{props.individualData[props.player].name}</h1>
                </div>
                <div className={style.PlayerDescription}>
                    <div className={style.PlayerDescriptionEntry}>
                        <p>{props.individualData[props.player].valorant_tag}</p>
                        <h2>Valorant Tag</h2>
                    </div>
                    <div className={style.PlayerDescriptionEntry}>
                        <p>
                            {props.individualData[props.player].top_roles.join(
                                "/"
                            )}
                        </p>
                        <h2>Role</h2>
                    </div>
                    <div className={style.PlayerDescriptionEntry}>
                        <p>{props.individualData[props.player].games}</p>
                        <h2>Customs Played</h2>
                    </div>
                    <div className={style.PlayerDescriptionEntry}>
                        {props.individualData[props.player].top_agents.map(
                            (agent: string) => (
                                <img
                                    // KAY/O -> KAYO
                                    src={`/agents/${agent
                                        .split("/")
                                        .join("")}.png`}
                                    alt={`${agent} icon`}
                                    key={agent}
                                />
                            )
                        )}
                        <h2>Top Agents</h2>
                    </div>
                </div>
            </div>
            <div className={style.FullBodyAgentImageContainer}>
                {props.individualData[props.player].top_agents.map(
                    (agent: string) => (
                        <img
                            // KAY/O -> KAYO
                            src={`/agents/full-body/${agent
                                .split("/")
                                .join("")}.png`}
                            alt={`${agent} full body`}
                            key={agent}
                        />
                    )
                )}
            </div>
        </div>
    );
};
