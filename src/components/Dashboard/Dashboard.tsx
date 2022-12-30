import { Property } from "csstype";
import * as React from "react";

import style from "./Dashboard.module.scss";

interface Props extends React.PropsWithChildren {
    direction: Property.FlexDirection;
}

export const Dashboard = (props: Props) => (
    <div className={style.Dashboard} style={{ flexDirection: props.direction }}>
        {props.children}
    </div>
);
