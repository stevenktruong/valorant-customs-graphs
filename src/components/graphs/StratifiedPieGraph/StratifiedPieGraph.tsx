// @ts-nocheck
import * as d3 from "d3";
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

// TODO: Helper function to avoid overlapping stratum label
// Simulated annealing
// Energy should penalize distance from the desired position and overlaps with labels
const computeStratumLabelShifts = (
    stratumLabelBoxes,
    labelBoxes,
    width,
    height
) => {
    // Each box should look like
    // {
    //     x0: initial left x-coordinate
    //     x1: initial right x-coordinate
    //     y0: initial top y-coordinate
    //     y1: initial bottom y-coordinate
    //
    //     Will add the following fields:
    //     dx: horizontal shifts
    //     dy: vertical shifts
    // }
    const randomSign = () => (Math.random() < 0.5 ? -1 : 1);

    const shiftDistance2 = box => {
        return Math.pow(box.dx, 2) + Math.pow(box.dy, 2);
    };

    const overlapPaddedArea = (boxA, boxB) => {
        // Avoid scenarios where labels are flush against each other
        const padding = 5;

        // Intersection of boxA.x0 <= x <= boxA.x1 and boxB.x0 <= x <= boxB.x1
        // If x1 <= x0 then they don't intersect
        const x0 = Math.max(boxA.x0, boxB.x0) - padding;
        const x1 = Math.min(boxA.x1, boxB.x1) + padding;
        if (x1 <= x0) return 0;

        const y0 = Math.max(boxA.y0, boxB.y0) - padding;
        const y1 = Math.min(boxA.y1, boxB.y1) + padding;
        if (y1 <= y0) return 0;

        const A = (y1 - y0) * (x1 - x0);
        return A;
    };

    const E = stratumLabelBox => {
        let energy = 0;
        energy += shiftDistance2(stratumLabelBox);
        energy += 0.125 * Math.max(-stratumLabelBox.x0, 0);
        energy += 0.125 * Math.max(width - stratumLabelBox.x0, 0);
        energy += 0.125 * Math.max(-stratumLabelBox.y0, 0);
        energy += 0.125 * Math.max(height - stratumLabelBox.y1, 0);
        for (let labelBox of labelBoxes) {
            if (stratumLabelBox.label === labelBox.label) continue;
            energy += 10 * overlapPaddedArea(stratumLabelBox, labelBox);
        }
        return energy;
    };

    const pAccept = (oldE, newE, T) =>
        newE < oldE ? 1 : Math.exp((oldE - newE) / T);

    // Ensure that all labels are inside to begin with
    for (let stratumLabelBox of stratumLabelBoxes) {
        while (stratumLabelBox.x0 < 0) {
            stratumLabelBox.x0 += 5;
            stratumLabelBox.x1 += 5;
            stratumLabelBox.dx += 5;
        }

        while (stratumLabelBox.x1 > width) {
            stratumLabelBox.x0 -= 5;
            stratumLabelBox.x1 -= 5;
            stratumLabelBox.dx -= 5;
        }

        while (stratumLabelBox.y0 < 0) {
            stratumLabelBox.y0 -= 5;
            stratumLabelBox.y1 -= 5;
            stratumLabelBox.dy -= 5;
        }

        while (stratumLabelBox.y1 > height) {
            stratumLabelBox.y0 -= 5;
            stratumLabelBox.y1 -= 5;
            stratumLabelBox.dy -= 5;
        }
    }

    const nItr = 5000;
    for (let n = 0; n < nItr; n++) {
        const T = 1000 * (1 - (n + 1) / nItr);
        const i = Math.floor(Math.random() * stratumLabelBoxes.length);
        const stratumLabelBoxNew = {
            ...stratumLabelBoxes[i],
        };

        const dx = 5 * randomSign();
        const dy = 5 * randomSign();

        if (
            stratumLabelBoxNew.x0 + dx >= 0 &&
            stratumLabelBoxNew.x1 + dx <= width
        ) {
            stratumLabelBoxNew.x0 += dx;
            stratumLabelBoxNew.x1 += dx;
            stratumLabelBoxNew.dx += dx;
        }

        if (
            stratumLabelBoxNew.y0 + dy >= 0 &&
            stratumLabelBoxNew.y1 + dy <= height
        ) {
            stratumLabelBoxNew.y0 += dy;
            stratumLabelBoxNew.y1 += dy;
            stratumLabelBoxNew.dy += dy;
        }

        const oldE = E(stratumLabelBoxes[i]);
        const newE = E(stratumLabelBoxNew);
        if (Math.random() < pAccept(oldE, newE, T)) {
            stratumLabelBoxes[i] = stratumLabelBoxNew;
        }
    }

    return stratumLabelBoxes.map(stratumLabelBox => ({
        dx: stratumLabelBox.dx,
        dy: stratumLabelBox.dy,
    }));
};

