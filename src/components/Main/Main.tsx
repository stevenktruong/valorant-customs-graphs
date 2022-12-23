import * as React from "react";
import "./Main.css";
import LineGraph from "components/LineGraph";
import runningWinrateOverTimeData from "data/running-winrate-over-time.json";
import { PLAYERS } from "config";
import PlayerSelector from "components/PlayerSelector";

export const Main = (props: any) => {
    const [currentPlayer, setCurrentPlayer] = React.useState(PLAYERS[0]);

    return (
        <div>
            <LineGraph
                id="bruh"
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
