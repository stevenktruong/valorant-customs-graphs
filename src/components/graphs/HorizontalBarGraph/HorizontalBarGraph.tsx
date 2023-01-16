// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./HorizontalBarGraph.module.scss";

interface Props {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    labels: string[];
    initialDrawDuration: number;
    transitionDuration: number;
    percentage: boolean;
    ticks: number[];
}

export const HorizontalBarGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const {
            initialDrawDuration,
            transitionDuration,
            data,
            labels,
            percentage,
            ticks,
        } = props;

        const { width, height } = dimensions;

        let leftPadding;
        const rightPadding = 20;
        const bottomPadding = 20;
        const labelHorizontalPadding = 8;

        // When to put text above or below the bar
        // TODO: Pick these numbers more intelligently
        const positionThreshold = percentage ? 90 : 450;

        // Shift left based on the length of the longest name
        svg.append("text")
            .attr("font-size", "11px")
            .attr("opacity", 0)
            .text(
                labels.reduce((acc, curr) =>
                    curr.length > acc.length ? curr : acc
                )
            )
            .each(function () {
                leftPadding =
                    this.getComputedTextLength() + 2 * labelHorizontalPadding;
                // Times 2 because the computed text length is a little too small
                this.remove();
            });

        // Set up scales
        const x = d3
            .scaleLinear()
            .domain([0, d3.max(ticks)])
            .range([leftPadding, width - rightPadding]);

        const y = d3
            .scaleBand()
            .domain(data.map(d => d.label))
            .range([height - bottomPadding, 0])
            .padding(0.25);

        // Set up axes
        const xAxis = g =>
            g
                .attr("transform", `translate(0, ${height - bottomPadding})`)
                .call(
                    d3
                        .axisTop(x)
                        .tickValues(ticks)
                        .tickFormat(val => `${val}` + (percentage ? "%" : ""))
                        .tickSize(height)
                )
                .call(g => g.select(".domain").remove())
                .call(g =>
                    g
                        .selectAll(".tick line")
                        .attr("stroke", "#646464")
                        .attr("stroke-dasharray", "2")
                )
                .call(g =>
                    g
                        .selectAll(".tick text")
                        .attr("y", 0)
                        .attr("dy", 16)
                        .attr("fill", "#646464")
                );

        const yAxis = g =>
            g
                .attr("transform", `translate(${leftPadding}, 0)`)
                .call(d3.axisLeft(y).tickSize(0))
                .call(g => g.select(".domain").remove())
                .call(g =>
                    g
                        .selectAll(".tick text")
                        .attr("font-size", "11px")
                        .attr("x", 0)
                        .attr("dx", -labelHorizontalPadding)
                );

        const stash = function (d) {
            this.previousValue = d.value;
        };

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        // Draw and update axes
        svg.selectAll(".x-axis")
            .data([{ dimensions }])
            .join(
                enter => enter.append("g").attr("class", "x-axis").call(xAxis),
                update => update.call(xAxis)
            );
        svg.selectAll(".y-axis")
            .data([{ data, dimensions }])
            .join(
                enter =>
                    enter
                        .append("g")
                        .attr("class", "y-axis")
                        .call(yAxis)
                        .attr("opacity", 1),
                update => {
                    update
                        .transition()
                        .duration(transitionDuration / 2)
                        .ease(d3.easeLinear)
                        .attr("opacity", 0);
                    update
                        .transition()
                        .duration(0)
                        .delay(transitionDuration / 2)
                        .call(yAxis)
                        .transition()
                        .duration(transitionDuration / 2)
                        .ease(d3.easeLinear)
                        .attr("opacity", 1);
                }
            );

        // Draw data
        svg.selectAll(".dataRect")
            .data(data)
            .join(
                enter => {
                    const bars = enter.append("g").attr("class", "dataRect");
                    bars.append("rect")
                        .attr("fill", d => d.color)
                        .attr("x", x(0))
                        .attr("y", d => y(d.label))
                        .attr("width", 0)
                        .attr("height", y.bandwidth());
                    bars.append("text")
                        .text(percentage ? "0%" : "0")
                        .attr("fill", d =>
                            d.value > positionThreshold
                                ? d.textColor
                                : "#ffffff"
                        )
                        .style("font-size", "11px")
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", d =>
                            d.value > positionThreshold ? "end" : "start"
                        )
                        .attr("x", x(0))
                        .attr("y", d => y(d.label))
                        .attr(
                            "dx",
                            d =>
                                (d.value > positionThreshold ? -1 : 1) *
                                labelHorizontalPadding
                        )
                        .attr("dy", y.bandwidth() / 2)
                        .each(stash);

                    const draw = bars
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear);
                    draw.select("rect").attr("width", d => x(d.value) - x(0));
                    draw.select("text")
                        .textTween(d => {
                            return t =>
                                `${d3.interpolateRound(0, d.value)(t)}` +
                                (percentage ? "%" : "");
                        })
                        .attr("x", d => x(d.value))
                        .attr(
                            "dx",
                            d =>
                                (d.value > positionThreshold ? -1 : 1) *
                                labelHorizontalPadding
                        );
                },
                update => {
                    const transition = update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear);
                    transition
                        .select("rect")
                        .attr("fill", d => d.color)
                        .attr("x", x(0))
                        .attr("y", d => y(d.label))
                        .attr("width", d => x(d.value) - x(0))
                        .attr("height", y.bandwidth());
                    transition
                        .select("text")
                        .attr("text-anchor", d =>
                            d.value > positionThreshold ? "end" : "start"
                        )
                        .attr("fill", d =>
                            d.value > positionThreshold
                                ? d.textColor
                                : "#ffffff"
                        )
                        .textTween(function (d) {
                            return t =>
                                `${d3.interpolateRound(
                                    this.previousValue,
                                    d.value
                                )(t)}` + (percentage ? "%" : "");
                        })
                        .attr("x", d => x(d.value))
                        .attr("y", d => y(d.label))
                        .attr(
                            "dx",
                            d =>
                                (d.value > positionThreshold ? -1 : 1) *
                                labelHorizontalPadding
                        )
                        .attr("dy", y.bandwidth() / 2);
                    transition
                        .end()
                        .then(() => {
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
