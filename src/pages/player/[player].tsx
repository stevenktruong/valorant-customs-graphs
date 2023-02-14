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
import { PLAYERS, Player } from "config";

import style from "./[player].module.scss";

interface Props {
    assistsGivenJson: Record<Player, any>;
    assistsReceivedJson: Record<Player, any>;
    matchupsJson: Record<Player, any>;
    individualJson: Record<Player, any>;
    mapsJson: Record<string, any>;
    metaJson: Record<string, any>;
    recentLobbyWinRatesJson: Record<Player, any>;
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

export default _Player;
