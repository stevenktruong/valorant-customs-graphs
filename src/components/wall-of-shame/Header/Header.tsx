import * as React from "react";

import style from "./Header.module.scss";

interface Props {
    title: string;
    description: string;
}

export const Header = (props: Props) => {
    return (
        <div className={style.Header}>
            <div className={style.TitleContainer}>
                <svg className={style.HeaderLeft} viewBox="0 0 245 60">
                    <rect width="150" height="80" />
                    <path d="M 150,0 L 190,0 L 150,80 L 150,80 Z" />
                    <path d="M 210,0 L 225,0 L 185,80 L 170,80 Z" />
                    <path d="M 245,0 L 205,80 L 245,80 Z" />
                </svg>
                <div className={style.Title}>
                    <h2>{props.title}</h2>
                </div>
                <svg className={style.HeaderRight} viewBox="0 0 40 80">
                    <path d="M 0,0 L 40,0, L 0,80 Z" />
                </svg>
            </div>
            <h3>{props.description}</h3>
        </div>
    );
};
