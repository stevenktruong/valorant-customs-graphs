// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./StratifiedPieGraph.module.scss";

interface Props {
    data: {
        stratumLabel: string;
        color: string;
        stratumData: {
            label: string;
            count: number;
        }[];
    }[];
    initialDrawDuration: number;
    transitionDuration: number;
    percentage?: boolean;
}

export const StratifiedPieGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { data, initialDrawDuration, transitionDuration, percentage } =
            props;

        const { width, height } = dimensions;

        const radialPadding = 4;
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
                `${data
                    .map(d => [
                        d.stratumLabel,
                        d.stratumData.reduce(
                            (acc, curr) =>
                                curr.label.length > acc.length
                                    ? curr.label
                                    : acc,
                            d.stratumData[0].label
                        ),
                    ])
                    .map(labels =>
                        labels[0].length > labels[1].length
                            ? labels[0]
                            : labels[1]
                    )
                    .reduce((acc, curr) =>
                        curr.length > acc.length ? curr : acc
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

        data.forEach((d, i) => {
            data[i].count = d3.sum(d.stratumData.map(sd => sd.count));
        });
        const totalCounts = d3.sum(data.map(d => d.count));

        const strataPie = d => {
            const pie = d3.pie().value(d => d.count)(d);
            pie.forEach((p, i) => {
                const rescaledPie = d3.pie().value(d => d.count)(
                    p.data.stratumData
                );
                const proportion = p.data.count / totalCounts;
                rescaledPie.forEach((sp, i) => {
                    rescaledPie[i].startAngle *= proportion;
                    rescaledPie[i].endAngle *= proportion;
                    rescaledPie[i].startAngle += p.startAngle;
                    rescaledPie[i].endAngle += p.startAngle;
                });
                pie[i].stratumPie = rescaledPie;
            });
            return pie;
        };

        const strataArc = d3
            .arc()
            .innerRadius((2 / 5) * R)
            .outerRadius((4 / 5) * R)
            .padRadius((4 / 5) * R)
            .padAngle(8 / 360);
        const populationArc = d3
            .arc()
            .innerRadius((4 / 5) * R + radialPadding)
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

        svg.selectAll(".stratumPieArc")
            .data(strataPie(data))
            .join(
                enter => {
                    const arcs = enter
                        .append("g")
                        .attr("class", "stratumPieArc");
                    arcs.append("path")
                        .attr("class", "stratumArc")
                        .attr("transform", `translate(${center.join(",")})`)
                        .attr("fill", d => d.data.color)
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
                                return strataArc(d);
                            };
                        });
                    enter.each(p => {
                        arcs.append("g").attr(
                            "class",
                            `.${p.data.stratumLabel}PieArc`
                        );
                        arcs.append("path")
                            .attr("class", `.${p.data.stratumLabel}PieArc`)
                            .attr("transform", `translate(${center.join(",")})`)
                            .attr("fill", p.data.color)
                            .attr(
                                "d",
                                strataArc({
                                    startAngle: 0,
                                    endAngle: 0,
                                })
                            )
                            .transition()
                            .ease(d3.easeLinear)
                            .duration(initialDrawDuration)
                            .attrTween("d", d => {
                                const startAngle = d3.interpolate(
                                    0,
                                    d.startAngle
                                );
                                const arcAngle = d3.interpolate(
                                    0,
                                    d.endAngle - d.startAngle
                                );
                                return t => {
                                    d.startAngle = startAngle(t);
                                    d.endAngle = startAngle(t) + arcAngle(t);
                                    return populationArc(d);
                                };
                            });
                    });
                    // arcs.append("path")
                    //     .attr("class", "tick")
                    //     .attr("stroke", "#ffffff")
                    //     .attr("fill-opacity", 0)
                    //     .attr("transform", `translate(${center.join(",")})`)
                    //     .attr(
                    //         "d",
                    //         d =>
                    //             `M${innerPoint(d).join(",")},` +
                    //             `L${innerPoint(d).join(",")},` +
                    //             `L${innerPoint(d).join(",")}`
                    //     )
                    //     .transition()
                    //     .delay(initialDrawDuration)
                    //     .ease(d3.easeLinear)
                    //     .duration(initialDrawDuration / 2)
                    //     .attrTween("d", d =>
                    //         d3.piecewise(d3.interpolate, [
                    //             `M${innerPoint(d).join(",")},` +
                    //                 `L${innerPoint(d).join(",")},` +
                    //                 `L${innerPoint(d).join(",")},`,
                    //             `M${innerPoint(d).join(",")},` +
                    //                 `L${outerPoint(d).join(",")},` +
                    //                 `L${outerPoint(d).join(",")},`,
                    //             `M${innerPoint(d).join(",")},` +
                    //                 `L${outerPoint(d).join(",")},` +
                    //                 `L${
                    //                     outerPoint(d)[0] +
                    //                     direction(d) * horizontalTickLength
                    //                 },${outerPoint(d)[1]}`,
                    //         ])
                    //     );
                    // arcs.append("text")
                    //     .attr("fill", "#ffffff")
                    //     .attr("opacity", 0)
                    //     .attr("font-size", "10px")
                    //     .text(label)
                    //     .attr("alignment-baseline", "central")
                    //     .attr("text-anchor", d =>
                    //         direction(d) > 0 ? "start" : "end"
                    //     )
                    //     .attr("dx", d => direction(d) * 12)
                    //     .attr(
                    //         "transform",
                    //         d =>
                    //             `translate(${outerPoint(d)[0] + center[0]}, ${
                    //                 outerPoint(d)[1] + center[1]
                    //             })`
                    //     )
                    //     .transition()
                    //     .delay(initialDrawDuration)
                    //     .ease(d3.easeLinear)
                    //     .duration(initialDrawDuration / 3)
                    //     .attr("opacity", 1);
                },
                update => {
                    // update
                    //     .select(".tick")
                    //     .attr("transform", `translate(${center.join(",")})`)
                    //     .transition()
                    //     .ease(d3.easeLinear)
                    //     .duration(transitionDuration)
                    //     .attr(
                    //         "d",
                    //         d =>
                    //             `M${innerPoint(d).join(",")},` +
                    //             `L${outerPoint(d).join(",")},` +
                    //             `L${
                    //                 outerPoint(d)[0] +
                    //                 direction(d) * horizontalTickLength
                    //             },${outerPoint(d)[1]}`
                    //     );
                    // update
                    //     .select("text")
                    //     .attr(
                    //         "transform",
                    //         d =>
                    //             `translate(${outerPoint(d).map(
                    //                 (c, i) => c + center[i]
                    //             )})`
                    //     )
                    //     .text(label)
                    //     .attr("text-anchor", d =>
                    //         direction(d) > 0 ? "start" : "end"
                    //     )
                    //     .attr(
                    //         "dx",
                    //         d =>
                    //             direction(d) *
                    //             (horizontalTickLength + tickPadding)
                    //     )
                    //     .transition()
                    //     .ease(d3.easeLinear)
                    //     .duration(transitionDuration)
                    //     .attr("opacity", 1);
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};
