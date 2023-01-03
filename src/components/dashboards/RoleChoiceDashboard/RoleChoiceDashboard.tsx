import * as React from "react";

import Caption from "components/Caption";
import PieGraph from "components/graphs/PieGraph";

import style from "./RoleChoiceDashboard.module.scss";

interface Props {
    rolesData: {
        role: number;
    }[];
}

export const RoleChoiceDashboard = (props: Props) => {
    return (
        <div className={style.RoleChoiceDashboard}>
            <div className={style.CaptionContainer}>
                <Caption
                    title="Most Played Roles"
                    description="Role pick proportion"
                />
            </div>
            <PieGraph
                data={Object.entries(props.rolesData).map(([role, count]) => ({
                    label: role,
                    color: "steelblue",
                    count: Number(count),
                }))}
                initialDrawDuration={1000}
                transitionDuration={1000}
                percentage={true}
            />
        </div>
    );
};
