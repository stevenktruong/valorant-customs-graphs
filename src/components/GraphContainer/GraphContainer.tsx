import * as React from "react";
import "./GraphContainer.css";

interface Props extends React.PropsWithChildren {
    id: string;
}

export const GraphContainer = (props: Props) => (
    <div className="GraphContainer" id={props.id}>
        {props.children}
    </div>
);
