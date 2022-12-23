import * as React from "react";
import style from "./GraphContainer.module.css";

interface Props extends React.PropsWithChildren {
    id: string;
}

export const GraphContainer = (props: Props) => (
    <div className={style.GraphContainer} id={props.id}>
        {props.children}
    </div>
);