// Helper function to compute shifts needed to avoid overlapping labels via a greedy algorithm
const computeArcLabelShifts = (labelCoordinates, labelHeight) => {
    // A misnomer; boxA should be above boxB also
    const intersecting = (boxA, boxB) =>
        boxA.handle && boxB.handle && boxA.maxY > boxB.minY;

    const boxes = labelCoordinates
        .map((d, i) => ({
            handle: d.handle, // false if the label isn't visible or is an outer label
            left: d.left, // left labels can only intersect with left ones and vice versa
            minY: d.y - labelHeight / 2,
            maxY: d.y + labelHeight / 2,
            index: i,
            shift: 0,
        }))
        .sort((a, b) => b.minY - a.minY);

    const aboveBoxes = { left: [], right: [] };
    const belowBoxes = { left: [], right: [] };

    for (let box of boxes) {
        if (!box.handle) continue;
        if (box.minY <= 0) aboveBoxes[box.left ? "left" : "right"].push(box);
        if (box.maxY >= 0) belowBoxes[box.left ? "left" : "right"].push(box);
    }

    for (let direction of ["left", "right"]) {
        const currAboveBoxes = aboveBoxes[direction];
        for (let i = 1; i < currAboveBoxes.length; i++) {
            let shift = 0;
            while (intersecting(currAboveBoxes[i], currAboveBoxes[i - 1])) {
                shift += 1;
                if (shift > 10) break;
                currAboveBoxes[i].minY -= labelHeight;
                currAboveBoxes[i].maxY -= labelHeight;
            }
            currAboveBoxes[i].shift = shift;
        }

        const currBelowBoxes = belowBoxes[direction];
        for (let i = currBelowBoxes.length - 2; i >= 0; i--) {
            let shift = 0;
            while (intersecting(currBelowBoxes[i + 1], currBelowBoxes[i])) {
                shift += 1;
                if (shift > 10) break;
                currBelowBoxes[i].minY += labelHeight;
                currBelowBoxes[i].maxY += labelHeight;
            }
            currBelowBoxes[i].shift = shift;
        }
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
                stratumLabelDistance =
                    longestLabelLength * 0.75 + radialPadding;
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

        // Shift arc labels to avoid overlaps
        const cacheArcLabelShifts = selection => {
            const shifts = computeArcLabelShifts(
                selection.data().map(d => ({
                    handle: d.depth === 2 && showLabel(d),
                    left: direction(d) < 0,
                    y: outerPoint(d)[1],
                })),
                labelHeight
            );
            selection.each((d, i) => (d.shift = shifts[i]));
        };

        const nStrata = root.children.length;
        const cacheStratumLabelShifts = selection => {
            if (selection.empty()) return;

            const labelBoxes = [];

            selection
                .filter(d => d.depth === 1)
                .selectAll("text")
                .each(d => {
                    const boxCenterY = stratumPoint(d).map(
                        (c, i) => c + center[i]
                    );
                    labelBoxes.push({
                        label: d.id,
                        handle: true,
                        x0: boxCenterY[0],
                        y0: boxCenterY[1],
                    });
                });

            selection
                .selectAll("text")
                .filter(d => d.depth === 2)
                .each(d => {
                    const boxCenterY = [
                        outerPoint(d)[0] + center[0] + direction(d) * 12,
                        outerPoint(d)[1] + center[1],
                    ];
                    labelBoxes.push({
                        label: d.id,
                        handle: showLabel(d),
                        x0: boxCenterY[0],
                        y0: boxCenterY[1],
                    });
                });

            selection
                .selectAll("text")
                .nodes()
                .forEach((text, i) => {
                    const box = text.getBBox();
                    labelBoxes[i].x0 +=
                        (text.getAttribute("text-anchor") === "end" ? -1 : 0) *
                        box.width;
                    labelBoxes[i].x1 = labelBoxes[i].x0 + box.width;
                    labelBoxes[i].y0 -= box.height / 2;
                    labelBoxes[i].y1 = labelBoxes[i].y0 + box.height;
                    labelBoxes[i].dx = 0;
                    labelBoxes[i].dy = 0;
                });

            const shifts = computeStratumLabelShifts(
                labelBoxes.slice(0, nStrata),
                labelBoxes.filter(box => box.handle),
                width,
                height
            );

            selection
                .filter(d => d.depth === 1)
                .each((d, i) => {
                    d.dx = shifts[i].dx;
                    d.dy = shifts[i].dy;
                });
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
                    enter.call(cacheArcLabelShifts);

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
                        .attr("class", "stratumLabel")
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
                    enter.call(cacheStratumLabelShifts);
                    pieArc
                        .filter(d => d.depth === 1)
                        .select("text")
                        .attr("dx", d => d.dx)
                        .attr("dy", d => d.dy);

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
                    update.call(cacheArcLabelShifts);

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
                        );

                    update.call(cacheStratumLabelShifts);

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
                        .attr("dx", d => d.dx)
                        .attr("dy", d => d.dy)
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
