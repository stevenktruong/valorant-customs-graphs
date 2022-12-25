import * as React from "react";

import { PLAYERS, PLAYER_COLORS } from "config";

import BarGraph from "components/BarGraph";
import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import LineGraph from "components/LineGraph";
import PlayerSelector from "components/PlayerSelector";

import individualJson from "data/individual.json";
import runningWinrateOverTimeJson from "data/running-winrate-over-time.json";

import style from "./Main.module.css";

const runningWinrateOverTimeData: Record<string, any>[] =
    runningWinrateOverTimeJson;
const individualData: Record<string, any> = individualJson;

export const Main = (props: any) => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);

    return (
        <div className={style.Main}>
            <Dashboard id={style.RunningWinrateOverTime} direction="row">
                <Caption
                    title="Win Rate Over Time"
                    description="Individiual performance since October 2022"
                    width="25%"
                />
                <LineGraph
                    data={runningWinrateOverTimeData
                        .map((d) => ({
                            date: new Date(d.block_end_time),
                            value: d.data[currentPlayer].winrate || 0,
                        }))
                        .filter((d) => d.date >= new Date("2022-10-16"))}
                    color={PLAYER_COLORS[currentPlayer]}
                    margin={{
                        top: 30,
                        right: 30,
                        bottom: 30,
                        left: 30,
                    }}
                />
            </Dashboard>
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
                />
            </Dashboard>
            <PlayerSelector setCurrentPlayer={setCurrentPlayer} />
        </div>
    );
};
