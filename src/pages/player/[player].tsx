import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import * as React from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import { ParsedUrlQuery } from "querystring";

import Navbar from "components/Navbar";
import PlayerSelector from "components/PlayerSelector";
import PlayerSummary from "components/PlayerSummary";
import AgentCountDashboard from "components/dashboards/AgentCountDashboard";
import LobbyWinRateDashboard from "components/dashboards/LobbyWinRateDashboard";
import MapCountDashboard from "components/dashboards/MapCountDashboard";
import MapPerformanceDashboard from "components/dashboards/MapPerformanceDashboard";
import MatchupsDashboard from "components/dashboards/MatchupsDashboard";
import RoleLeaderboardDashboard from "components/dashboards/RoleLeaderboardDashboard";
import SupportSynergyDashboard from "components/dashboards/SupportSynergyDashboard";
import TeammatesSynergyDashboard from "components/dashboards/TeammatesSynergyDashboard";
import WinRateOverTimeDashboard from "components/dashboards/WinRateOverTimeDashboard";
import { PLAYERS, Player, ValorantMap } from "config";
import { GetDashboardAPIResponse } from "models/Dashboard";
import { isGetDashboardAPIResponse } from "models/Dashboard";

import style from "./[player].module.scss";

interface Props {
    assistsGivenJson: Record<Player, any>;
    assistsReceivedJson: Record<Player, any>;
    matchupsJson: Record<Player, any>;
    individualJson: Record<Player, any>;
    mapsJson: Record<ValorantMap, any>;
    metaJson: Record<string, any>;
    winrateOverTimeJson: Record<Player, any>[];
    teammatesSynergyJson: Record<Player, any>;
}

interface Params extends ParsedUrlQuery {
    player: Player;
}

const _Player = (props: Props) => {
    const {
        assistsGivenJson,
        assistsReceivedJson,
        matchupsJson,
        individualJson,
        mapsJson,
        metaJson,
        winrateOverTimeJson,
        teammatesSynergyJson,
    } = props;

    const router = useRouter();
    let { player } = router.query as Params;

    if (!PLAYERS.includes(player) || !player) {
        player = PLAYERS[0];
    }

    const [currentPlayer, setCurrentPlayer] = React.useState(player);
    const playerSummaryContainerRef = React.useRef(null);

    return (
        <div className={style.Player}>
            <div className={style.Header}>
                <div className={style.TextContainer}>
                    <h1>VALORANT Customs</h1>
                    <p>Statistics tracking of DARWIN Discord custom games</p>
                </div>
                <div className={style.SelectorContainer}>
                    <h2>Player:</h2>
                    <PlayerSelector
                        id={style.Selector}
                        currentPlayer={currentPlayer}
                        setCurrentPlayer={(player: Player) => {
                            setCurrentPlayer(player);
                            router.push(
                                { pathname: `/player/${player}` },
                                undefined,
                                { shallow: true }
                            );
                        }}
                        names={PLAYERS}
                    />
                </div>
                {/* <Navbar /> */}
            </div>
            <div className={style.Main}>
                <div className={style.Left}>
                    <SwitchTransition>
                        <CSSTransition
                            key={currentPlayer}
                            nodeRef={playerSummaryContainerRef}
                            timeout={500}
                            classNames={{
                                enter: style.playerSummaryContainerRef,
                                enterActive: style.playerSummaryContainerRef,
                                exit: style.playerSummaryContainerRef,
                                exitActive: style.playerSummaryContainerRef,
                            }}
                        >
                            <div
                                ref={playerSummaryContainerRef}
                                className={style.PlayerSummaryContainer}
                            >
                                <PlayerSummary
                                    player={currentPlayer}
                                    individualData={individualJson}
                                />
                            </div>
                        </CSSTransition>
                    </SwitchTransition>
                </div>
                <div className={style.Right}>
                    <div className={style.Stats}>
                        <MapPerformanceDashboard
                            player={currentPlayer}
                            individualData={individualJson}
                            className={style.MapPerformanceDashboard}
                        />
                        <MapCountDashboard
                            mapsData={mapsJson}
                            className={style.MapCountDashboard}
                        />
                        <WinRateOverTimeDashboard
                            player={currentPlayer}
                            winrateOverTimeData={winrateOverTimeJson}
                            className={style.WinRateOverTimeDashboard}
                        />
                        <TeammatesSynergyDashboard
                            player={currentPlayer}
                            teammatesSynergyData={teammatesSynergyJson}
                            className={style.TeammateSynergyDashboard}
                        />
                        <MatchupsDashboard
                            player={currentPlayer}
                            matchupsData={matchupsJson}
                            className={style.MatchupsDashboard}
                        />
                        <AgentCountDashboard
                            player={currentPlayer}
                            individualData={individualJson}
                            className={style.AgentCountDashboard}
                        />
                        <SupportSynergyDashboard
                            player={currentPlayer}
                            individualData={individualJson}
                            assistsReceivedData={assistsReceivedJson}
                            assistsGivenData={assistsGivenJson}
                            nBars={10}
                            className={style.SupportSynergyDashboard}
                        />
                    </div>
                    <div className={style.FooterContainer}>
                        <div className={style.Footer}>
                            <p>
                                Starting from 10/12/2022. Last updated:{" "}
                                {new Date().toLocaleDateString()} (
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

export const getStaticPaths: GetStaticPaths<Params> = async () => {
    return {
        paths: PLAYERS.map(player => ({
            params: { player },
        })),
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
    // if (!process.env.BACKEND_URL) {
    //     throw new Error("Missing BACKEND_URL environment variable");
    // }

    // const res = await fetch(`${process.env.BACKEND_URL}/api/dashboard`);
    // const dashboardJson = await res.json();
    // if (!isGetDashboardAPIResponse(data)) {
    //     throw new Error("/dashboards API did not return the expected data");
    // }

    const dashboardJson = require("data/dashboard.json");

    const {
        assists_given_per_standard_game: assistsGivenJson,
        assists_received_per_standard_game: assistsReceivedJson,
        easiest_matchups: matchupsJson,
        individual: individualJson,
        maps: mapsJson,
        meta: metaJson,
        running_winrate_over_time: winrateOverTimeJson,
        teammate_synergy: teammatesSynergyJson,
    } = dashboardJson;

    return {
        props: {
            assistsGivenJson,
            assistsReceivedJson,
            matchupsJson,
            individualJson,
            mapsJson,
            metaJson,
            winrateOverTimeJson,
            teammatesSynergyJson,
        },
    };
};

export default _Player;
