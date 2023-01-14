import * as React from "react";

import style from "./Navbar.module.scss";
import Link from "next/link";

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

// TODO: Implement a mobile navbar
interface Props {
    isMobile: boolean;
}

export const Navbar = (props: Props) => (
    <div className={style.Navbar}>
        {links.map(d => (
            <Link href={d.path} key={d.name}>
                {d.name}
            </Link>
        ))}
    </div>
);
