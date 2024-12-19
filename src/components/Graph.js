// Imports from React
import React, { useMemo, useCallback } from "react";

// Imports from visx
import { AreaClosed, Line, LinePath, Bar } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { scaleTime, scaleLinear } from "@visx/scale";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { curveLinear } from "@visx/curve";
import { min, max, extent, bisector } from "@visx/vendor/d3-array";
import { timeFormat } from "@visx/vendor/d3-time-format";

// Styling and utility constants
export const background = "#3b6978";
export const background2 = "#204051";
export const accentColor = "#edffea";
export const accentColorDark = "#75daad";
const tooltipStyles = {
  ...defaultStyles,
  background: "white",
  border: "1px solid black",
  color: "black",
};

// Accessors and formatting utilities
const formatDate = timeFormat("%b %d, '%y");
const getDate = (d) => new Date(d.date);
const getStockValue = (d) => d.close;
const bisectDate = bisector((d) => new Date(d.date)).left;

const Graph = withTooltip(
  ({
    data,
    width = 400,
    height = 250,
    margin = 8,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }) => {
    if (width < 10) return null;

    const innerWidth = width - 16;
    const innerHeight = height - 16;

    // Scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin, innerWidth + margin],
          domain: extent(data, getDate),
        }),
      [innerWidth, margin, data]
    );
    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin, margin],
          domain: [
            min(data, getStockValue) * 0.9,
            max(data, getStockValue) * 1.05,
          ],
          nice: true,
        }),
      [margin, innerHeight, data]
    );

    const firstValue = getStockValue(data[0]);
    const lastValue = getStockValue(data[data.length - 1]);
    const lineColor = lastValue > firstValue ? "#14ae5c" : "#ec3936";
    const gradientStart = lastValue > firstValue ? "#14ae5c50" : "#ec393650";
    const gradientEnd = lastValue > firstValue ? "#14ae5c10" : "#ec393610";
    const rotation = lastValue > firstValue ? -10 : 10;

    // Tooltip handler
    const handleTooltip = useCallback(
      (event) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d =
            x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: dateScale(getDate(d)),
          tooltipTop: stockValueScale(getStockValue(d)),
        });
      },
      [showTooltip, dateScale, stockValueScale, data]
    );

    return (
      <div>
        <svg width={width} height={height}>
          <LinePath
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            stroke={lineColor}
            strokeWidth={2}
            curve={curveLinear}
          />
          <LinearGradient
            id="area-gradient"
            from={gradientStart}
            to={gradientEnd}
            toOpacity={0.6}
            rotate={rotation}
          />
          <AreaClosed
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            yScale={stockValueScale}
            fill="url(#area-gradient)"
            curve={curveLinear}
          />
          <Bar
            x={margin}
            y={margin}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin }}
                to={{ x: tooltipLeft, y: innerHeight + margin }}
                stroke={lineColor}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={lineColor}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {`$${getStockValue(tooltipData)}`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin - 14}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                background: "white",
                border: "1px solid black",
                color: "black",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);

export default Graph;
