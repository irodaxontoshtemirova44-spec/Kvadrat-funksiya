import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { GraphCanvas } from './GraphCanvas';
import { QuadraticParams, VertexFormParams } from '../types';
import { analyzeParabola, formatNum, evaluateQuadratic } from '../utils/math';
import { playClickSound } from '../utils/audio';
import { 
  Eye, CheckSquare, Square, Table, Crosshair, 
  HelpCircle, ArrowRightLeft, Sparkles 
} from 'lucide-react';

export const LabSection: React.FC = () => {
  const { language } = useApp();
  const t = translations[language];

  // Mode: standard (ax^2+bx+c) vs vertex (a(x-m)^2+n)
  const [mode, setMode] = useState<'standard' | 'vertex'>('standard');

  const [standardParams, setStandardParams] = useState<QuadraticParams>({ a: 1, b: -2, c: -3 });
  const [vertexParams, setVertexParams] = useState<VertexFormParams>({ a: 1, m: 1, n: -4 });

  // Visual toggles
  const [showGhost, setShowGhost] = useState(true);
  const [showVertex, setShowVertex] = useState(true);
  const [showAxis, setShowAxis] = useState(true);
  const [showRoots, setShowRoots] = useState(true);
  const [showIntercept, setShowIntercept] = useState(true);
  const [showIntervals, setShowIntervals] = useState(false);
  const [showSymmetric, setShowSymmetric] = useState(true);
  const [plotByPointsMode, setPlotByPointsMode] = useState(false);

  // Synchronize when switching modes
  const handleSwitchMode = (newMode: 'standard' | 'vertex') => {
    playClickSound();
    if (newMode === 'vertex') {
      const a = standardParams.a;
      const m = -standardParams.b / (2 * a);
      const n = a * m * m + standardParams.b * m + standardParams.c;
      setVertexParams({ a, m, n });
    } else {
      const a = vertexParams.a;
      const b = -2 * a * vertexParams.m;
      const c = a * vertexParams.m * vertexParams.m + vertexParams.n;
      setStandardParams({ a, b, c });
    }
    setMode(newMode);
  };

  // Convert vertex form to standard parameters for the graph canvas
  const effectiveParams: QuadraticParams = mode === 'standard'
    ? standardParams
    : {
        a: vertexParams.a,
        b: -2 * vertexParams.a * vertexParams.m,
        c: vertexParams.a * vertexParams.m * vertexParams.m + vertexParams.n,
      };

  const analysis = analyzeParabola(effectiveParams);

  // Table of values around the vertex x0
  const centerIntX = Math.round(analysis.x0);
  const tableRows = [-3, -2, -1, 0, 1, 2, 3].map(delta => {
    const xVal = centerIntX + delta;
    const yVal = evaluateQuadratic(effectiveParams, xVal);
    return { x: xVal, y: yVal, isVertex: Math.abs(xVal - analysis.x0) < 0.01 };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">🧪</span>
            <span>{t.labTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.labSubtitle}
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <button
            onClick={() => handleSwitchMode('standard')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'standard'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.standardMode}
          </button>
          <button
            onClick={() => handleSwitchMode('vertex')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'vertex'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.vertexMode}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Canvas + Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Graph Canvas & Sliders */}
        <div className="lg:col-span-8 space-y-4">
          <GraphCanvas
            params={effectiveParams}
            onChangeParams={mode === 'standard' ? setStandardParams : undefined}
            showGhostBase={showGhost}
            showVertexHighlight={showVertex}
            showAxisHighlight={showAxis}
            showRootsHighlight={showRoots}
            showInterceptHighlight={showIntercept}
            showIntervalsHighlight={showIntervals}
            showSymmetricPair={showSymmetric}
            allowPlotPoints={plotByPointsMode}
            height={440}
            readOnlyControls={mode === 'vertex'}
          />

          {/* Vertex Form Sliders if in vertex mode */}
          {mode === 'vertex' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400">
                <span>{t.vertexMode}: <strong>{analysis.vertexFormString}</strong></span>
                <span className="text-slate-500">V(m; n) = ({formatNum(vertexParams.m)}; {formatNum(vertexParams.n)})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* a */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.coefficientA}: <strong className="text-sky-600">{formatNum(vertexParams.a)}</strong>
                  </span>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={vertexParams.a}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (Math.abs(val) < 0.05) val = val < 0 ? -0.1 : 0.1;
                      setVertexParams({ ...vertexParams, a: val });
                    }}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* m */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.paramM}: <strong className="text-pink-600">{formatNum(vertexParams.m)}</strong>
                  </span>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.5"
                    value={vertexParams.m}
                    onChange={(e) => setVertexParams({ ...vertexParams, m: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* n */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.paramN}: <strong className="text-emerald-600">{formatNum(vertexParams.n)}</strong>
                  </span>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="0.5"
                    value={vertexParams.n}
                    onChange={(e) => setVertexParams({ ...vertexParams, n: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Geometric Transformation Explanations */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.transformationInfo}:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>
                    Gorizontal siljish: y = x² grafigi Ox o'qi bo'ylab <strong>{formatNum(Math.abs(vertexParams.m))}</strong> birlik {vertexParams.m >= 0 ? "o'ngga" : "chapga"} surilgan.
                  </li>
                  <li>
                    Vertikal siljish: Oy o'qi bo'ylab <strong>{formatNum(Math.abs(vertexParams.n))}</strong> birlik {vertexParams.n >= 0 ? "yuqoriga" : "pastga"} ko'chirilgan.
                  </li>
                  {vertexParams.a < 0 && (
                    <li className="text-rose-600 dark:text-rose-400 font-semibold">
                      a &lt; 0 bo'lgani uchun grafik Ox o'qiga nisbatan teskari akslangan (pastga qaragan).
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Interactive Feature Visibility Toggles */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Grafik qatlamlari va ko'rsatkichlar
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setShowGhost(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showGhost ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-700 dark:text-sky-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showGhost ? <CheckSquare className="w-3.5 h-3.5 text-sky-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>y = x² asosi</span>
              </button>

              <button
                onClick={() => setShowVertex(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showVertex ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-700 dark:text-rose-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showVertex ? <CheckSquare className="w-3.5 h-3.5 text-rose-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.highlightVertex}</span>
              </button>

              <button
                onClick={() => setShowAxis(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showAxis ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 text-pink-700 dark:text-pink-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showAxis ? <CheckSquare className="w-3.5 h-3.5 text-pink-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.highlightAxis}</span>
              </button>

              <button
                onClick={() => setShowRoots(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showRoots ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showRoots ? <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.highlightRoots}</span>
              </button>

              <button
                onClick={() => setShowIntercept(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showIntercept ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showIntercept ? <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.highlightIntercept}</span>
              </button>

              <button
                onClick={() => setShowIntervals(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showIntervals ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-700 dark:text-teal-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showIntervals ? <CheckSquare className="w-3.5 h-3.5 text-teal-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.highlightIntervals}</span>
              </button>

              <button
                onClick={() => setShowSymmetric(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  showSymmetric ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-700 dark:text-purple-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {showSymmetric ? <CheckSquare className="w-3.5 h-3.5 text-purple-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>Simmetrik juftlik</span>
              </button>

              <button
                onClick={() => setPlotByPointsMode(p => !p)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border transition-colors ${
                  plotByPointsMode ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 text-cyan-700 dark:text-cyan-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {plotByPointsMode ? <CheckSquare className="w-3.5 h-3.5 text-cyan-500" /> : <Square className="w-3.5 h-3.5" />}
                <span>{t.plotByPoints}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Mathematical Properties & Table of Values */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Analysis Dashboard */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base border-b border-slate-100 dark:border-slate-700 pb-2">
              Funksiyaning To'liq Tahlili
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.vertex}:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  V({formatNum(analysis.x0)}; {formatNum(analysis.y0)})
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.axisOfSymmetry}:</span>
                <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                  x = {formatNum(analysis.x0)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.direction}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {analysis.direction === 'up' ? t.directionUp : t.directionDown}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.discriminant}:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  D = {formatNum(analysis.discriminant)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.roots}:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.roots.length === 0
                    ? t.noRoots
                    : analysis.roots.map(r => formatNum(r)).join('; ')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.domain}:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {analysis.domain}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.range}:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {analysis.range}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.increasing}:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.increasingInterval}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">{t.decreasing}:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {analysis.decreasingInterval}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">{t.parity}:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {analysis.parity === 'even' ? 'Juft (Oy ga simmetrik)' : 'Na juft, na toq'}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Values Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-500" />
              <span>{t.tableOfValues}</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                    <th className="py-1.5 px-2 font-bold">x</th>
                    {tableRows.map((r, i) => (
                      <th key={i} className={`py-1.5 px-2 ${r.isVertex ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''}`}>
                        {r.x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-1.5 px-2 font-bold text-slate-500 dark:text-slate-400">y</td>
                    {tableRows.map((r, i) => (
                      <td key={i} className={`py-1.5 px-2 ${r.isVertex ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatNum(r.y)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Qizil ustun — parabola uchiga mos keladigan nuqta.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
