import * as React from "react";

import style from "./Player.module.scss";

interface Props {
    title: string;
    description?: string;
    width?: string;
    height?: string;
}

export const Player = (props: Props) => <div className={style.Player}></div>;
