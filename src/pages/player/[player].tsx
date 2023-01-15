import * as React from "react";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import { PLAYERS } from "config";

import Navbar from "components/Navbar";
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

import style from "./[player].module.scss";
import { ParsedUrlQuery } from "querystring";
import PlayerSelector from "components/PlayerSelector";
import { useWindowDimensions } from "helpers";

interface Props {
    assistsGivenJson: Record<string, any>;
    assistsReceivedJson: Record<string, any>;
    matchupsJson: Record<string, any>;
    individualJson: Record<string, any>;
    mapsJson: Record<string, any>;
    metaJson: Record<string, any>;
    recentLobbyWinRatesJson: Record<string, any>;
    winrateOverTimeJson: Record<string, any>[];
    teammatesSynergyJson: Record<string, any>;
}

interface Params extends ParsedUrlQuery {
    player: string;
}

const Player = (props: Props) => {
    const {
        assistsGivenJson,
        assistsReceivedJson,
        matchupsJson,
        individualJson,
        mapsJson,
        metaJson,
        recentLobbyWinRatesJson,
        winrateOverTimeJson,
        teammatesSynergyJson,
    } = props;

    const router = useRouter();
    let { player } = router.query as Params;

    if (!PLAYERS.includes(player) || !player) {
        player = PLAYERS[0];
    }

    const [currentPlayer, setCurrentPlayer] = React.useState(player);
    const playerCardContainerRef = React.useRef(null);

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
                        setCurrentPlayer={(player: string) => {
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
                            nodeRef={playerCardContainerRef}
                            timeout={500}
                            classNames={{
                                enter: style.PlayerCardContainerEnter,
                                enterActive:
                                    style.PlayerCardContainerEnterActive,
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
                    <div className={style.Stats}>
                        <div className={style.LobbyWinRateDashboardContainer}>
                            <LobbyWinRateDashboard
                                recentLobbyWinRates={recentLobbyWinRatesJson}
                            />
                        </div>
                        <div className={style.MapCountDashboardContainer}>
                            <MapCountDashboard mapsData={mapsJson} />
                        </div>
                        <div
                            className={style.WinRateOverTimeDashboardContainer}
                        >
                            <WinRateOverTimeDashboard
                                player={currentPlayer}
                                winrateOverTimeData={winrateOverTimeJson}
                            />
                        </div>
                        <div
                            className={style.TeammateSynergyDashboardContainer}
                        >
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
                        <div
                            className={style.RoleLeaderboardDashboardContainer}
                        >
                            <RoleLeaderboardDashboard
                                player={currentPlayer}
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
                                individualData={individualJson}
                                assistsReceivedData={assistsReceivedJson}
                                assistsGivenData={assistsGivenJson}
                                nBars={7}
                            />
                        </div>
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
    return {
        props: {
            assistsGivenJson: require("data/assists-given-per-standard-game.json"),
            assistsReceivedJson: require("data/assists-received-per-standard-game.json"),
            matchupsJson: require("data/easiest-matchups.json"),
            individualJson: require("data/individual.json"),
            mapsJson: require("data/maps.json"),
            metaJson: require("data/meta.json"),
            recentLobbyWinRatesJson: require("data/recent-lobby-win-rates.json"),
            winrateOverTimeJson: require("data/running-winrate-over-time.json"),
            teammatesSynergyJson: require("data/teammate-synergy.json"),
        },
    };
};

export default Player;
