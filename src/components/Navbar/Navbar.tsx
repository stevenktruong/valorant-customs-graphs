import * as React from "react";

import style from "./Navbar.module.scss";
import Link from "next/link";
import { useWindowDimensions } from "helpers";

const links = [
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
            {links.map(d => (
                <Link href={d.path} key={d.name}>
                    {d.name}
                </Link>
            ))}
        </div>
    );
};
