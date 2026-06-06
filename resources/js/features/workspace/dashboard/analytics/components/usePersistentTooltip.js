import { useState, useEffect, useRef } from 'react';

export function usePersistentTooltip() {
    const chartRef = useRef(null);
    const [lockedElement, setLockedElement] = useState(null);

    useEffect(() => {
        const handleDocumentClick = (e) => {
            const chart = chartRef.current;
            if (chart && chart.canvas && !chart.canvas.contains(e.target)) {
                setLockedElement(null);
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                chart.update();
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [lockedElement]);

    const handleChartClick = (event, elements, chart) => {
        if (elements.length > 0) {
            const element = elements[0];
            const isSame =
                lockedElement &&
                lockedElement.index === element.index &&
                lockedElement.datasetIndex === element.datasetIndex;

            if (isSame) {
                setLockedElement(null);
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            } else {
                const newLock = {
                    datasetIndex: element.datasetIndex,
                    index: element.index,
                    x: event.x,
                    y: event.y,
                };
                setLockedElement(newLock);
                chart.setActiveElements([element]);
                chart.tooltip.setActiveElements([element], { x: event.x, y: event.y });
            }
            chart.update();
        } else {
            setLockedElement(null);
            chart.setActiveElements([]);
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.update();
        }
    };

    const handleChartHover = (event, elements, chart) => {
        if (lockedElement) {
            chart.setActiveElements([lockedElement]);
            chart.tooltip.setActiveElements([lockedElement], { x: lockedElement.x, y: lockedElement.y });
        }
    };

    return {
        chartRef,
        handleChartClick,
        handleChartHover,
    };
}
