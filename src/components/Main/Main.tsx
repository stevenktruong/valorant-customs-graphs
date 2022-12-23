import * as React from "react";
import LineGraph from "components/LineGraph";
import runningWinrateOverTimeData from "data/running-winrate-over-time.json";
import { PLAYERS } from "config";
import PlayerSelector from "components/PlayerSelector";
import style from "./Main.module.css";

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
                        data: d.data,
                    }))
                    .filter(d => d.date >= new Date("2022-10-16"))}
                player={currentPlayer}
                margin={{
                    top: 30,
                    right: 30,
                    bottom: 30,
                    left: 30,
                }}
            />
            <PlayerSelector setCurrentPlayer={setCurrentPlayer} />
        </div>
    );
};
