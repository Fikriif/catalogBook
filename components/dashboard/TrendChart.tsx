'use client';

import React, { useState } from 'react';

interface TrendChartProps {
  data: {
    labels: string[];
    loans: number[];
    returns: number[];
  };
  range: string;
  onRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export function TrendChart({ data, range, onRangeChange, isLoading }: TrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const labels = data.labels || [];
  const loans = data.loans || [];
  const returns = data.returns || [];

  const maxVal = Math.max(5, ...loans, ...returns);

  // SVG Chart Dimensions
  const width = 650;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pointsCount = labels.length;
  const stepX = pointsCount > 1 ? chartWidth / (pointsCount - 1) : chartWidth;

  const getCoordinates = (values: number[]) => {
    return values.map((val, idx) => {
      const x = paddingX + idx * stepX;
      const y = height - paddingY - (val / maxVal) * chartHeight;
      return { x, y, val };
    });
  };

  const loanCoords = getCoordinates(loans);
  const returnCoords = getCoordinates(returns);

  const makePath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth cubic bezier curves
      const prev = coords[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const makeAreaPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    const linePath = makePath(coords);
    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const bottomY = height - paddingY;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const loanPath = makePath(loanCoords);
  const loanArea = makeAreaPath(loanCoords);

  const returnPath = makePath(returnCoords);
  const returnArea = makeAreaPath(returnCoords);

  // Horizontal grid lines
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Tren Aktivitas Sirkulasi
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Perbandingan volume peminjaman dan pengembalian buku
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium mr-2">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              Peminjaman
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Pengembalian
            </span>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
            {(['7d', '30d', '12m'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  range === r
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {r === '7d' ? '7 Hari' : r === '30d' ? '30 Hari' : '12 Bulan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto select-none">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 min-w-[500px] overflow-visible">
          <defs>
            <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLevels.map((lvl, i) => {
            const y = height - paddingY - lvl * chartHeight;
            const labelVal = Math.round(lvl * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-zinc-400 font-mono"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Loan Area & Line */}
          {loanArea && <path d={loanArea} fill="url(#loanGrad)" />}
          {loanPath && (
            <path
              d={loanPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Return Area & Line */}
          {returnArea && <path d={returnArea} fill="url(#returnGrad)" />}
          {returnPath && (
            <path
              d={returnPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points & Hover lines */}
          {labels.map((lbl, idx) => {
            const lPt = loanCoords[idx];
            const rPt = returnCoords[idx];
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={lPt.x}
                    y1={paddingY}
                    x2={lPt.x}
                    y2={height - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point for Loans */}
                <circle
                  cx={lPt.x}
                  cy={lPt.y}
                  r={isHovered ? 5 : 3.5}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Point for Returns */}
                <circle
                  cx={rPt.x}
                  cy={rPt.y}
                  r={isHovered ? 5 : 3.5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* X Axis Label */}
                <text
                  x={lPt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] transition-colors ${
                    isHovered
                      ? 'fill-zinc-900 dark:fill-zinc-100 font-semibold'
                      : 'fill-zinc-400 font-normal'
                  }`}
                >
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredIdx !== null && loanCoords[hoveredIdx] && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-zinc-900/95 dark:bg-zinc-800/95 text-white p-2.5 rounded-lg shadow-xl text-xs z-20 backdrop-blur-xs border border-zinc-700/60"
            style={{
              left: `${(loanCoords[hoveredIdx].x / width) * 100}%`,
            }}
          >
            <div className="font-semibold pb-1 border-b border-zinc-700 text-zinc-200">
              {labels[hoveredIdx]}
            </div>
            <div className="flex items-center justify-between gap-4 pt-1.5 text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Peminjaman
              </span>
              <span className="font-bold">{loans[hoveredIdx]} buku</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Pengembalian
              </span>
              <span className="font-bold">{returns[hoveredIdx]} buku</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

