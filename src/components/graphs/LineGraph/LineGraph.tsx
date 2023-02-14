// @ts-nocheck
import * as React from "react";

import * as d3 from "d3";

import { useParentDimensions } from "helpers";

import style from "./LineGraph.module.scss";

interface Props {
    data: {
        date: Date;
        value: number;
    }[];
    color: string;
    initialDrawDuration: number;
    transitionDuration: number;
}

export const LineGraph = (props: Props) => {
    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { initialDrawDuration, transitionDuration, data, color } = props;

        const { width, height } = dimensions;

        const labelHorizontalPadding = 8;
        const labelVerticalPadding = 8;

        let leftPadding; // Shift left based on the length of "100%"
        let bottomPadding;
        let rotatedTextHeight; // Shift up based on the diagonal text
        let textHeight;

        const rightPadding = 40;
        const topPadding = 20;
        const labelPadding = 4;

        svg.append("text")
            .attr("font-size", "11px")
            .attr("opacity", 0)
            .text("100%")
            .each(function () {
                leftPadding =
                    this.getComputedTextLength() + labelHorizontalPadding;
                textHeight = this.getBBox().height;
                this.remove();
            });

        svg.append("text")
            .attr("font-size", "11px")
            .attr("opacity", 0)
            .text("12/25")
            .each(function () {
                rotatedTextHeight =
                    this.getBBox().width * Math.sin(Math.PI / 6) +
                    this.getBBox().height * Math.cos(Math.PI / 6);
                bottomPadding = rotatedTextHeight + labelPadding;
                this.remove();
            });

        // Set up scales
        const x = d3
            .scaleTime()
            .domain(d3.extent(data.map(d => d.date)))
            .range([leftPadding, width - rightPadding]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .range([height - bottomPadding, topPadding]);

        // Set up axes
        const xAxis = g =>
            g
                .attr("transform", `translate(0, ${height - bottomPadding})`)
                .call(
                    d3
                        .axisTop(x)
                        .tickValues(data.map(d => d.date))
                        .tickFormat(d3.timeFormat("%_m/%d"))
                        .tickSize(height - 30)
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
                        .attr("fill", "#646464")
                        .attr("alignment-baseline", "central")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr(
                            "transform",
                            `translate(4, ${
                                labelPadding + rotatedTextHeight / 2
                            }) rotate(30)`
                        )
                )
                .call(g =>
                    g
                        .select(".tick:last-of-type line")
                        .attr("stroke-opacity", 1)
                        .attr("stroke-dasharray", "4")
                        .attr("y1", -y(100) + topPadding)
                        .attr("y2", -y(0) + textHeight)
                )
                .call(g =>
                    g
                        .select(".tick:last-of-type text")
                        .text("today")
                        .attr("transform", "")
                        .attr("y", -y(0) + textHeight - labelVerticalPadding)
                );

        const yAxis = g =>
            g
                .attr("transform", `translate(0, 0)`)
                .call(
                    d3
                        .axisRight(y)
                        .tickValues([0, 25, 50, 75, 100])
                        .tickSize(width)
                        .tickFormat(val => `${val}%`)
                )
                .call(g => g.select(".domain").remove())
                .call(g =>
                    g
                        .selectAll(".tick:not(:first-of-type) line")
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2")
                )
                .call(g =>
                    g
                        .selectAll(".tick text")
                        .attr("fill", "#646464")
                        .attr("font-size", "11px")
                        .attr("x", 0)
                        .attr("dy", -4)
                );

        const stash = function (d) {
            this.previousValue = d.value;
        };

        // Draw data
        const area = d3
            .area()
            .x(d => x(d.date))
            .y0(d => y(0))
            .y1(d => y(d.value));

        const line = d3
            .line()
            .x(d => x(d.date))
            .y(d => y(d.value));

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        // "Animates" drawing from left to right
        // Draws and updates the clipping rectangle
        svg.selectAll("#clip")
            .data([{ dimensions }])
            .join(
                enter =>
                    enter
                        .append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", 0)
                        .attr("height", height)
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .attr("width", width),
                update =>
                    update
                        .select("#clip rect")
                        .attr("height", height)
                        .attr("width", width)
            );

        // Draw and update axes
        svg.selectAll(".x-axis")
            .data([{ dimensions }])
            .join(
                enter => enter.append("g").attr("class", "x-axis").call(xAxis),
                update => update.call(xAxis)
            );
        svg.selectAll(".y-axis")
            .data([{ dimensions }])
            .join(
                enter => enter.append("g").attr("class", "y-axis").call(yAxis),
                update => update.call(yAxis)
            );

        // Draw and update data
        svg.selectAll("#area")
            .data([data])
            .join(
                enter =>
                    enter
                        .append("path")
                        .attr("id", "area")
                        .attr("fill", color)
                        .attr("fill-opacity", 0.25)
                        .attr("d", area(data))
                        .attr("clip-path", "url(#clip)"),
                update =>
                    update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear)
                        .attr("fill", color)
                        .attr("d", area(data))
            );
        svg.selectAll("#line")
            .data([data])
            .join(
                enter =>
                    enter
                        .append("path")
                        .attr("id", "line")
                        .attr("stroke", color)
                        .attr("stroke-width", "3")
                        .attr("fill-opacity", 0)
                        .attr("d", line(data))
                        .attr("clip-path", "url(#clip)"),
                update =>
                    update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear)
                        .attr("stroke", color)
                        .attr("d", line(data))
            );
        svg.selectAll(".point")
            .data(data)
            .join(
                enter => {
                    const point = enter.append("g").attr("class", "point");
                    point
                        .append("circle")
                        .attr("fill", color)
                        .attr("stroke", "none")
                        .attr("cx", d => x(d.date))
                        .attr("cy", d => y(d.value))
                        .attr("r", 4)
                        .attr("clip-path", "url(#clip)");
                    point
                        .append("text")
                        .attr("x", d => x(d.date))
                        .attr("y", d => y(d.value))
                        .attr("dy", -12)
                        .attr("text-anchor", (d, i) =>
                            i === data.length - 1 ? "start" : "middle"
                        )
                        .attr("fill", "#ffffff")
                        .style("font-size", "11px")
                        .text(d => `${d.value}%`)
                        .attr("clip-path", "url(#clip)")
                        .each(stash);
                    point
                        .select(".point:last-of-type text")
                        .attr("dx", 8)
                        .attr("dy", 0)
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", "start");
                },
                update => {
                    const transition = update
                        .transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear);
                    transition
                        .select("circle")
                        .attr("fill", color)
                        .attr("cx", d => x(d.date))
                        .attr("cy", d => y(d.value));
                    transition
                        .select("text")
                        .textTween(function (d) {
                            return t =>
                                `${d3.interpolateRound(
                                    this.previousValue,
                                    d.value
                                )(t)}%`;
                        })
                        .attr("x", d => x(d.date))
                        .attr("y", d => y(d.value));
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
