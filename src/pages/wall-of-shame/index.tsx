import { GetServerSideProps } from "next";
import * as React from "react";

import Navbar from "components/Navbar";
import Leaderboard from "components/wall-of-shame/Leaderboard";
import { PLAYERS, Player } from "config";
import { isGetWallOfShameAPIResponse } from "models/WallOfShame";

import style from "./index.module.scss";

type Datum = { name: Player; value: string };

interface Props {
    bodyshotData: Datum[];
    feetData: Datum[];
    kniferData: Datum[];
    knifeeData: Datum[];
    masochistData: Datum[];
    sabotagerData: Datum[];
    plantData: Datum[];
    bombDeathData: Datum[];
    loseStreakData: Datum[];
    winStreakData: Datum[];
}

const topFive = (
    wallOfShameJson: Record<Player, Record<string, any>>,
    key: string,
    valueFormat: (d: { name: Player; value: number }) => string = d =>
        String(d.value)
) =>
    Object.entries(wallOfShameJson)
        .map(([player, stats]: [Player, Record<string, number>]) => ({
            name: player,
            value: stats[key],
        }))
        .filter(stats => PLAYERS.includes(stats.name))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(d => ({
            name: d.name,
            value: valueFormat(d),
        }));

const WallOfShame = (props: Props) => {
    return (
        <div className={style.WallOfShame}>
            <div className={style.Header}>
                <Navbar />
            </div>
            <div className={style.Screen}>
                <div className={style.Title}>
                    <h1>
                        Wall of <span>Shame</span>
                    </h1>
                </div>
            </div>
            <div className={style.Screen}>
                <Leaderboard
                    title="Bodyshot Barry's"
                    description="Highest body shot percent"
                    data={props.bodyshotData}
                />
                <Leaderboard
                    title="Foot Hunters"
                    description="Highest leg shot percent"
                    data={props.feetData}
                />
            </div>
            <div className={style.Screen}>
                <Leaderboard
                    title="Top Knifers"
                    description="Most knife kills"
                    data={props.kniferData}
                />
                <Leaderboard
                    title="Top Knifees"
                    description="Most deaths to a knife"
                    data={props.knifeeData}
                />
            </div>
            <div className={style.Screen}>
                <Leaderboard
                    title="Top Masochists"
                    description="Most damage done to self"
                    data={props.masochistData}
                />
                <Leaderboard
                    title="Top Sabotagers"
                    description="Most damage done to allies"
                    data={props.sabotagerData}
                />
            </div>
            <div className={style.Screen}>
                <Leaderboard
                    title="Bomb Bitches"
                    description="Most bomb plants"
                    data={props.plantData}
                />
                <Leaderboard
                    title="Tortoises"
                    description="Most bomb deaths"
                    data={props.bombDeathData}
                />
            </div>
            <div className={style.Screen}>
                <Leaderboard
                    title="Crypto Throwers"
                    description="Longest lose streak"
                    data={props.loseStreakData}
                />
                <Leaderboard
                    title="Stream Snipers"
                    description="Longest win streak"
                    data={props.winStreakData}
                />
            </div>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    if (!process.env.BACKEND_URL) {
        throw new Error("Missing BACKEND_URL environment variable");
    }

    let wallOfShameJson;
    try {
        const res = await fetch(`${process.env.BACKEND_URL}/wall-of-shame`);
        wallOfShameJson = await res.json();
        if (!isGetWallOfShameAPIResponse(wallOfShameJson)) {
            throw new Error(
                "/wall-of-shame API did not return the expected data"
            );
        }
    } catch {
        wallOfShameJson = require("data/wall-of-shame.json");
        console.log(
            "Failed to fetch data from the backend. Falling back on cached data."
        );
    }

    return {
        props: {
            bodyshotData: topFive(
                wallOfShameJson,
                "bodyshot_rate",
                d => `${d.value}%`
            ),
            feetData: topFive(
                wallOfShameJson,
                "legshot_rate",
                d => `${d.value}%`
            ),
            kniferData: topFive(wallOfShameJson, "knife_kills"),
            knifeeData: topFive(wallOfShameJson, "knife_deaths"),
            masochistData: topFive(wallOfShameJson, "self_damage"),
            sabotagerData: topFive(wallOfShameJson, "team_damage"),
            plantData: topFive(wallOfShameJson, "plants"),
            bombDeathData: topFive(wallOfShameJson, "bomb_deaths"),
            loseStreakData: topFive(wallOfShameJson, "longest_lose_streak"),
            winStreakData: topFive(wallOfShameJson, "longest_win_streak"),
        },
    };
};

export default WallOfShame;
