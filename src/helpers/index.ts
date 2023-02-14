import * as React from "react";

import * as d3 from "d3";

export const useParentDimensions = (ref: React.MutableRefObject<any>) => {
    const [dimensions, setDimensions] = React.useState({
        width: 0,
        height: 0,
    });

    React.useEffect(() => {
        const observer = new ResizeObserver(containers =>
            containers.forEach(container =>
                setDimensions({
                    width: container.contentRect.width,
                    height: container.contentRect.height,
                })
            )
        );
        const container = d3.select(ref.current.parentNode).node();
        observer.observe(container);
        return () => observer.unobserve(container);
    }, [ref]);

    return dimensions;
};

export const useWindowDimensions = () => {
    const hasWindow = typeof window !== "undefined";

    const getWindowDimensions = () => ({
        width: hasWindow ? window.innerWidth : null,
        height: hasWindow ? window.innerHeight : null,
    });

    const [windowDimensions, setWindowDimensions] = React.useState(
        getWindowDimensions()
    );

    React.useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        if (hasWindow) {
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        } else {
            return () => {};
        }
    }, []);

    return windowDimensions;
};

export const luminance = (color: string): number => {
    const hex = parseInt(color.slice(1), 16);
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = (hex >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
