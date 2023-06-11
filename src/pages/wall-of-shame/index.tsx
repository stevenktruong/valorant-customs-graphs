import { GetServerSideProps } from "next";
import * as React from "react";

import Logo from "components/Logo";
import Navbar from "components/Navbar";
import Leaderboard from "components/wall-of-shame/Leaderboard";
import { PLAYERS, Player } from "config";
import { isGetWallOfShameAPIResponse } from "models/WallOfShame";

import style from "./index.module.scss";

const categories: [Record<string, string>, Record<string, string>][] = [
    [
        // Body part hit rates
        {
            title: "BODYSHOT BARRY'S",
            description: "Highest body shot percent",
            caption: "So no head?",
            key: "bodyshot_rate",
        },
        {
            title: "FOOT HUNTERS",
            description: "Highest leg shot percent",
            caption: "Toes? We don't judge.",
            key: "legshot_rate",
        },
    ],
    [
        // Knifing
        {
            title: "TOP KNIFERS",
            description: "Most knife kills",
            caption: "Put backstabbing on the resume.",
            key: "knife_kills",
        },
        {
            title: "TOP KNIFEES",
            description: "Most deaths to knife",
            caption: "Poor souls.",
            key: "knife_deaths",
        },
    ],
    [
        // Team damage
        {
            title: "TOP MASOCHISTS",
            description: "Most damage done to self",
            caption: "Game was too easy, had to add a challenge.",
            key: "self_damage",
        },
        {
            title: "TOP SABOTAGERS",
            description: "Most damage done to allies",
            caption: "You didn't do /that/ much damage.",
            key: "team_damage",
        },
    ],
    [
        // Time alive on attack
        {
            title: "BIGGEST BAIT",
            description: "Least time alive on lost attack rounds",
            caption: "Your duty is ... over.",
            key: "average_time_alive_on_lost_attack_rounds",
        },
        {
            title: "MASTER BAITERS",
            description: "Most time alive on lost attack rounds",
            caption: "Time to start holding W.",
            key: "average_time_alive_on_won_attack_rounds",
        },
    ],
    [
        // Bomb things
        {
            title: "BOMB BITCHES",
            description: "Most bomb plants",
            caption: "You're not just their planter!",
            key: "plants",
        },
        {
            title: "TORTOISES",
            description: "Most bomb deaths",
            caption: "Took slow and steady too literally.",
            key: "bomb_deaths",
        },
    ],
    [
        // Streaks
        {
            title: "CRYPTO THROWERS",
            description: "Longest lose streak",
            caption: "At least you're the best at something.",
            key: "longest_lose_streak",
        },
        {
            title: "STREAM SNIPERS",
            description: "Longest win streak",
            caption: "Leave some for the rest of us.",
            key: "longest_win_streak",
        },
    ],
];

type Datum = { name: Player; value: string };
type CategoryData = {
    title: string;
    description: string;
    caption: string;
    data: Datum[];
};

interface Props {
    categoryPairs: [CategoryData, CategoryData][];
}

const WallOfShame = (props: Props) => {
    return (
        <div className={style.WallOfShame}>
            <div className={style.Header}>
                <Logo />
                <Navbar />
            </div>
            <div className={style.Screen}>
                <div className={style.Title}>
                    <h1>
                        Wall of <span>Shame</span>
                    </h1>
                </div>
            </div>
            {props.categoryPairs.map(categoryPair => (
                <div className={style.Screen}>
                    {categoryPair.map(category => (
                        <Leaderboard
                            title={category.title}
                            description={category.description}
                            data={category.data}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    if (!process.env.BACKEND_URL) {
        throw new Error("Missing BACKEND_URL environment variable");
    }

    const res = await fetch(`${process.env.BACKEND_URL}/wall-of-shame`);
    const wallOfShameJson = await res.json();
    if (!isGetWallOfShameAPIResponse(wallOfShameJson)) {
        throw new Error("/wall-of-shame API did not return the expected data");
    }

    const categoryPairs: [CategoryData, CategoryData][] = categories.map(
        categoryPair => [
            {
                title: categoryPair[0].title,
                description: categoryPair[0].description,
                caption: categoryPair[0].caption,
                data: topFive(wallOfShameJson, categoryPair[0].key),
            },
            {
                title: categoryPair[1].title,
                description: categoryPair[1].description,
                caption: categoryPair[1].caption,
                data: topFive(wallOfShameJson, categoryPair[1].key),
            },
        ]
    );

    return {
        props: { categoryPairs },
    };
};

export default WallOfShame;
