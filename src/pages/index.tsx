import { GetServerSideProps } from "next";
import Link from "next/link";
import * as React from "react";

import Logo from "components/Logo";
import Navbar from "components/Navbar";
import PlayerCard from "components/PlayerCard";
import { PLAYERS, PLAYER_TAG, Player, ValorantAgent } from "config";
import { isGetDashboardAPIResponse } from "models/Dashboard";

import style from "./index.module.scss";

interface Props {
    individualData: Record<string, any>;
}

const HomeScreen = (props: Props) => {
    return (
        <div className={style.HomeScreen}>
            <div className={style.Header}>
                <Logo />
                <Navbar />
            </div>
            <div className={style.Main}>{makePlayerCardRows(props, 3)}</div>
        </div>
    );
};

const makePlayerCardRows = (props: Props, nCols: number) => {
    const nRows = Math.ceil(PLAYERS.length / nCols);
    const rows = [];
    for (let i = 0; i < nRows; i++) {
        rows.push(
            <div key={`row${i}cols${nCols}`} className={style.PlayerCardRow}>
                {PLAYERS.slice(nCols * i, nCols * i + nCols).map(
                    (player: Player) => (
                        <div
                            key={`PlayerCard${player}cols${nCols}`}
                            className={style.PlayerCardContainer}
                        >
                            <Link href={`/player/${player}`}>
                                <PlayerCard
                                    player={player}
                                    alias={PLAYER_TAG[player]}
                                    agent={
                                        props.individualData[player]
                                            .top_agents[0]
                                    }
                                    roles={
                                        props.individualData[player].top_roles
                                    }
                                />
                            </Link>
                        </div>
                    )
                )}
            </div>
        );
    }

    return rows;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    if (!process.env.BACKEND_URL) {
        throw new Error("Missing BACKEND_URL environment variable");
    }

    const res = await fetch(`${process.env.BACKEND_URL}/dashboard`);
    const dashboardJson = await res.json();
    if (!isGetDashboardAPIResponse(dashboardJson)) {
        throw new Error("/dashboards API did not return the expected data");
    }

    return {
        props: {
            individualData: dashboardJson.individual,
        },
    };
};

export default HomeScreen;
