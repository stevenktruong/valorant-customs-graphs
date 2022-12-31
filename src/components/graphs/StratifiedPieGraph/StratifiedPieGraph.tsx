// @ts-nocheck
import * as d3 from "d3";
import { debugPort, off } from "process";
import * as React from "react";

import { useParentDimensions } from "helpers";

import style from "./StratifiedPieGraph.module.scss";

interface Props {
    data: {
        label: string;
        parent: string;
        color: string;
        count: number;
    }[];
    initialDrawDuration: number;
    transitionDuration: number;
    percentage?: boolean;
}

// Helper function to compute shifts needed to avoid overlapping labels
const optimizeArcLabels = (labelCoordinates, labelHeight) => {
    // A misnomer; boxA should be above boxB also
    const intersecting = (boxA, boxB) =>
        !(!boxA.handle || !boxB.handle || boxA.maxY <= boxB.minY);

    const boxes = labelCoordinates
        .map((d, i) => ({
            handle: d.handle,
            left: d.left,
            minY: d.y - labelHeight / 2,
            maxY: d.y + labelHeight / 2,
            index: i,
            shift: 0,
        }))
        .sort((a, b) => b.minY - a.minY);

    const aboveLeftBoxes = boxes.filter(
        box => box.minY <= 0 && box.handle && box.left
    );
    for (let i = 1; i < aboveLeftBoxes.length; i++) {
        let shift = 0;
        while (intersecting(aboveLeftBoxes[i], aboveLeftBoxes[i - 1])) {
            shift += 1;
            if (shift > 10) break;
            aboveLeftBoxes[i].minY -= labelHeight;
            aboveLeftBoxes[i].maxY -= labelHeight;
        }
        aboveLeftBoxes[i].shift = shift;
    }

    const aboveRightBoxes = boxes.filter(
        box => box.minY <= 0 && box.handle && !box.left
    );
    for (let i = 1; i < aboveRightBoxes.length; i++) {
        let shift = 0;
        while (intersecting(aboveRightBoxes[i], aboveRightBoxes[i - 1])) {
            shift += 1;
            if (shift > 10) break;
            aboveRightBoxes[i].minY -= labelHeight;
            aboveRightBoxes[i].maxY -= labelHeight;
        }
        aboveRightBoxes[i].shift = shift;
    }

    const belowLeftBoxes = boxes.filter(
        box => box.maxY >= 0 && box.handle && box.left
    );
    for (let i = belowLeftBoxes.length - 2; i >= 0; i--) {
        let shift = 0;
        while (intersecting(belowLeftBoxes[i + 1], belowLeftBoxes[i])) {
            shift += 1;
            if (shift > 10) break;
            belowLeftBoxes[i].minY += labelHeight;
            belowLeftBoxes[i].maxY += labelHeight;
        }
        belowLeftBoxes[i].shift = shift;
    }

    const belowRightBoxes = boxes.filter(
        box => box.maxY >= 0 && box.handle && !box.left
    );
    for (let i = belowRightBoxes.length - 2; i >= 0; i--) {
        let shift = 0;
        while (intersecting(belowRightBoxes[i + 1], belowRightBoxes[i])) {
            shift += 1;
            if (shift > 10) break;
            belowRightBoxes[i].minY += labelHeight;
            belowRightBoxes[i].maxY += labelHeight;
        }
        belowRightBoxes[i].shift = shift;
    }

    return boxes.sort((a, b) => a.index - b.index).map(box => box.shift);
};

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
        let stratumLabelDistance;
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
                stratumLabelDistance = longestLabelLength + radialPadding;
                this.remove();
            });

        const center = [width / 2, height / 2];
        const translateToCenter = g =>
            g.attr("transform", `translate(${center.join(",")})`);

        // R should be the largest number so that
        //   2R + 2 * (2*tickPadding + radialTickLength + horizontalTickLength + longestLabelLength + stratumLabelDistance) <= width
        //   2R + 2 * (2*tickPadding + radialTickLength + horizontalTickLength + labelHeight + stratumLabelDistance)        <= height
        // This way, R is the largest radius so that all text is still contained on the screen
        // when the chart is centered in the svg.
        const R = Math.min(
            width / 2 -
                (2 * tickPadding +
                    radialTickLength +
                    horizontalTickLength +
                    longestLabelLength +
                    stratumLabelDistance),
            height / 2 -
                (2 * tickPadding +
                    radialTickLength +
                    horizontalTickLength +
                    labelHeight +
                    stratumLabelDistance)
        );

        const stratify = d3
            .stratify()
            .id(d => d.label)
            .parentId(d => d.parent);

        const root = stratify(data);
        root.sum(d => d.count);
        d3.partition().size([2 * Math.PI, 3])(root);

        // With the partition above, y0 is equal to the depth in the tree
        // Inner arcs occupy the radii [0.5R, 0.75R], outer arcs occupy [padding + 0.75R, R]
        const innerArcRadiusRatio = 0.75;
        const arc = d3
            .arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(
                d =>
                    R *
                        Math.pow(
                            (d.y0 - 1) / 2,
                            Math.log(innerArcRadiusRatio) / Math.log(0.5)
                        ) +
                    (d.y0 === 2 ? radialPadding : R / 2)
            )
            .outerRadius(
                d =>
                    R *
                    Math.pow(
                        (d.y1 - 1) / 2,
                        Math.log(innerArcRadiusRatio) / Math.log(0.5)
                    )
            )
            .padRadius(R)
            .padAngle(8 / 360);

        const labelInnerArc = d3
            .arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(R + tickPadding)
            .outerRadius(R + tickPadding);
        const labelOuterArc = d3
            .arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(
                d =>
                    R +
                    tickPadding +
                    radialTickLength +
                    (d.shift || 0) * labelHeight
            )
            .outerRadius(
                d =>
                    R +
                    tickPadding +
                    radialTickLength +
                    (d.shift || 0) * labelHeight
            );
        const stratumLabelArc = d3
            .arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(
                R + tickPadding + radialTickLength + stratumLabelDistance
            )
            .outerRadius(
                R + tickPadding + radialTickLength + stratumLabelDistance
            );

        const innerPoint = d => labelInnerArc.centroid(d);
        const outerPoint = d => labelOuterArc.centroid(d);
        const stratumPoint = d => stratumLabelArc.centroid(d);
        const direction = d =>
            outerPoint(d)[0] - innerPoint(d)[0] > 0 ? 1 : -1;

        const label = d =>
            `${d.data.label} ` +
            (percentage
                ? `${Math.round((100 * d.value) / root.value)}%`
                : `${d.value}`);

        // Used to only show labels with a large enough count
        const showLabel = d => d.x1 - d.x0 > 0;
        const hideLabel = d => !showLabel(d);
        const updateLabelVisibility = transition => {
            const hideLabels = transition.filter(hideLabel);
            hideLabels.select(".tick").attr("opacity", 0);
            hideLabels.select("text").attr("opacity", 0);
            const showLabels = transition.filter(showLabel);
            showLabels.select(".tick").attr("opacity", 1);
            showLabels.select("text").attr("opacity", 1);
        };

        // Cache angles for the transition animation
        const stash = function (d) {
            this.previousStartAngle = d.x0;
            this.previousArcAngle = d.x1 - d.x0;
            this.previousShift = d.shift;
        };

        const angleTween = callback =>
            function (d) {
                const startAngle = d3.interpolate(
                    this.previousStartAngle,
                    d.x0
                );
                const arcAngle = d3.interpolate(
                    this.previousArcAngle,
                    d.x1 - d.x0
                );
                const shift = d3.interpolate(this.previousShift, d.shift);
                return t => {
                    d.x0 = startAngle(t);
                    d.x1 = startAngle(t) + arcAngle(t);
                    d.shift = shift(t);
                    return callback(d);
                };
            };

        // Begin updating the svg
        svg.attr("width", "100%").attr("height", "100%");

        svg.selectAll(".pieArc")
            .data(root.descendants().slice(1))
            .join(
                enter => {
                    // Compute offsets to avoid overlapping labels
                    const offsets = optimizeArcLabels(
                        enter.data().map(d => ({
                            handle: d.depth === 2 && showLabel(d),
                            left: direction(d) < 0,
                            y: outerPoint(d)[1],
                        })),
                        labelHeight
                    );
                    enter.each((d, i) => (d.shift = offsets[i]));

                    const pieArc = enter.append("g").attr("class", "pieArc");
                    pieArc
                        .append("path")
                        .attr("class", "arc")
                        .call(translateToCenter)
                        .attr("fill", d => d.data.color)
                        .each(stash);
                    pieArc
                        .filter(d => d.depth === 2)
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
                        .filter(d => d.depth === 2)
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
                                `translate(${outerPoint(d)
                                    .map((c, i) => c + center[i])
                                    .join(",")})`
                        )
                        .each(stash);
                    pieArc
                        .filter(d => d.depth === 1)
                        .append("text")
                        .attr("fill", d => d.data.color)
                        .attr("opacity", 0)
                        .attr("font-size", "18px")
                        .text(label)
                        .attr("alignment-baseline", "central")
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .attr(
                            "transform",
                            d =>
                                `translate(${stratumPoint(d)
                                    .map((c, i) => c + center[i])
                                    .join(",")})`
                        )
                        .each(stash);

                    const draw = pieArc
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration);
                    draw.select(".arc").attrTween("d", d => {
                        const startAngle = d3.interpolate(0, d.x0);
                        const arcAngle = d3.interpolate(0, d.x1 - d.x0);
                        return t => {
                            d.x0 = startAngle(t);
                            d.x1 = startAngle(t) + arcAngle(t);
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
                    draw.call(updateLabelVisibility);
                },
                update => {
                    const offsets = optimizeArcLabels(
                        update.data().map(d => ({
                            handle: d.depth === 2 && showLabel(d),
                            left: direction(d) < 0,
                            y: outerPoint(d)[1],
                        })),
                        labelHeight
                    );
                    update.each((d, i) => (d.shift = offsets[i]));

                    update.select(".arc").call(translateToCenter);
                    update.select(".tick").call(translateToCenter);
                    update
                        .filter(d => d.depth === 2)
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
                    update
                        .filter(d => d.depth === 1)
                        .select("text")
                        .text(label)
                        .attr("text-anchor", d =>
                            direction(d) > 0 ? "start" : "end"
                        )
                        .each(stash);

                    const transition = update
                        .transition()
                        .ease(d3.easeLinear)
                        .duration(initialDrawDuration);
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
                        .filter(d => d.depth === 2)
                        .select("text")
                        .attrTween(
                            "transform",
                            angleTween(
                                d =>
                                    `translate(${outerPoint(d)
                                        .map((c, i) => c + center[i])
                                        .join(",")})`
                            )
                        );
                    transition
                        .filter(d => d.depth === 1)
                        .select("text")
                        .attr("fill", d => d.data.color)
                        .attrTween(
                            "transform",
                            angleTween(
                                d =>
                                    `translate(${stratumPoint(d)
                                        .map((c, i) => c + center[i])
                                        .join(",")})`
                            )
                        );
                    transition.call(updateLabelVisibility);
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
