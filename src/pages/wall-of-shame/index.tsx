import Navbar from "components/Navbar";
import Leaderboard from "components/wall-of-shame/Leaderboard";
import { GetStaticProps } from "next";
import * as React from "react";

import style from "./index.module.scss";

interface Props {
    wallOfShameJson: Record<string, any>;
}

const topFive = (
    wallOfShameJson: Record<string, Record<string, number>>,
    key: string,
    valueFormat: (d: { name: string; value: number }) => string = d =>
        String(d.value)
) =>
    Object.entries(wallOfShameJson)
        .map(([player, stats]: [string, Record<string, number>]) => ({
            name: player,
            value: stats[key],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(d => ({
            name: d.name,
            value: valueFormat(d),
        }));

const WallOfShame = (props: Props) => {
    const bodyshotData = topFive(
        props.wallOfShameJson,
        "bodyshot_rate",
        d => `${d.value}%`
    );
    const feetData = topFive(
        props.wallOfShameJson,
        "legshot_rate",
        d => `${d.value}%`
    );

    const kniferData = topFive(props.wallOfShameJson, "knife_kills");
    const knifeeData = topFive(props.wallOfShameJson, "knife_deaths");

    const masochistData = topFive(props.wallOfShameJson, "self_damage");
    const sabotagerData = topFive(props.wallOfShameJson, "team_damage");

    return (
        <div className={style.WallOfShame}>
            <div className={style.Header}>{/* <Navbar /> */}</div>
            <div className={style.Screen}>
                <div className={style.Title}>
                    <h1>
                        Wall of <span>Shame</span>
                    </h1>
                </div>
            </div>
            <div className={style.Screen}>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Bodyshot Barry's"
                        description="Highest body shot percent"
                        data={bodyshotData}
                    />
                </div>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Foot Hunters"
                        description="Highest leg shot percent"
                        data={feetData}
                    />
                </div>
            </div>
            <div className={style.Screen}>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Top Knifers"
                        description="Most knife kills"
                        data={kniferData}
                    />
                </div>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Top Knifees"
                        description="Most deaths to a knife"
                        data={knifeeData}
                    />
                </div>
            </div>
            <div className={style.Screen}>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Top Masochists"
                        description="Most damage done to self"
                        data={masochistData}
                    />
                </div>
                <div className={style.LeaderboardContainer}>
                    <Leaderboard
                        title="Top Sabotagers"
                        description="Most damage done to allies"
                        data={sabotagerData}
                    />
                </div>
            </div>
        </div>
    );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
    return {
        props: {
            wallOfShameJson: require("data/wall-of-shame.json"),
        },
    };
};

export default WallOfShame;
