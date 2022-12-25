import * as React from "react";

import { MAP_COLORS, PLAYERS, PLAYER_COLORS } from "config";

import { luminance } from "helpers";

import BarGraph from "components/BarGraph";
import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import LineGraph from "components/LineGraph";
import PieGraph from "components/PieGraph";
import PlayerSelector from "components/PlayerSelector";

import matchupJson from "data/easiest-matchups.json";
import individualJson from "data/individual.json";
import mapsJson from "data/maps.json";
import runningWinrateOverTimeJson from "data/running-winrate-over-time.json";
import teammateSynergyJson from "data/teammate-synergy.json";

import style from "./Main.module.css";

const individualData: Record<string, any> = individualJson;
const runningWinrateOverTimeData: Record<string, any>[] =
    runningWinrateOverTimeJson;
const teammateSynergyData: Record<string, Record<string, any>[]> =
    teammateSynergyJson;
const matchupData: Record<string, Record<string, any>[]> = matchupJson;
const mapsData: Record<string, number> = mapsJson;

export const Main = (props: any) => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);

    return (
        <div className={style.Main}>
            <div className={style.IndividualStats}>
                <Dashboard id={style.RunningWinrateOverTime} direction="row">
                    <Caption
                        title="Win Rate Over Time"
                        description="Individiual performance since October 2022"
                        width="25%"
                    />
                    <LineGraph
                        data={runningWinrateOverTimeData
                            .map(d => ({
                                date: new Date(d.block_end_time),
                                value: d.data[currentPlayer].winrate || 0,
                            }))
                            .filter(d => d.date >= new Date("2022-10-16"))}
                        color={PLAYER_COLORS[currentPlayer]}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                        initialDrawDuration={1000}
                        transitionDuration={1000}
                    />
                </Dashboard>
                <Dashboard id={style.TeammateSynergy} direction="column">
                    <Caption
                        title="Teammate Synergy"
                        description="Win rate with player on same team"
                        height="15%"
                    />
                    <BarGraph
                        data={teammateSynergyData[currentPlayer]
                            .map(d => ({
                                label: d.teammate_name,
                                color: PLAYER_COLORS[currentPlayer],
                                textColor:
                                    luminance(PLAYER_COLORS[currentPlayer]) >
                                    128
                                        ? "#000000"
                                        : "#ffffff",
                                value: d.winrate || 0,
                            }))
                            .filter(d => d.label !== currentPlayer)
                            .sort((a, b) => a.value - b.value)}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                        initialDrawDuration={1000}
                        transitionDuration={1000}
                    />
                </Dashboard>
                <Dashboard id={style.Matchups} direction="column">
                    <Caption
                        title="Matchups"
                        description="Win rate against player on opposing team"
                        height="15%"
                    />
                    <BarGraph
                        data={matchupData[currentPlayer]
                            .map(d => ({
                                label: d.opponent_name,
                                color: PLAYER_COLORS[currentPlayer],
                                textColor:
                                    luminance(PLAYER_COLORS[currentPlayer]) >
                                    128
                                        ? "#000000"
                                        : "#ffffff",
                                value: d.winrate || 0,
                            }))
                            .filter(d => d.label !== currentPlayer)
                            .sort((a, b) => b.value - a.value)}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                        initialDrawDuration={1000}
                        transitionDuration={1000}
                    />
                </Dashboard>
            </div>
            <div className={style.LobbyStats}>
                <Dashboard id={style.LobbyWinRates} direction="column">
                    <Caption
                        title="Lobby Win Rates"
                        description="Lifetime performances"
                        height="15%"
                    />
                    <BarGraph
                        data={Object.entries(individualData)
                            .map(([name, playerStats]) => ({
                                label: name,
                                color: PLAYER_COLORS[name],
                                value: playerStats.winrate || 0,
                            }))
                            .sort((a, b) => a.value - b.value)}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                        initialDrawDuration={1000}
                        transitionDuration={1000}
                    />
                </Dashboard>
                <Dashboard id={style.MapCounter} direction="row">
                    <Caption
                        title="Map Counter"
                        description="Lobby map pick frequency"
                        width="15%"
                    />
                    <PieGraph
                        data={Object.entries(mapsData).map(([map, count]) => ({
                            label: map,
                            color: MAP_COLORS[map],
                            count: Number(count),
                        }))}
                        margin={{
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 30,
                        }}
                        initialDrawDuration={1000}
                        transitionDuration={1000}
                    />
                </Dashboard>
            </div>
            <PlayerSelector setCurrentPlayer={setCurrentPlayer} />
        </div>
    );
};
