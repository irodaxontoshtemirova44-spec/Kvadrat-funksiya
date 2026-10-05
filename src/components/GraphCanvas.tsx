import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeParabola, formatNum, evaluateQuadratic } from '../utils/math';
import { QuadraticParams } from '../types';
import { translations } from '../utils/i18n';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Play, Pause } from 'lucide-react';

interface GraphCanvasProps {
  params: QuadraticParams;
  onChangeParams?: (newParams: QuadraticParams) => void;
  showGhostBase?: boolean;
  showVertexHighlight?: boolean;
  showAxisHighlight?: boolean;
  showRootsHighlight?: boolean;
  showInterceptHighlight?: boolean;
  showIntervalsHighlight?: boolean;
  showSymmetricPair?: boolean;
  allowPlotPoints?: boolean;
  onPointsPlotted?: (points: Array<{ x: number; y: number }>) => void;
  targetPoints?: Array<{ x: number; y: number }>;
  height?: number;
  readOnlyControls?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  params,
  onChangeParams,
  showGhostBase = false,
  showVertexHighlight = true,
  showAxisHighlight = true,
  showRootsHighlight = true,
  showInterceptHighlight = true,
  showIntervalsHighlight = false,
  showSymmetricPair = false,
  allowPlotPoints = false,
  onPointsPlotted,
  targetPoints,
  height = 420,
  readOnlyControls = false,
}) => {
  const { theme, language } = useApp();
  const t = translations[language];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // View state
  const [scale, setScale] = useState<number>(36); // pixels per unit
  const [originOffset, setOriginOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Plotted points by student
  const [userPoints, setUserPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Animated tracer point
  const [isTracerPlaying, setIsTracerPlaying] = useState<boolean>(false);
  const [tracerX, setTracerX] = useState<number>(0);

  const analysis = analyzeParabola(params);

  // Coordinate transforms
  const toScreenX = useCallback((mathX: number, width: number) => {
    return width / 2 + originOffset.x + mathX * scale;
  }, [originOffset.x, scale]);

  const toScreenY = useCallback((mathY: number, heightPx: number) => {
    return heightPx / 2 + originOffset.y - mathY * scale;
  }, [originOffset.y, scale]);

  const toMathX = useCallback((screenX: number, width: number) => {
    return (screenX - (width / 2 + originOffset.x)) / scale;
  }, [originOffset.x, scale]);

  const toMathY = useCallback((screenY: number, heightPx: number) => {
    return ((heightPx / 2 + originOffset.y) - screenY) / scale;
  }, [originOffset.y, scale]);

  // Tracer animation loop
  useEffect(() => {
    if (!isTracerPlaying) return;
    let animId: number;
    let currentX = analysis.x0 - 4;
    const interval = () => {
      currentX += 0.05;
      if (currentX > analysis.x0 + 4) {
        currentX = analysis.x0 - 4;
      }
      setTracerX(currentX);
      animId = requestAnimationFrame(interval);
    };
    animId = requestAnimationFrame(interval);
    return () => cancelAnimationFrame(animId);
  }, [isTracerPlaying, analysis.x0]);

  // Main canvas rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const heightPx = canvas.height;

    const isDark = theme === 'dark';
    const bgCol = isDark ? '#0f172a' : '#ffffff';
    const gridMajorCol = isDark ? '#1e293b' : '#e2e8f0';
    const gridMinorCol = isDark ? '#152138' : '#f1f5f9';
    const axisCol = isDark ? '#94a3b8' : '#475569';
    const textCol = isDark ? '#94a3b8' : '#64748b';

    // Clear background
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, width, heightPx);

    // Compute math bounds
    const minX = Math.floor(toMathX(0, width)) - 1;
    const maxX = Math.ceil(toMathX(width, width)) + 1;
    const minY = Math.floor(toMathY(heightPx, heightPx)) - 1;
    const maxY = Math.ceil(toMathY(0, heightPx)) + 1;

    // 1. Draw Grid
    ctx.lineWidth = 1;
    for (let x = minX; x <= maxX; x++) {
      const sx = toScreenX(x, width);
      ctx.strokeStyle = x % 5 === 0 ? gridMajorCol : gridMinorCol;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, heightPx);
      ctx.stroke();
    }
    for (let y = minY; y <= maxY; y++) {
      const sy = toScreenY(y, heightPx);
      ctx.strokeStyle = y % 5 === 0 ? gridMajorCol : gridMinorCol;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // 2. Draw Main Axes
    const origX = toScreenX(0, width);
    const origY = toScreenY(0, heightPx);

    ctx.strokeStyle = axisCol;
    ctx.lineWidth = 2;
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, origY);
    ctx.lineTo(width, origY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(origX, 0);
    ctx.lineTo(origX, heightPx);
    ctx.stroke();

    // Axis Arrows
    ctx.fillStyle = axisCol;
    // X Arrow
    ctx.beginPath();
    ctx.moveTo(width - 12, origY - 5);
    ctx.lineTo(width, origY);
    ctx.lineTo(width - 12, origY + 5);
    ctx.fill();
    // Y Arrow
    ctx.beginPath();
    ctx.moveTo(origX - 5, 12);
    ctx.lineTo(origX, 0);
    ctx.lineTo(origX + 5, 12);
    ctx.fill();

    // Axis labels "x" and "y"
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.fillStyle = axisCol;
    ctx.fillText('x', width - 18, origY - 10);
    ctx.fillText('y', origX + 10, 18);
    ctx.fillText('0', origX - 12, origY + 14);

    // Numbered Ticks
    ctx.font = '10px Nunito, sans-serif';
    const tickStep = scale < 22 ? 5 : scale < 32 ? 2 : 1;
    for (let x = minX; x <= maxX; x++) {
      if (x === 0 || x % tickStep !== 0) continue;
      const sx = toScreenX(x, width);
      ctx.fillStyle = textCol;
      ctx.fillText(String(x), sx - 4, origY + 14);
    }
    for (let y = minY; y <= maxY; y++) {
      if (y === 0 || y % tickStep !== 0) continue;
      const sy = toScreenY(y, heightPx);
      ctx.fillStyle = textCol;
      ctx.fillText(String(y), origX - 18, sy + 3);
    }

    // 3. Optional: Ghost curve of base parabola y = x²
    if (showGhostBase) {
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      let started = false;
      for (let px = 0; px <= width; px += 2) {
        const mx = toMathX(px, width);
        const my = mx * mx;
        const py = toScreenY(my, heightPx);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Highlight Increasing / Decreasing Intervals along the curve
    if (showIntervalsHighlight) {
      const x0 = analysis.x0;
      const isUp = analysis.direction === 'up';

      // Left branch: x < x0
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.strokeStyle = isUp ? '#f43f5e' : '#10b981'; // if up, left is decreasing (red)
      let startedL = false;
      for (let px = 0; px <= width; px += 2) {
        const mx = toMathX(px, width);
        if (mx <= x0) {
          const my = evaluateQuadratic(params, mx);
          const py = toScreenY(my, heightPx);
          if (!startedL) {
            ctx.moveTo(px, py);
            startedL = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();

      // Right branch: x > x0
      ctx.beginPath();
      ctx.strokeStyle = isUp ? '#10b981' : '#f43f5e'; // if up, right is increasing (green)
      let startedR = false;
      for (let px = 0; px <= width; px += 2) {
        const mx = toMathX(px, width);
        if (mx >= x0) {
          const my = evaluateQuadratic(params, mx);
          const py = toScreenY(my, heightPx);
          if (!startedR) {
            ctx.moveTo(px, py);
            startedR = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      ctx.stroke();
    } else {
      // 5. Normal Main Parabola Curve
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      let started = false;
      for (let px = 0; px <= width; px += 2) {
        const mx = toMathX(px, width);
        const my = evaluateQuadratic(params, mx);
        const py = toScreenY(my, heightPx);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // 6. Highlight Axis of Symmetry
    if (showAxisHighlight) {
      const axisSx = toScreenX(analysis.x0, width);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(axisSx, 0);
      ctx.lineTo(axisSx, heightPx);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label x = x0
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText(`x = ${formatNum(analysis.x0)}`, axisSx + 6, 26);
    }

    // 7. Highlight Symmetric Pairs
    if (showSymmetricPair) {
      const delta = 1.5;
      const x1 = analysis.x0 - delta;
      const x2 = analysis.x0 + delta;
      const yPair = evaluateQuadratic(params, x1);

      const s1x = toScreenX(x1, width);
      const s2x = toScreenX(x2, width);
      const sy = toScreenY(yPair, heightPx);

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(s1x, sy);
      ctx.lineTo(s2x, sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Points
      [s1x, s2x].forEach((sx, i) => {
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // 8. Highlight Roots / Zeros
    if (showRootsHighlight && analysis.roots.length > 0) {
      analysis.roots.forEach((rootVal, idx) => {
        const rx = toScreenX(rootVal, width);
        const ry = toScreenY(0, heightPx);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px Nunito, sans-serif';
        ctx.fillText(`x${idx + 1}=${formatNum(rootVal)}`, rx - 14, ry - 10);
      });
    }

    // 9. Highlight Y-Intercept
    if (showInterceptHighlight) {
      const iy = toScreenY(analysis.yIntercept, heightPx);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(origX, iy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText(`(0, ${formatNum(analysis.yIntercept)})`, origX + 8, iy - 6);
    }

    // 10. Highlight Vertex
    if (showVertexHighlight) {
      const vx = toScreenX(analysis.x0, width);
      const vy = toScreenY(analysis.y0, heightPx);

      // Pulsing outer glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(vx, vy, 11, 0, Math.PI * 2);
      ctx.fill();

      // Vertex dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(vx, vy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertex coordinate tag
      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.fillText(
        `V(${formatNum(analysis.x0)}; ${formatNum(analysis.y0)})`,
        vx + 8,
        analysis.direction === 'up' ? vy + 18 : vy - 10
      );
    }

    // 11. Draw Target Points (if game mode)
    if (targetPoints && targetPoints.length > 0) {
      targetPoints.forEach((pt, i) => {
        const sx = toScreenX(pt.x, width);
        const sy = toScreenY(pt.y, heightPx);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(String(i + 1), sx - 3, sy + 3);
      });
    }

    // 12. Draw Plotted Points by User
    if (userPoints.length > 0) {
      userPoints.forEach((pt) => {
        const sx = toScreenX(pt.x, width);
        const sy = toScreenY(pt.y, heightPx);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // 13. Animated Tracer Point
    if (isTracerPlaying) {
      const tx = toScreenX(tracerX, width);
      const ty = toScreenY(evaluateQuadratic(params, tracerX), heightPx);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`(${formatNum(tracerX, 1)}; ${formatNum(evaluateQuadratic(params, tracerX), 1)})`, tx + 10, ty - 6);
    }
  }, [
    theme,
    originOffset,
    scale,
    params,
    analysis,
    showGhostBase,
    showVertexHighlight,
    showAxisHighlight,
    showRootsHighlight,
    showInterceptHighlight,
    showIntervalsHighlight,
    showSymmetricPair,
    userPoints,
    targetPoints,
    isTracerPlaying,
    tracerX,
    toMathX,
    toMathY,
    toScreenX,
    toScreenY,
  ]);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
      }
      render();
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height, render]);

  // Redraw when parameters or options change
  useEffect(() => {
    render();
  }, [render]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - originOffset.x, y: e.clientY - originOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOriginOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - originOffset.x, y: touch.clientY - originOffset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOriginOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setScale(prev => Math.max(16, Math.min(100, prev * zoomFactor)));
  };

  // Click to plot point (if enabled)
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!allowPlotPoints) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const mathX = Math.round(toMathX(clientX, rect.width) * 2) / 2; // snap to 0.5
    const mathY = Math.round(toMathY(clientY, rect.height) * 2) / 2;

    const nextPoints = [...userPoints, { x: mathX, y: mathY }];
    setUserPoints(nextPoints);
    if (onPointsPlotted) {
      onPointsPlotted(nextPoints);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
      {/* Canvas container */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={handleClick}
          className={`w-full h-full cursor-${allowPlotPoints ? 'crosshair' : isDragging ? 'grabbing' : 'grab'}`}
          style={{ touchAction: 'none' }}
        />

        {/* Floating Quick Tools (Zoom, Reset, Tracer) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setScale(s => Math.min(100, s * 1.2))}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform"
            title={t.zoomIn}
            aria-label={t.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(16, s / 1.2))}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform"
            title={t.zoomOut}
            aria-label={t.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setScale(36);
              setOriginOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-transform"
            title={t.resetView}
            aria-label={t.resetView}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsTracerPlaying(p => !p)}
            className={`p-1.5 rounded-lg transition-colors ${
              isTracerPlaying ? 'bg-sky-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={t.tracerPoint}
            aria-label={t.tracerPoint}
          >
            {isTracerPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Equation Badge */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 font-mono select-none">
          {analysis.standardFormString}
        </div>
      </div>

      {/* Interactive Controls (Sliders for a, b, c) if not readOnly */}
      {!readOnlyControls && onChangeParams && (
        <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Slider a */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t.coefficientA}: <strong className="text-sky-600 dark:text-sky-400">{formatNum(params.a)}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const nextA = params.a - 0.5;
                      onChangeParams({ ...params, a: nextA === 0 ? -0.5 : nextA });
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      const nextA = params.a + 0.5;
                      onChangeParams({ ...params, a: nextA === 0 ? 0.5 : nextA });
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-4"
                max="4"
                step="0.1"
                value={params.a}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (Math.abs(val) < 0.05) val = val < 0 ? -0.1 : 0.1;
                  onChangeParams({ ...params, a: val });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Slider b */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t.coefficientB}: <strong className="text-pink-600 dark:text-pink-400">{formatNum(params.b)}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onChangeParams({ ...params, b: params.b - 0.5 })}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onChangeParams({ ...params, b: params.b + 0.5 })}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={params.b}
                onChange={(e) => onChangeParams({ ...params, b: parseFloat(e.target.value) })}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Slider c */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {t.coefficientC}: <strong className="text-emerald-600 dark:text-emerald-400">{formatNum(params.c)}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onChangeParams({ ...params, c: params.c - 0.5 })}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onChangeParams({ ...params, c: params.c + 0.5 })}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={params.c}
                onChange={(e) => onChangeParams({ ...params, c: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
