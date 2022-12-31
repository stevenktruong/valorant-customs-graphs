// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./PieGraph.module.scss";

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
                )}` + (percentage ? " 50%" : "10")
            )
            .each(function () {
                longestLabelLength = this.getComputedTextLength();
                labelHeight = this.getBBox().height;
                this.remove();
            });

        const center = [width / 2, height / 2];
        const translateToCenter = g =>
            g.attr("transform", `translate(${center.join(",")})`);

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

        const total = d3.sum(data.map(d => d.count));
        const pie = d3
            .pie()
            .value(d => d.count)
            .sort(null);
        const arc = d3
            .arc()
            .innerRadius(R / 2)
            .outerRadius(R)
            .padRadius(R)
            .padAngle(8 / 360);

        // Used to compute the radial portion of the tick marks
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

        // Label is either raw count or percentage
        const label = d =>
            `${d.data.label} ` +
            (percentage
                ? `${Math.round((100 * d.data.count) / total)}%`
                : `${d.data.count}`);

        // Cache angles for the transition animation
        const stash = function (d) {
            this.previousStartAngle = d.startAngle;
            this.previousArcAngle = d.endAngle - d.startAngle;
        };

        const angleTween = callback =>
            function (d) {
                const startAngle = d3.interpolate(
                    this.previousStartAngle,
                    d.startAngle
                );
                const arcAngle = d3.interpolate(
                    this.previousArcAngle,
                    d.endAngle - d.startAngle
                );
                return t => {
                    d.startAngle = startAngle(t);
                    d.endAngle = startAngle(t) + arcAngle(t);
                    return callback(d);
                };
            };
        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        svg.selectAll(".pieArc")
            .data(pie(data))
            .join(
                enter => {
                    const pieArc = enter.append("g").attr("class", "pieArc");
                    pieArc
                        .append("path")
                        .attr("class", "arc")
                        .call(translateToCenter)
                        .attr("fill", d => d.data.color)
                        .each(stash);
                    pieArc
                        .append("path")
                        .attr("class", "tick")
                        .attr("stroke", "#ffffff")
                        .attr("fill-opacity", 0)
                        .call(translateToCenter)
                        .attr(
                            "d",
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${innerPoint(d).join(",")},` +
                                `L${innerPoint(d).join(",")}`
                        )
                        .each(stash);
                    pieArc
                        .append("text")
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
                        .each(stash);

                    // Draw animations
                    const draw = pieArc
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration);
                    draw.select(".arc").attrTween("d", d => {
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
                    draw.select(".tick")
                        .delay(initialDrawDuration)
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
                    draw.select("text").attr("opacity", 1);
                },
                update => {
                    update.select(".arc").call(translateToCenter);
                    update.select(".tick").call(translateToCenter);
                    update
                        .select("text")
                        .text(label)
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr(
                            "dx",
                            d =>
                                direction(d) *
                                (horizontalTickLength + tickPadding)
                        );

                    const transition = update
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(transitionDuration);
                    transition
                        .select(".arc")
                        .attr("fill", d => d.data.color)
                        .attrTween("d", angleTween(arc));
                    transition.select(".tick").attrTween(
                        "d",
                        angleTween(
                            d =>
                                `M${innerPoint(d).join(",")},` +
                                `L${outerPoint(d).join(",")},` +
                                `L${
                                    outerPoint(d)[0] +
                                    direction(d) * horizontalTickLength
                                },${outerPoint(d)[1]}`
                        )
                    );
                    transition
                        .select("text")
                        .attrTween(
                            "transform",
                            angleTween(
                                d =>
                                    `translate(${outerPoint(d)
                                        .map((c, i) => c + center[i])
                                        .join(",")})`
                            )
                        )
                        .attr("opacity", 1);
                    transition
                        .end()
                        .then(() => {
                            update.select(".arc").each(stash);
                            update.select(".tick").each(stash);
                            update.select("text").each(stash);
                        })
                        .catch(() => {});
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};
