import * as React from "react";

import style from "./Caption.module.scss";

interface Props {
    title: string;
    description?: string;
}

export const Caption = (props: Props) => (
    <div className={style.Caption}>
        <h2>{props.title}</h2>
        {props.description ? <h3>{props.description}</h3> : null}
    </div>
);
