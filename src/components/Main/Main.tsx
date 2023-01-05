import * as React from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import { PLAYERS } from "config";

import Header from "components/Header";
import PlayerCard from "components/PlayerCard";
import AgentCountDashboard from "components/dashboards/AgentCountDashboard";
import LobbyWinRateDashboard from "components/dashboards/LobbyWinRateDashboard";
import MapCountDashboard from "components/dashboards/MapCountDashboard";
import MapPerformanceDashboard from "components/dashboards/MapPerformanceDashboard";
import MatchupsDashboard from "components/dashboards/MatchupsDashboard";
import RoleLeaderboardDashboard from "components/dashboards/RoleLeaderboardDashboard";
import SupportSynergyDashboard from "components/dashboards/SupportSynergyDashboard";
import TeammatesSynergyDashboard from "components/dashboards/TeammatesSynergyDashboard";
import WinRateOverTimeDashboard from "components/dashboards/WinRateOverTimeDashboard";

import assistsGivenJson from "data/assists-given-per-standard-game.json";
import assistsReceivedJson from "data/assists-received-per-standard-game.json";
import matchupsJson from "data/easiest-matchups.json";
import individualJson from "data/individual.json";
import mapsJson from "data/maps.json";
import metaJson from "data/meta.json";
import winrateOverTimeJson from "data/running-winrate-over-time.json";
import teammatesSynergyJson from "data/teammate-synergy.json";

import style from "./Main.module.scss";

export const Main = () => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);
    const playerCardContainerRef = React.useRef(null);

    return (
        <div className={style.Main}>
            <div className={style.Left}>
                <SwitchTransition>
                    <CSSTransition
                        key={currentPlayer}
                        nodeRef={playerCardContainerRef}
                        timeout={500}
                        classNames={{
                            enter: style.PlayerCardContainerEnter,
                            enterActive: style.PlayerCardContainerEnterActive,
                            exit: style.PlayerCardContainerExit,
                            exitActive: style.PlayerCardContainerExitActive,
                        }}
                    >
                        <div
                            ref={playerCardContainerRef}
                            className={style.PlayerCardContainer}
                        >
                            <PlayerCard
                                player={currentPlayer}
                                individualData={individualJson}
                            />
                        </div>
                    </CSSTransition>
                </SwitchTransition>
            </div>
            <div className={style.Right}>
                <div className={style.HeaderContainer}>
                    <Header
                        title="VALORANT Customs"
                        description="Statistics tracking of DARWIN Discord custom games - starting October 2022"
                        setCurrentPlayer={setCurrentPlayer}
                    />
                </div>
                <div className={style.Stats}>
                    <div className={style.LobbyWinRateDashboardContainer}>
                        <LobbyWinRateDashboard
                            individualData={individualJson}
                        />
                    </div>
                    <div className={style.MapCountDashboardContainer}>
                        <MapCountDashboard mapsData={mapsJson} />
                    </div>
                    <div className={style.WinRateOverTimeDashboardContainer}>
                        <WinRateOverTimeDashboard
                            player={currentPlayer}
                            winrateOverTimeData={winrateOverTimeJson}
                        />
                    </div>
                    <div className={style.TeammateSynergyDashboardContainer}>
                        <TeammatesSynergyDashboard
                            player={currentPlayer}
                            teammatesSynergyData={teammatesSynergyJson}
                        />
                    </div>
                    <div className={style.MatchupsDashboardContainer}>
                        <MatchupsDashboard
                            player={currentPlayer}
                            matchupsData={matchupsJson}
                        />
                    </div>
                    <div className={style.RoleLeaderboardDashboardContainer}>
                        <RoleLeaderboardDashboard
                            individualData={individualJson}
                        />
                    </div>
                    <div className={style.AgentCountDashboardContainer}>
                        <AgentCountDashboard
                            player={currentPlayer}
                            individualData={individualJson}
                        />
                    </div>
                    <div className={style.MapPerformanceDashboardContainer}>
                        <MapPerformanceDashboard
                            player={currentPlayer}
                            individualData={individualJson}
                        />
                    </div>
                    <div className={style.SupportSynergyDashboardContainer}>
                        <SupportSynergyDashboard
                            player={currentPlayer}
                            assistsGivenData={assistsGivenJson}
                            assistsReceivedData={assistsReceivedJson}
                        />
                    </div>
                    <div className={style.FooterContainer}>
                        <div className={style.Footer}>
                            <p>
                                Last updated: {new Date().toLocaleDateString()}{" "}
                                (
                                <a
                                    href={
                                        metaJson["most_recent_url"].split(
                                            "?"
                                        )[0]
                                    }
                                >
                                    most recent game included
                                </a>
                                )
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
