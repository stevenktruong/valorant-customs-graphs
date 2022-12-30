// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

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

        let leftPadding; // Shift left based on the length of "100%"
        let bottomPadding;
        let rotatedTextHeight; // Shift up based on the diagonal text

        const rightPadding = 40;
        const topPadding = 20;
        const labelPadding = 4;

        svg.append("text")
            .attr("font-size", "10px")
            .attr("opacity", 0)
            .text("100%")
            .each(function () {
                leftPadding =
                    this.getComputedTextLength() + labelHorizontalPadding;
                this.remove();
            });

        svg.append("text")
            .attr("font-size", "10px")
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
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2")
                )
                .call(g =>
                    g
                        .selectAll(".tick text")
                        .attr("fill", "#c8c8c8")
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
                        // .attr("y1", 16)
                        .attr("stroke-opacity", 1)
                        .attr("stroke-dasharray", "4")
                )
                .call(
                    g => g.select(".tick:last-of-type text").remove()
                    // .text("today")
                    // .attr("dy", 32)
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
                    g.selectAll(".tick text").attr("x", 0).attr("dy", -4)
                );

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
                        .style("font-size", "10px")
                        .text(d => `${d.value}%`)
                        .attr("clip-path", "url(#clip)");
                    point
                        .select(".point:last-of-type text")
                        .attr("dx", 8)
                        .attr("dy", 0)
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", "start");
                },
                update => {
                    update
                        .select("circle")
                        .transition()
                        .duration(transitionDuration)
                        .attr("fill", color)
                        .attr("cx", d => x(d.date))
                        .attr("cy", d => y(d.value));
                    update
                        .select("text")
                        .transition()
                        .duration(transitionDuration)
                        .textTween(function (d) {
                            const start = d3.select(this).text().split("%")[0];
                            return t =>
                                `${d3.interpolateRound(start, d.value)(t)}%`;
                        })
                        .attr("x", d => x(d.date))
                        .attr("y", d => y(d.value));
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};