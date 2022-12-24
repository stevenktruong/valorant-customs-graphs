import * as React from "react";
import LineGraph from "components/LineGraph";
import runningWinrateOverTimeJson from "data/running-winrate-over-time.json";
import individualJson from "data/individual.json";
import { PLAYERS, PLAYER_COLORS } from "config";
import PlayerSelector from "components/PlayerSelector";
import style from "./Main.module.css";
import BarGraph from "components/BarGraph";

const runningWinrateOverTimeData: Record<string, any>[] =
    runningWinrateOverTimeJson;
const individualData: Record<string, any> = individualJson;

export const Main = (props: any) => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);

    return (
        <div className={style.Main}>
            <LineGraph
                id={style.RunningWinrateOverTime}
                title="Win Rate Over Time"
                description="Individiual performance since October 2022"
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
            />
            <BarGraph
                id={style.LobbyWinRates}
                title="Lobby Win Rates"
                description="Lifetime performances"
                data={Object.entries(individualData)
                    .map(([name, playerStats]) => ({
                        label: name,
                        color: PLAYER_COLORS[name],
                        value: playerStats.winrate || 0,
                    }))
                    .sort((a, b) => a.value - b.value)}
                margin={{
                    top: 0,
                    right: 30,
                    bottom: 30,
                    left: 30,
                }}
            />
            <PlayerSelector setCurrentPlayer={setCurrentPlayer} />
        </div>
    );
};
