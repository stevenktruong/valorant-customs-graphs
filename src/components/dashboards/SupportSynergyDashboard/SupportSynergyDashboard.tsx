import * as React from "react";

import { PLAYERS, PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import LeftRightBarGraph from "components/graphs/LeftRightBarGraph";

import style from "./SupportSynergyDashboard.module.scss";

interface Props {
    player: string;
    individualData: Record<string, any>;
    assistsReceivedData: Record<string, any>;
    assistsGivenData: Record<string, any>;
    nBars: number;
}

export const SupportSynergyDashboard = (props: Props) => {
    const [currentSortSide, setSortSide] = React.useState("left");

    const data: {
        label?: string;
        leftValue: any;
        rightValue: any;
        color: string;
        order: number;
    }[] = [];

    PLAYERS.filter((playerName, i) => {
        if (props.individualData[props.player].games < 20) return true;

        // For players with enough games, filter out players with too few rounds
        return (
            props.assistsReceivedData[props.player][i].rounds >= 100 &&
            props.assistsGivenData[props.player][i].rounds >= 100
        );
    }).forEach((playerName, i) => {
        if (
            props.assistsReceivedData[props.player][i].assistant_name ===
            props.player
        )
            return;
        data.push({
            label: props.assistsReceivedData[props.player][i].assistant_name,
            leftValue: Number(
                props.assistsReceivedData[props.player][i]
                    .assists_per_standard_game
            ),
            rightValue: Number(
                props.assistsGivenData[props.player][i]
                    .assists_per_standard_game
            ),
            color: PLAYER_COLORS[
                props.assistsReceivedData[props.player][i].assistant_name
            ],
            order: 0,
        });
    });

    if (currentSortSide === "left")
        data.sort((a, b) => a.leftValue - b.leftValue);
    else data.sort((a, b) => a.rightValue - b.rightValue);

    // Add filler values to get a total of nBars bars
    for (let i = data.length; i < props.nBars; i++) {
        data.unshift({
            label: undefined,
            leftValue: 0,
            rightValue: 0,
            color: "",
            order: 0,
        });
    }

    data.forEach((d, i) => (d.order = data.length - i));

    return (
        <div className={style.SupportSynergyDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Support Synergy"
                    description="Highest average assists from and for teammates per standard game"
                />
            </div>
            <div className={style.GraphAndSwitcherContainer}>
                <div className={style.SwitcherContainer}>
                    <button
                        className={
                            currentSortSide === "left"
                                ? style.ActiveButton
                                : style.InactiveButton
                        }
                        onClick={() => setSortSide("left")}
                    >
                        ASSISTS FROM
                    </button>
                    <button
                        className={
                            currentSortSide === "right"
                                ? style.ActiveButton
                                : style.InactiveButton
                        }
                        onClick={() => setSortSide("right")}
                    >
                        ASSISTS FOR
                    </button>
                </div>
                <LeftRightBarGraph
                    data={data.slice(-props.nBars)}
                    highlightedSide={currentSortSide}
                    initialDrawDuration={1000}
                    transitionDuration={1000}
                />
            </div>
        </div>
    );
};
