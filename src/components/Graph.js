// Imports from react
import React from "react";

// Imports from visx
import { LinePath } from "@visx/shape";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";

// Other imports
import { bisector } from "d3-array";

// Our graph component
const Graph = ({ data, width = 600, height = 250 }) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Accessors for X and Y values
  const getX = (d) => new Date(d.date);
  const getY = (d) => d.close;

  // Scales on the graph
  const xScale = scaleTime({
    domain: [Math.min(...data.map(getX)), Math.max(...data.map(getX))],
    range: [0, innerWidth],
  });
  const yScale = scaleLinear({
    domain: [
      Math.min(...data.map(getY)) * 0.9,
      Math.max(...data.map(getY)) * 1.1,
    ],
    range: [innerHeight, 0], // Invert Y-axis
  });

  // Determine line color based on trend of the current stock
  const firstValue = getY(data[0]);
  const lastValue = getY(data[data.length - 1]);
  const lineColor = lastValue > firstValue ? "green" : "red";

  // Tooltip for graph highlighting
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltip();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  const bisectDate = bisector(d => new Date(d.date)).left;

  // Check for mouse movement on the graph
  const handleMouseMove = (event) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    const index = bisectDate(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;
    if (d1 && getX(d1)) {
      d = x0 - getX(d0) > getX(d1) - x0 ? d1 : d0;
    }
    showTooltip({
      tooltipData: d,
      tooltipLeft: xScale(getX(d)),
      tooltipTop: yScale(getY(d)),
    });
  };

  // Return the graph with all the proper elements
  return (
    <div ref={containerRef}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Line Path with correct data*/}
          <LinePath
            data={data}
            x={(d) => xScale(getX(d))}
            y={(d) => yScale(getY(d))}
            stroke={lineColor}
            strokeWidth={1}
            curve={curveMonotoneX}
          />

          {/* X-Axis */}
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            tickFormat={(d) => d.toLocaleDateString().split("/2024")[0]}
          />

          {/* Y-Axis */}
          <AxisLeft scale={yScale} />

          {/* Overlay for capturing mouse events from the user */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={hideTooltip}
          />
        </Group>
      </svg>

      {/* Tooltip for the graph from mouse hovering */}
      {tooltipData && (
        <TooltipInPortal
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '4px',
          }}
        >
          <div>
            <strong>{getX(tooltipData).toLocaleDateString()}</strong>
          </div>
          <div>
            <strong>{getY(tooltipData).toFixed(2)}</strong>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

export default Graph;