
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = '#3b82f6' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const chartData = useMemo(() => data.map((val, i) => ({ val, i })), [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    const initialWidth = containerRef.current.offsetWidth;
    const initialHeight = containerRef.current.offsetHeight;
    if (initialWidth > 0 && initialHeight > 0) {
      setDimensions({ width: initialWidth, height: initialHeight });
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full min-w-[100px] flex items-center justify-center overflow-hidden">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <LineChart width={dimensions.width} height={dimensions.height} data={chartData}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </div>
  );
};
