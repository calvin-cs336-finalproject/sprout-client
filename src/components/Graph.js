import React from "react";
import { LinePath } from "@visx/shape";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";

const Graph = ({ data, width = 600, height = 250 }) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Accessors
  const getX = (d) => new Date(d.date); // Parse date strings into Date objects
  const getY = (d) => d.close;

  // Scales
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

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Line Path */}
        <LinePath
          data={data}
          x={(d) => xScale(getX(d))}
          y={(d) => yScale(getY(d))}
          stroke="#3b82f6" // Blue color for the line
          strokeWidth={1}
          curve={curveMonotoneX} // Smooth line
        />

        {/* X-Axis */}
        <AxisBottom
          scale={xScale}
          top={innerHeight}
          tickFormat={(d) => d.toLocaleDateString().split("/2024")[0]}
        />

        {/* Y-Axis */}
        <AxisLeft scale={yScale} />
      </Group>
    </svg>
  );
};

export default Graph;
