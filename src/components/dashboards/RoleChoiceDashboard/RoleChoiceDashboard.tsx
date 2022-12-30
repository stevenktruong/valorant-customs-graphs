import * as React from "react";

import Caption from "components/Caption";
import Dashboard from "components/Dashboard";
import PieGraph from "components/graphs/PieGraph";

import style from "./RoleChoiceDashboard.module.scss";

interface Props {
    rolesData: {
        role: number;
    }[];
}

export const RoleChoiceDashboard = (props: Props) => {
    return (
        <Dashboard direction="row">
            <Caption
                title="Most Played Roles"
                description="Role pick proportion"
                width="20%"
            />
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
        </Dashboard>
    );
};
