import * as d3 from "d3";
import * as React from "react";

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
