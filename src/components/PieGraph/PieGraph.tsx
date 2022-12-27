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

        const { data, initialDrawDuration, transitionDuration, percentage } =
            props;

        const { width, height } = dimensions;

        const tickPadding = 5;
        const radialTickLength = 5;
        const horizontalTickLength = 8;

        // Shift left based on the length of the longest name
        let longestLabelLength;
        let labelHeight;
        svg.append("text")
            .attr("font-size", "10px")
            .attr("opacity", 0)
            .text(
                `${data.reduce(
                    (acc, curr) =>
                        curr.label.length > acc.length ? curr.label : acc,
                    data[0].label
                )}` + (percentage ? " 50%" : "")
            )
            .each(function () {
                longestLabelLength = this.getComputedTextLength();
                labelHeight = this.getBBox().height;
                this.remove();
            });

        const center = [width / 2, height / 2];

        // R should be the largest number so that
        //   2R + 2 * (2*tickPadding + radialTickLength + horizontalTickLength + longestLabelLength) <= width
        //   2R + 2 * (2*tickPadding + radialTickLength + horizontalTickLength + labelHeight)        <= height
        // This way, R is the largest radius so that all text is still contained on the screen
        // when the chart is centered in the svg.
        const R = Math.min(
            width / 2 -
                (2 * tickPadding +
                    radialTickLength +
                    horizontalTickLength +
                    longestLabelLength),
            height / 2 -
                (2 * tickPadding +
                    radialTickLength +
                    horizontalTickLength +
                    labelHeight)
        );

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
            .innerRadius(R + tickPadding)
            .outerRadius(R + tickPadding);
        const labelOuterArc = d3
            .arc()
            .innerRadius(R + tickPadding + radialTickLength)
            .outerRadius(R + tickPadding + radialTickLength);

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
                        .attr("transform", `translate(${center.join(",")})`)
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
                        .attr("transform", `translate(${center.join(",")})`)
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
                                    `L${
                                        outerPoint(d)[0] +
                                        direction(d) * horizontalTickLength
                                    },${outerPoint(d)[1]}`,
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
                        .attr("transform", `translate(${center.join(",")})`)
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
                        .attr("transform", `translate(${center.join(",")})`)
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration)
                        .attr(
                            "d",
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${outerPoint(d).join(",")},` +
                                `L${
                                    outerPoint(d)[0] +
                                    direction(d) * horizontalTickLength
                                },${outerPoint(d)[1]}`
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
                        .attr(
                            "dx",
                            d =>
                                direction(d) *
                                (horizontalTickLength + tickPadding)
                        )
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
