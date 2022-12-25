// @ts-nocheck
import * as d3 from "d3";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./BarGraph.module.css";

interface Props {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    margin: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
}

export const BarGraph = (props: Props) => {
    const initialDrawDuration = 1000;

    const svgRef = React.useRef();
    let dimensions = useParentDimensions(svgRef);

    React.useEffect(() => {
        if (dimensions.width === 0 || dimensions.height === 0) return;

        const svg = d3.select(svgRef.current);

        const { data, margin } = props;

        const { width: svgWidth, height: svgHeight } = dimensions;

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        // Set up scales
        const x = d3
            .scaleLinear()
            .domain([0, 100])
            .range([margin.left + 40, margin.left + width]);

        const y = d3
            .scaleBand()
            .domain(data.map((d) => d.label))
            .range([margin.top + height, margin.top])
            .padding(0.25);

        // Set up axes
        const xAxis = (g) =>
            g
                .attr("transform", `translate(0, ${margin.top + height})`)
                .call(
                    d3
                        .axisTop(x)
                        .tickValues([0, 20, 40, 60, 80, 100])
                        .tickFormat((val) => `${val}%`)
                        .tickSize(height)
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
                );

        const yAxis = (g) =>
            g
                .attr("transform", `translate(${margin.left + 35}, 0)`)
                .call(d3.axisLeft(y).tickSize(0))
                .call((g) => g.select(".domain").remove());

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

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

        // Draw data
        svg.selectAll(".dataRect")
            .data(data)
            .join(
                (enter) => {
                    const bars = enter.append("g").attr("class", "dataRect");
                    bars.append("rect")
                        .attr("fill", (d) => d.color)
                        .attr("x", x(0))
                        .attr("y", (d) => y(d.label))
                        .attr("width", 0)
                        .attr("height", y.bandwidth())
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .attr("width", (d) => x(d.value) - x(0));
                    bars.append("text")
                        .text("0%")
                        .attr("fill", "#ffffff")
                        .style("font-size", "12px")
                        .attr("alignment-baseline", "central")
                        .attr("x", x(0))
                        .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
                        .attr("dx", 5)
                        .transition()
                        .duration(initialDrawDuration)
                        .ease(d3.easeLinear)
                        .textTween(function (d) {
                            const start = d3.select(this).text().split("%")[0];
                            return (t) =>
                                `${d3.interpolateRound(start, d.value)(t)}%`;
                        })
                        .attr("x", (d) => x(d.value));
                },
                (update) => {
                    update
                        .select("rect")
                        .attr("fill", (d) => d.color)
                        .attr("x", x(0))
                        .attr("y", (d) => y(d.label))
                        .attr("width", (d) => x(d.value) - x(0))
                        .attr("height", y.bandwidth());
                    update
                        .select("text")
                        .attr("x", (d) => x(d.value))
                        .attr("y", (d) => y(d.label) + y.bandwidth() / 2);
                }
            );
    }, [props, dimensions]);

    return (
        <div className={style.GraphContainer}>
            <svg ref={svgRef} />
        </div>
    );
};
