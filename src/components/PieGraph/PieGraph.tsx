// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./PieGraph.module.css";

interface Props {
    data: {
        label: string;
        color: string;
        count: number;
    }[];
    margin: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}

export const PieGraph = (props: Props) => {
    const initialDrawDuration = 1000;
    const transitionDuration = 1000;

    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { data, margin } = props;

        const { width: svgWidth, height: svgHeight } = dimensions;

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const center = [margin.left + width / 2, margin.right + height / 2];
        const R = Math.min(width, height) / 2.5;

        const pie = d3.pie().value(d => d.count);
        const arc = d3
            .arc()
            .innerRadius(R / 2)
            .outerRadius(R)
            .padRadius(R)
            .padAngle(8 / 360);

        const labelInnerArc = d3
            .arc()
            .innerRadius(1.0625 * R)
            .outerRadius(1.0625 * R);
        const labelOuterArc = d3
            .arc()
            .innerRadius(1.125 * R)
            .outerRadius(1.125 * R);

        const arcData = pie(data).map((d, i) => ({
            label: data[i].label,
            color: data[i].color,
            count: data[i].count,
            pie: d,
        }));

        const innerPoint = d => labelInnerArc.centroid(d.pie);
        const outerPoint = d => labelOuterArc.centroid(d.pie);
        const direction = d =>
            outerPoint(d)[0] - innerPoint(d)[0] > 0 ? 1 : -1;

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        svg.selectAll(".pieArc")
            .data(arcData)
            .join(
                enter => {
                    const arcs = enter.append("g").attr("class", "pieArc");
                    arcs.append("path")
                        .attr("class", "arc")
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .attr("fill", d => d.color)
                        .attr("d", d => arc(d.pie));
                    arcs.append("path")
                        .attr("class", "tick")
                        .attr("fill-opacity", 0)
                        .attr("stroke", "#ffffff")
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .attr(
                            "d",
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${outerPoint(d).join(",")},` +
                                `L${outerPoint(d)[0] + direction(d) * 20},${
                                    outerPoint(d)[1]
                                }`
                        );
                    arcs.append("text")
                        .attr("fill", "#ffffff")
                        .attr("font-size", "12px")
                        .text(d => `${d.label} ${d.count}`)
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr("dx", d => direction(d) * 25)
                        .attr(
                            "transform",
                            d =>
                                `translate(${outerPoint(d).map(
                                    (c, i) => c + center[i]
                                )})`
                        );
                },
                update => {
                    update
                        .select(".arc")
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .attr("fill", d => d.color)
                        .attr("d", d => arc(d.pie));
                    update
                        .select(".tick")
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .attr(
                            "d",
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${outerPoint(d).join(",")},` +
                                `L${outerPoint(d)[0] + direction(d) * 20},${
                                    outerPoint(d)[1]
                                }`
                        );
                    update
                        .select("text")
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .text(d => `${d.label} ${d.count}`)
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr("dx", d => direction(d) * 25)
                        .attr(
                            "transform",
                            d =>
                                `translate(${outerPoint(d).map(
                                    (c, i) => c + center[i]
                                )})`
                        );
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};
