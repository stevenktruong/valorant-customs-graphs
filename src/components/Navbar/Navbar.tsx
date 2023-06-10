import Link from "next/link";
import * as React from "react";

import { useWindowDimensions } from "helpers";

import style from "./Navbar.module.scss";

const links = [
    {
        name: "Home",
        path: "/",
    },
    {
        name: "Dashboard",
        path: "/player",
    },
    {
        name: "Leaderboard",
        path: "/wall-of-shame",
    },
];

export const Navbar = () => {
    const { width } = useWindowDimensions();
    const isMobile: boolean = width && width <= 800 ? true : false;

    return (
        <div className={style.Navbar}>
            <div className={style.LinksContainer}>
                {links.map(d => (
                    <Link href={d.path} key={d.name}>
                        {d.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};
