import * as React from "react";

import { MAP_COLORS, PLAYERS, PLAYER_COLORS } from "config";

import { luminance } from "helpers";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import Header from "components/Header";
import PlayerSelector from "components/PlayerSelector";
import AgentCountDashboard from "components/dashboards/AgentCountDashboard";
import LobbyWinRateDashboard from "components/dashboards/LobbyWinRateDashboard";
import MapCountDashboard from "components/dashboards/MapCountDashboard";
import MatchupsDashboard from "components/dashboards/MatchupsDashboard";
import RoleLeaderboardDashboard from "components/dashboards/RoleLeaderboardDashboard";
import TeammatesSynergyDashboard from "components/dashboards/TeammatesSynergyDashboard";
import WinRateOverTimeDashboard from "components/dashboards/WinRateOverTimeDashboard";
import LineGraph from "components/graphs/LineGraph";

import matchupsJson from "data/easiest-matchups.json";
import individualJson from "data/individual.json";
import mapsJson from "data/maps.json";
import rolesJson from "data/roles.json";
import winrateOverTimeJson from "data/running-winrate-over-time.json";
import teammatesSynergyJson from "data/teammate-synergy.json";

import style from "./Main.module.scss";

const rolesData: Record<string, number> = rolesJson;

export const Main = () => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);

    return (
        <div className={style.Main}>
            <div className={style.Left} />
            <div className={style.Right}>
                <div className={style.HeaderContainer}>
                    <Header
                        title="VALORANT Customs"
                        description="Statistics tracking of DARWIN Discord custom games - starting October 2022"
                        setCurrentPlayer={setCurrentPlayer}
                    />
                </div>
                <div className={style.Stats}>
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
                    <div className={style.LobbyWinRateDashboardContainer}>
                        <LobbyWinRateDashboard
                            individualData={individualJson}
                        />
                    </div>
                    <div className={style.MapCountDashboardContainer}>
                        <MapCountDashboard mapsData={mapsJson} />
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
                </div>
            </div>
        </div>
    );
};
