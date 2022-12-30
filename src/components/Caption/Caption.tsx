import * as React from "react";

import style from "./Caption.module.scss";

interface Props {
    title: string;
    description?: string;
    width?: string;
    height?: string;
}

export const Caption = (props: Props) => (
    <div
        className={style.CaptionContainer}
        style={{ width: props.width, height: props.height }}
    >
        <div className={style.Caption}>
            <h2>{props.title}</h2>
            {props.description ? <p>{props.description}</p> : null}
        </div>
    </div>
);
