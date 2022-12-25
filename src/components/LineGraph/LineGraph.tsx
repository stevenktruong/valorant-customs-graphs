// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./LineGraph.module.css";

interface Props {
    data: {
        date: Date;
        value: number;
    }[];
    color: string;
    margin: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}

export const LineGraph = (props: Props) => {
    const initialDrawDuration = 1000;
    const playerChangeTransitionDuration = 1000;

    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { data, color, margin } = props;

        const { width: svgWidth, height: svgHeight } = dimensions;

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        // Set up scales
        const x = d3
            .scaleTime()
            .domain(d3.extent(data.map((d) => d.date)))
            .range([margin.left + 40, margin.left + width - 40]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
            .range([margin.top + height - 40, margin.top + 40]);

        // Set up axes
        const xAxis = (g) =>
            g
                .attr("transform", `translate(0, ${margin.top + height - 40})`)
                .call(
                    d3
                        .axisTop(x)
                        .tickValues(data.map((d) => d.date))
                        .tickFormat(d3.timeFormat("%_m/%d/%y"))
                        .tickSize(height - 40)
                )
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .selectAll(".tick line")
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2")
                )
                .call((g) =>
                    g.selectAll(".tick text").attr("y", 0).attr("dy", 16)
                )
                .call((g) =>
                    g
                        .select(".tick:last-of-type line")
                        .attr("y1", 16)
                        .attr("stroke-opacity", 1)
                        .attr("stroke-dasharray", "4")
                )
                .call((g) =>
                    g
                        .select(".tick:last-of-type text")
                        .text("today")
                        .attr("dy", 32)
                );

        const yAxis = (g) =>
            g
                .attr("transform", `translate(${margin.left}, 0)`)
                .call(
                    d3
                        .axisRight(y)
                        .tickValues([0, 25, 50, 75, 100])
                        .tickSize(width)
                        .tickFormat((val) => `${val}%`)
                )
                .call((g) => g.select(".domain").remove())
                .call((g) =>
                    g
                        .selectAll(".tick:not(:first-of-type) line")
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2")
                )
                .call((g) =>
                    g.selectAll(".tick text").attr("x", 4).attr("dy", -4)
                );

        // Draw data
        const dataArea = d3
            .area()
            .x((d) => x(d.date))
            .y0((d) => y(0))
            .y1((d) => y(d.value));

        const dataLine = d3
            .line()
            .x((d) => x(d.date))
            .y((d) => y(d.value));

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        // "Animates" drawing from left to right
        // Draws and updates the clipping rectangle
        svg.selectAll("#clip")
            .data([{ dimensions, margin }])
            .join(
                (enter) =>
                    enter
                        .append("clipPath")
                        .attr("id", "clip")
                        .append("rect")
                        .attr("width", 0)
                        .attr("height", svgHeight)
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .attr("width", x(data[data.length - 1].date) + 20),
                (update) =>
                    update
                        .select("#clip rect")
                        .attr("height", svgHeight)
                        .attr("width", svgWidth)
            );

        // Draw and update axes
        svg.selectAll(".x-axis")
            .data([{ dimensions, margin }])
            .join(
                (enter) =>
                    enter.append("g").attr("class", "x-axis").call(xAxis),
                (update) => update.call(xAxis)
            );
        svg.selectAll(".y-axis")
            .data([{ dimensions, margin }])
            .join(
                (enter) =>
                    enter.append("g").attr("class", "y-axis").call(yAxis),
                (update) => update.call(yAxis)
            );

        // Draw and update data
        svg.selectAll("#dataArea")
            .data([data])
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("id", "dataArea")
                        .attr("fill", color)
                        .attr("fill-opacity", 0.25)
                        .attr("d", dataArea(data))
                        .attr("clip-path", "url(#clip)"),
                (update) =>
                    update
                        .transition()
                        .duration(playerChangeTransitionDuration)
                        .attr("fill", color)
                        .attr("d", dataArea(data))
            );
        svg.selectAll("#dataLine")
            .data([data])
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("id", "dataLine")
                        .attr("stroke", color)
                        .attr("stroke-width", "3")
                        .attr("fill-opacity", 0)
                        .attr("d", dataLine(data))
                        .attr("clip-path", "url(#clip)"),
                (update) =>
                    update
                        .transition()
                        .duration(playerChangeTransitionDuration)
                        .attr("stroke", color)
                        .attr("d", dataLine(data))
            );
        svg.selectAll(".point")
            .data(data)
            .join(
                (enter) => {
                    const point = enter.append("g").attr("class", "point");
                    point
                        .append("circle")
                        .attr("fill", color)
                        .attr("stroke", "none")
                        .attr("cx", (d) => x(d.date))
                        .attr("cy", (d) => y(d.value))
                        .attr("r", 5)
                        .attr("clip-path", "url(#clip)");
                    point
                        .append("text")
                        .attr("x", (d) => x(d.date))
                        .attr("y", (d) => y(d.value))
                        .attr("dy", -12)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#ffffff")
                        .style("font-size", "12px")
                        .text((d) => `${d.value}%`)
                        .attr("clip-path", "url(#clip)");
                },
                (update) => {
                    update
                        .select("circle")
                        .transition()
                        .duration(playerChangeTransitionDuration)
                        .attr("fill", color)
                        .attr("cx", (d) => x(d.date))
                        .attr("cy", (d) => y(d.value));
                    update
                        .select("text")
                        .transition()
                        .duration(playerChangeTransitionDuration)
                        .textTween(function (d) {
                            const start = d3.select(this).text().split("%")[0];
                            return (t) =>
                                `${d3.interpolateRound(start, d.value)(t)}%`;
                        })
                        .attr("x", (d) => x(d.date))
                        .attr("y", (d) => y(d.value));
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};
