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
    initialDrawDuration: number;
    transitionDuration: number;
    percentage?: boolean;
}

export const PieGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const {
            data,
            margin,
            initialDrawDuration,
            transitionDuration,
            percentage,
        } = props;

        const { width: svgWidth, height: svgHeight } = dimensions;

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const center = [margin.left + width / 2, margin.top + height / 2];
        const R = Math.min(width, height) / 3;

        const totalMaps = d3.sum(data.map(d => d.count));
        const pie = d3.pie().value(d => d.count);
        const arc = d3
            .arc()
            .innerRadius(R / 2)
            .outerRadius(R)
            .padRadius(R)
            .padAngle(8 / 360);
        const labelInnerArc = d3
            .arc()
            .innerRadius(R + 5)
            .outerRadius(R + 5);
        const labelOuterArc = d3
            .arc()
            .innerRadius(R + 10)
            .outerRadius(R + 10);

        const innerPoint = d => labelInnerArc.centroid(d);
        const outerPoint = d => labelOuterArc.centroid(d);
        const direction = d =>
            outerPoint(d)[0] - innerPoint(d)[0] > 0 ? 1 : -1;

        const label = d =>
            `${d.data.label} ` +
            (percentage
                ? `${Math.round((100 * d.data.count) / totalMaps)}%`
                : `${d.data.count}`);

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        svg.selectAll(".pieArc")
            .data(pie(data))
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
                        .attr("fill", d => d.data.color)
                        .attr(
                            "d",
                            arc({
                                startAngle: 0,
                                endAngle: 0,
                            })
                        )
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration)
                        .attrTween("d", d => {
                            const startAngle = d3.interpolate(0, d.startAngle);
                            const arcAngle = d3.interpolate(
                                0,
                                d.endAngle - d.startAngle
                            );
                            return t => {
                                d.startAngle = startAngle(t);
                                d.endAngle = startAngle(t) + arcAngle(t);
                                return arc(d);
                            };
                        });
                    arcs.append("path")
                        .attr("class", "tick")
                        .attr("stroke", "#ffffff")
                        .attr("fill-opacity", 0)
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
                                `L${innerPoint(d).join(",")},` +
                                `L${innerPoint(d).join(",")}`
                        )
                        .transition()
                        .delay(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration / 2)
                        .attrTween("d", d =>
                            d3.piecewise(d3.interpolate, [
                                `M${innerPoint(d).join(",")},` +
                                    `L${innerPoint(d).join(",")},` +
                                    `L${innerPoint(d).join(",")},`,
                                `M${innerPoint(d).join(",")},` +
                                    `L${outerPoint(d).join(",")},` +
                                    `L${outerPoint(d).join(",")},`,
                                `M${innerPoint(d).join(",")},` +
                                    `L${outerPoint(d).join(",")},` +
                                    `L${outerPoint(d)[0] + direction(d) * 8},${
                                        outerPoint(d)[1]
                                    }`,
                            ])
                        );
                    arcs.append("text")
                        .attr("fill", "#ffffff")
                        .attr("opacity", 0)
                        .attr("font-size", "10px")
                        .text(label)
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr("dx", d => direction(d) * 12)
                        .attr(
                            "transform",
                            d =>
                                `translate(${outerPoint(d)[0] + center[0]}, ${
                                    outerPoint(d)[1] + center[1]
                                })`
                        )
                        .transition()
                        .delay(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration / 3)
                        .attr("opacity", 1);
                },
                update => {
                    update
                        .select(".arc")
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr("fill", d => d.data.color)
                        .attrTween("d", d => {
                            const startAngle = d3.interpolate(0, d.startAngle);
                            const arcAngle = d3.interpolate(
                                0,
                                d.endAngle - d.startAngle
                            );
                            return t => {
                                d.startAngle = startAngle(t);
                                d.endAngle = startAngle(t) + arcAngle(t);
                                return arc(d);
                            };
                        });
                    update
                        .select(".tick")
                        .attr(
                            "transform",
                            `translate(${margin.left + width / 2}, ${
                                margin.top + height / 2
                            })`
                        )
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr(
                            "d",
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${outerPoint(d).join(",")},` +
                                `L${outerPoint(d)[0] + direction(d) * 8},${
                                    outerPoint(d)[1]
                                }`
                        );
                    update
                        .select("text")
                        .attr(
                            "transform",
                            d =>
                                `translate(${outerPoint(d).map(
                                    (c, i) => c + center[i]
                                )})`
                        )
                        .text(label)
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr("dx", d => direction(d) * 12)
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr("opacity", 1);
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};