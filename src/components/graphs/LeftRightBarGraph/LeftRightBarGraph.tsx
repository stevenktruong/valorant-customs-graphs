// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./LeftRightBarGraph.module.scss";

interface Props {
    data: {
        label?: string;
        leftValue: number;
        rightValue: number;
        color: string;
        order: number; // Needed to position the bars
    }[];
    initialDrawDuration: number;
    transitionDuration: number;
    highlightedSide: string;
}

export const LeftRightBarGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const {
            data,
            initialDrawDuration,
            transitionDuration,
            highlightedSide,
        } = props;

        const { width, height } = dimensions;

        let leftRightPadding;
        const bottomPadding = 0;
        const labelHorizontalPadding = 8;
        const strokeWidth = 1;
        const centerPadding = 2;

        // Shift left based on the length of the longest name
        svg.append("text")
            .attr("font-size", "11px")
            .attr("opacity", 0)
            .text(
                `${data.reduce(
                    (acc, curr) =>
                        curr.label.length > acc.length ? curr.label : acc,
                    data[0].label
                )} | 9.9`
            )
            .each(function () {
                leftRightPadding =
                    this.getComputedTextLength() + 2 * labelHorizontalPadding;
                this.remove();
            });

        // Set up scales
        const xLeft = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.leftValue)])
            .range([width / 2 - centerPadding, leftRightPadding]);

        const xRight = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.rightValue)])
            .range([width / 2 + centerPadding, width - leftRightPadding]);

        const y = d3
            .scaleBand()
            .domain(data.map(d => d.order))
            .range([height - bottomPadding, 0])
            .padding(0.25);

        const stash = function (d) {
            this.previousLabel = d.label;
            this.previousLeftValue = d.leftValue;
            this.previousRightValue = d.rightValue;
        };

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        // Draw data
        svg.selectAll(".dataRect")
            .data(data)
            .join(
                enter => {
                    const bars = enter.append("g").attr("class", "dataRect");
                    bars.append("rect")
                        .attr("class", "leftRect")
                        .attr(
                            "fill-opacity",
                            highlightedSide === "left" ? 1 : 0
                        )
                        .attr("x", xLeft(0));
                    bars.append("rect")
                        .attr("class", "rightRect")
                        .attr(
                            "fill-opacity",
                            highlightedSide === "right" ? 1 : 0
                        )
                        .attr("x", xRight(0));
                    bars.selectAll("rect")
                        .attr("fill", d => d.color)
                        .attr("stroke", d => d.color)
                        .attr("stroke-width", strokeWidth)
                        .attr("y", d => y(d.order) + strokeWidth / 2)
                        .attr("width", 0)
                        .attr("height", y.bandwidth() - strokeWidth);
                    bars.selectAll("text").attr("opacity", d => d.label);
                    const leftText = bars
                        .append("text")
                        .attr("class", "leftText")
                        .attr("text-anchor", "end")
                        .attr("x", xLeft(0))
                        .attr("dx", -labelHorizontalPadding);
                    leftText
                        .append("tspan")
                        .attr("class", "label")
                        .text(d => `${d.label} | `)
                        .attr("opacity", highlightedSide === "left" ? 1 : 0);
                    leftText
                        .append("tspan")
                        .attr("class", "value")
                        .text(d => d.leftValue.toFixed(1));
                    const rightText = bars
                        .append("text")
                        .attr("class", "rightText")
                        .attr("text-anchor", "start")
                        .attr("x", xRight(0))
                        .attr("dx", labelHorizontalPadding);
                    rightText
                        .append("tspan")
                        .attr("class", "value")
                        .text(d => d.rightValue.toFixed(1));
                    rightText
                        .append("tspan")
                        .attr("class", "label")
                        .text(d => ` | ${d.label}`)
                        .attr("opacity", highlightedSide === "right" ? 1 : 0);
                    bars.selectAll("text")
                        .attr("fill", "#ffffff")
                        .attr("font-size", "11px")
                        .attr("alignment-baseline", "central")
                        .attr("y", d => y(d.order))
                        .attr("dy", y.bandwidth() / 2);
                    bars.selectAll("text tspan").attr(
                        "alignment-baseline",
                        "central"
                    );
                    enter.selectAll("tspan").each(stash);

                    const draw = bars
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear);
                    draw.select(".leftRect")
                        .attr("x", d => xLeft(d.leftValue))
                        .attr("width", d => xLeft(0) - xLeft(d.leftValue));
                    draw.select(".rightRect").attr(
                        "width",
                        d => xRight(d.rightValue) - xRight(0)
                    );
                    draw.select(".leftText").attr("x", d => xLeft(d.leftValue));
                    draw.select(".rightText").attr("x", d =>
                        xRight(d.rightValue)
                    );
                },
                update => {
                    const transition = update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear);
                    transition
                        .selectAll("rect")
                        .attr("y", d => y(d.order) + strokeWidth / 2)
                        .attr("height", y.bandwidth() - strokeWidth);
                    transition
                        .select(".leftRect")
                        .attr("fill", d => d.color)
                        .attr("stroke", d => d.color)
                        .attr(
                            "fill-opacity",
                            highlightedSide === "left" ? 1 : 0
                        )
                        .attr("x", d => xLeft(d.leftValue))
                        .attr("width", d => xLeft(0) - xLeft(d.leftValue));
                    transition
                        .select(".rightRect")
                        .attr("fill", d => d.color)
                        .attr("stroke", d => d.color)
                        .attr(
                            "fill-opacity",
                            highlightedSide === "right" ? 1 : 0
                        )
                        .attr("x", xRight(0))
                        .attr("width", d => xRight(d.rightValue) - xRight(0));
                    transition
                        .selectAll("text")
                        .attr("y", d => y(d.order))
                        .attr("dy", y.bandwidth() / 2);
                    transition.selectAll("text").attr("opacity", d => d.label);
                    const leftText = transition.select(".leftText");
                    leftText
                        .attr("x", d => xLeft(d.leftValue))
                        .select(".label")
                        .text(function (d) {
                            return `${
                                highlightedSide === "left"
                                    ? d.label
                                    : this.previousLabel
                            } | `;
                        })
                        .attr("opacity", highlightedSide === "left" ? 1 : 0);
                    leftText.select(".value").textTween(function (d) {
                        return t =>
                            (
                                d3.interpolateRound(
                                    10 * this.previousLeftValue,
                                    10 * d.leftValue
                                )(t) / 10
                            ).toFixed(1);
                    });
                    const rightText = transition.select(".rightText");
                    rightText
                        .attr("x", d => xRight(d.rightValue))
                        .select(".label")
                        .text(function (d) {
                            return ` | ${
                                highlightedSide === "right"
                                    ? d.label
                                    : this.previousLabel
                            }`;
                        })
                        .attr("opacity", highlightedSide === "right" ? 1 : 0);
                    rightText.select(".value").textTween(function (d) {
                        return t =>
                            (
                                d3.interpolateRound(
                                    10 * this.previousRightValue,
                                    10 * d.rightValue
                                )(t) / 10
                            ).toFixed(1);
                    });

                    transition
                        .end()
                        .then(() => {
                            update.selectAll("tspan").each(stash);
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
