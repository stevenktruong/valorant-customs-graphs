import { Property } from "csstype";
import * as React from "react";

import style from "./Dashboard.module.css";

interface Props extends React.PropsWithChildren {
    direction: Property.FlexDirection;
    id?: string;
}

export const Dashboard = (props: Props) => (
    <div
        className={style.Dashboard}
        id={props.id}
        style={{ flexDirection: props.direction }}
    >
        {props.children}
    </div>
);
