// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./VerticalBarGraph.module.scss";

interface Props {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    initialDrawDuration: number;
    transitionDuration: number;
}

export const VerticalBarGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { initialDrawDuration, transitionDuration, data } = props;

        const { width, height } = dimensions;

        let bottomPadding;
        let leftPadding;
        const rightPadding = 0;
        const topPadding = 20;
        const labelVerticalPadding = 8;

        // Shift up based on the length of the longest name
        svg.append("text")
            .attr("font-size", "10px")
            .attr("opacity", 0)
            .text(data[0].label)
            .each(function () {
                bottomPadding = this.getBBox().height + labelVerticalPadding;
                this.remove();
            });

        svg.append("text")
            .attr("font-size", "10px")
            .attr("opacity", 0)
            .text("100%")
            .each(function () {
                leftPadding = this.getComputedTextLength();
                this.remove();
            });

        // Set up scales
        const x = d3
            .scaleBand()
            .domain(data.map(d => d.label))
            .range([leftPadding, width - rightPadding])
            .padding(0.25);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height - bottomPadding, topPadding]);

        // Set up axes
        const xAxis = g =>
            g
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisTop(x).tickSize(0))
                .call(g => g.select(".domain").remove());

        const yAxis = g =>
            g
                .attr("transform", `translate(0, 0)`)
                .call(
                    d3
                        .axisRight(y)
                        .tickValues([0, 50, 100])
                        .tickFormat(val => `${val}%`)
                        .tickSize(width)
                )
                .call(g => g.select(".domain").remove())
                .call(g =>
                    g
                        .selectAll(".tick line")
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2")
                )
                .call(g =>
                    g.selectAll(".tick text").attr("x", 0).attr("dy", -4)
                );

        const stash = function (d) {
            this.previousValue = d.value;
        };

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        // Draw and update axes
        svg.selectAll(".x-axis")
            .data([{ data, dimensions }])
            .join(
                enter =>
                    enter
                        .append("g")
                        .attr("class", "x-axis")
                        .call(xAxis)
                        .attr("opacity", 1),
                update => {
                    // Transition only if the labels have changed
                    const prev = update.selectAll(".tick text").data();
                    const curr = data.map(d => d.label);
                    if (prev.every((label, i) => label === curr[i])) {
                        update.call(xAxis);
                    } else {
                        update
                            .transition()
                            .duration(transitionDuration / 2)
                            .ease(d3.easeLinear)
                            .attr("opacity", 0)
                            .transition()
                            .duration(0)
                            .delay(transitionDuration / 2)
                            .call(xAxis)
                            .transition()
                            .duration(transitionDuration / 2)
                            .ease(d3.easeLinear)
                            .attr("opacity", 1);
                    }
                }
            );
        svg.selectAll(".y-axis")
            .data([{ dimensions }])
            .join(
                enter => enter.append("g").attr("class", "y-axis").call(yAxis),
                update => update.call(yAxis)
            );

        // Draw data
        svg.selectAll(".dataRect")
            .data(data)
            .join(
                enter => {
                    const bars = enter.append("g").attr("class", "dataRect");
                    bars.append("rect")
                        .attr("fill", d => d.color)
                        .attr("x", d => x(d.label))
                        .attr("y", y(0))
                        .attr("width", x.bandwidth())
                        .attr("height", 0);
                    bars.append("text")
                        .text("0%")
                        .attr("fill", d =>
                            d.value > 90 ? d.textColor : "#ffffff"
                        )
                        .style("font-size", "10px")
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "central")
                        .attr("x", d => x(d.label))
                        .attr("y", d => y(0))
                        .attr("dx", x.bandwidth() / 2)
                        .attr(
                            "dy",
                            d => (d.value > 90 ? 1 : -1) * labelVerticalPadding
                        )
                        .each(stash);

                    const draw = bars
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear);
                    draw.select("rect")
                        .attr("y", d => y(d.value))
                        .attr("height", d => y(0) - y(d.value));
                    draw.select("text")
                        .textTween(function (d) {
                            return t =>
                                `${d3.interpolateRound(0, d.value)(t)}%`;
                        })
                        .attr("y", d => y(d.value));
                },
                update => {
                    const transition = update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear);
                    transition
                        .select("rect")
                        .attr("fill", d => d.color)
                        .attr("x", d => x(d.label))
                        .attr("y", d => y(d.value))
                        .attr("width", x.bandwidth())
                        .attr("height", d => y(0) - y(d.value));
                    transition
                        .select("text")
                        .attr("fill", d =>
                            d.value > 90 ? d.textColor : "#ffffff"
                        )
                        .textTween(function (d) {
                            return t =>
                                `${d3.interpolateRound(
                                    this.previousValue,
                                    d.value
                                )(t)}%`;
                        })
                        .attr("x", d => x(d.label))
                        .attr("y", d => y(d.value))
                        .attr("dx", x.bandwidth() / 2)
                        .attr(
                            "dy",
                            d => (d.value > 90 ? 1 : -1) * labelVerticalPadding
                        );
                    transition
                        .end()
                        .then(() => update.select("text").each(stash))
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
