import * as React from "react";

import { PLAYER_COLORS } from "config";

import Caption from "components/Caption";
import LeftRightBarGraph from "components/graphs/LeftRightBarGraph";

import style from "./AssistsDashboard.module.scss";

interface Props {
    player: string;
    assistsGivenData: Record<string, any>;
    assistsReceivedData: Record<string, any>;
}

export const AssistsDashboard = (props: Props) => {
    const [currentSortSide, setSortSide] = React.useState("left");

    const data: {
        label: any;
        leftValue: any;
        rightValue: any;
        color: string;
        order: number;
    }[] = [];

    props.assistsReceivedData[props.player].forEach(
        (assistsReceivedData: Record<string, any>, i: number) => {
            if (assistsReceivedData.assistant_name === props.player) return;
            data.push({
                label: assistsReceivedData.assistant_name,
                leftValue: Number(
                    assistsReceivedData.assists_per_standard_game
                ),
                rightValue: Number(
                    props.assistsGivenData[props.player][i]
                        .assists_per_standard_game
                ),
                color: PLAYER_COLORS[assistsReceivedData.assistant_name],
                order: 0,
            });
        }
    );

    if (currentSortSide === "left")
        data.sort((a, b) => a.leftValue - b.leftValue);
    else data.sort((a, b) => a.rightValue - b.rightValue);
    data.forEach((d, i) => (d.order = i));

    return (
        <div className={style.AssistsDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Support Synergy"
                    description="Highest average assists from and for teammates per 25-round game"
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
                    data={data.slice(-7)}
                    highlightedSide={currentSortSide}
                    initialDrawDuration={1000}
                    transitionDuration={1000}
                />
            </div>
        </div>
    );
};
