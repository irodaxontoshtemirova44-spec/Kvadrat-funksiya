import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { GraphCanvas } from './GraphCanvas';
import { QuadraticParams } from '../types';
import { analyzeParabola, formatNum, evaluateQuadratic } from '../utils/math';
import { 
  playClickSound, playSuccessSound, playErrorSound, 
  playRocketSound, playWinFanfare 
} from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { 
  Heart, Trophy, Timer, RotateCcw, Play, CheckCircle2, 
  Sparkles, Star, AlertCircle, ArrowRight 
} from 'lucide-react';

export const PlaySection: React.FC = () => {
  const { language, saveGameScore, addXP, profile } = useApp();
  const t = translations[language];

  const [selectedGameId, setSelectedGameId] = useState<string>('game_1');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // Universal Game State
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);

  // --- Specific Game State Variables ---
  // Game 1: Parabola Match
  const [g1TargetParams, setG1TargetParams] = useState<QuadraticParams>({ a: 1, b: 0, c: 0 });
  const [g1Options, setG1Options] = useState<QuadraticParams[]>([]);
  const [g1CorrectIdx, setG1CorrectIdx] = useState<number>(0);

  // Game 2: Basketball Shot
  const [g2HoopPos, setG2HoopPos] = useState<{ x: number; y: number }>({ x: 4, y: 3 });
  const [g2PlayerParams, setG2PlayerParams] = useState<QuadraticParams>({ a: -0.5, b: 2, c: 1 });
  const [g2IsShooting, setG2IsShooting] = useState<boolean>(false);
  const [g2BallPos, setG2BallPos] = useState<{ x: number; y: number }>({ x: 0, y: 1 });
  const [g2ShotResult, setG2ShotResult] = useState<'idle' | 'swish' | 'miss'>('idle');

  // Game 3: Vertex Hunter
  const [g3TargetVertex, setG3TargetVertex] = useState<{ x: number; y: number }>({ x: 2, y: -1 });
  const [g3UserParams, setG3UserParams] = useState<QuadraticParams>({ a: 1, b: 0, c: 0 });

  // Game 4: Root Rocket
  const [g4RootsParams, setG4RootsParams] = useState<QuadraticParams>({ a: 1, b: -3, c: 2 });
  const [g4RootGuess, setG4RootGuess] = useState<string>('');
  const [g4FuelLevel, setG4FuelLevel] = useState<number>(30); // 0 to 100%

  // Game 5: Speed Inc/Dec
  const [g5PointX, setG5PointX] = useState<number>(0);
  const [g5ParabolaParams, setG5ParabolaParams] = useState<QuadraticParams>({ a: 1, b: -2, c: 0 });
  const [g5Streak, setG5Streak] = useState<number>(0);

  // Game 6: Parity Sorter
  const [g6CardIndex, setG6CardIndex] = useState<number>(0);
  const g6Cards = [
    { expr: "y = 3x² - 5", parity: "even" },
    { expr: "y = x² + 2x", parity: "neither" },
    { expr: "y = -2x² + 7", parity: "even" },
    { expr: "y = 4x² - x + 1", parity: "neither" },
    { expr: "y = x³ - 3x", parity: "odd" },
    { expr: "y = 5x", parity: "odd" },
    { expr: "y = 0.5x²", parity: "even" },
    { expr: "y = (x - 2)²", parity: "neither" },
  ];

  // Game 7: Range Shooter
  const [g7Parabola, setG7Parabola] = useState<QuadraticParams>({ a: 1, b: -4, c: 5 });
  const [g7UserBound, setG7UserBound] = useState<number>(0);

  // Game 8: 5 Points Graph Builder
  const [g8TargetEquation, setG8TargetEquation] = useState<QuadraticParams>({ a: 1, b: 0, c: -2 });
  const [g8PlottedPoints, setG8PlottedPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Game 9: Bridge Builder
  const [g9RiverSpan, setG9RiverSpan] = useState<{ left: number; right: number; clearance: number }>({ left: -4, right: 4, clearance: 3 });
  const [g9BridgeParams, setG9BridgeParams] = useState<QuadraticParams>({ a: -0.2, b: 0, c: 3.5 });

  // Timer effect for speed games
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (selectedGameId === 'game_5' || selectedGameId === 'game_6') {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, selectedGameId]);

  // Handle Game Over
  const handleGameOver = () => {
    setGameState('gameover');
    const earnedStars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
    setStars(earnedStars);
    saveGameScore(selectedGameId, score, earnedStars);
    addXP(score * 15 + earnedStars * 20);
    if (earnedStars >= 2) {
      playWinFanfare();
      fireConfetti();
    } else {
      playErrorSound();
    }
  };

  // Start / Init Games
  const startNewGame = () => {
    playClickSound();
    setScore(0);
    setLives(3);
    setTimeLeft(selectedGameId === 'game_5' ? 25 : 35);
    setRoundNumber(1);
    setGameState('playing');
    initRound(1);
  };

  const initRound = (rnd: number) => {
    setRoundNumber(rnd);

    if (selectedGameId === 'game_1') {
      // Generate target
      const a = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const b = difficulty === 'easy' ? 0 : (Math.floor(Math.random() * 5) - 2) * 2;
      const c = difficulty === 'hard' ? Math.floor(Math.random() * 5) - 2 : difficulty === 'medium' ? Math.floor(Math.random() * 4) : 0;
      const target = { a, b, c };
      setG1TargetParams(target);

      // Options
      const correctIdx = Math.floor(Math.random() * 4);
      setG1CorrectIdx(correctIdx);
      const opts: QuadraticParams[] = [];
      for (let i = 0; i < 4; i++) {
        if (i === correctIdx) {
          opts.push(target);
        } else {
          opts.push({
            a: target.a === 1 ? -1 : target.a + (i === 0 ? 1 : -1),
            b: target.b + (i * 2),
            c: target.c + (i - 2),
          });
        }
      }
      setG1Options(opts);
    }

    if (selectedGameId === 'game_2') {
      // Basketball hoop position
      const hoopX = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;
      const hoopY = Math.floor(Math.random() * 3) + 2;
      setG2HoopPos({ x: hoopX, y: hoopY });
      setG2PlayerParams({ a: -0.3, b: 1.5, c: 1 });
      setG2ShotResult('idle');
      setG2IsShooting(false);
    }

    if (selectedGameId === 'game_3') {
      // Vertex target
      const tx = Math.floor(Math.random() * 7) - 3;
      const ty = Math.floor(Math.random() * 7) - 3;
      setG3TargetVertex({ x: tx, y: ty });
      setG3UserParams({ a: 1, b: 0, c: 0 });
    }

    if (selectedGameId === 'game_4') {
      // Root Rocket
      const r1 = Math.floor(Math.random() * 4) - 2;
      const r2 = r1 + Math.floor(Math.random() * 3) + 1;
      const a = 1;
      const b = -(r1 + r2);
      const c = r1 * r2;
      setG4RootsParams({ a, b, c });
      setG4RootGuess('');
    }

    if (selectedGameId === 'game_5') {
      // Speed inc/dec
      const a = Math.random() > 0.5 ? 1 : -1;
      const b = (Math.floor(Math.random() * 5) - 2) * 2;
      const c = Math.floor(Math.random() * 5) - 2;
      setG5ParabolaParams({ a, b, c });
      const x0 = -b / (2 * a);
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 0.5);
      setG5PointX(x0 + offset);
    }

    if (selectedGameId === 'game_6') {
      setG6CardIndex(0);
    }

    if (selectedGameId === 'game_7') {
      const a = Math.random() > 0.5 ? 1 : -1;
      const m = Math.floor(Math.random() * 5) - 2;
      const n = Math.floor(Math.random() * 7) - 3;
      const b = -2 * a * m;
      const c = a * m * m + n;
      setG7Parabola({ a, b, c });
      setG7UserBound(0);
    }

    if (selectedGameId === 'game_8') {
      const c = Math.floor(Math.random() * 5) - 2;
      const a = Math.random() > 0.5 ? 1 : -1;
      setG8TargetEquation({ a, b: 0, c });
      setG8PlottedPoints([]);
    }

    if (selectedGameId === 'game_9') {
      setG9RiverSpan({ left: -4, right: 4, clearance: 3 });
      setG9BridgeParams({ a: -0.2, b: 0, c: 3.5 });
    }
  };

  // --- Handlers for Game Actions ---
  // Game 1 Choice Click
  const handleG1Choice = (idx: number) => {
    if (idx === g1CorrectIdx) {
      playSuccessSound();
      setScore(s => s + 1);
      if (roundNumber >= 5) {
        handleGameOver();
      } else {
        initRound(roundNumber + 1);
      }
    } else {
      playErrorSound();
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 2 Basketball Launch
  const launchBasketball = () => {
    if (g2IsShooting) return;
    setG2IsShooting(true);
    setG2ShotResult('idle');

    let currentX = 0;
    const hoop = g2HoopPos;

    const animInterval = setInterval(() => {
      currentX += 0.25;
      const currentY = evaluateQuadratic(g2PlayerParams, currentX);
      setG2BallPos({ x: currentX, y: currentY });

      // Check if near hoop
      if (Math.abs(currentX - hoop.x) < 0.4) {
        clearInterval(animInterval);
        setG2IsShooting(false);
        const yDiff = Math.abs(currentY - hoop.y);
        if (yDiff <= 0.5) {
          setG2ShotResult('swish');
          playSuccessSound();
          fireConfetti(0.7, 0.4, 30);
          setScore(s => s + 1);
          setTimeout(() => {
            if (roundNumber >= 5) handleGameOver();
            else initRound(roundNumber + 1);
          }, 1500);
        } else {
          setG2ShotResult('miss');
          playErrorSound();
          setLives(l => {
            if (l <= 1) {
              handleGameOver();
              return 0;
            }
            return l - 1;
          });
        }
      } else if (currentX > hoop.x + 2 || currentY < -5) {
        clearInterval(animInterval);
        setG2IsShooting(false);
        setG2ShotResult('miss');
        playErrorSound();
        setLives(l => {
          if (l <= 1) {
            handleGameOver();
            return 0;
          }
          return l - 1;
        });
      }
    }, 40);
  };

  // Game 3 Vertex Check
  const checkVertexHunter = () => {
    const analysis = analyzeParabola(g3UserParams);
    const dist = Math.hypot(analysis.x0 - g3TargetVertex.x, analysis.y0 - g3TargetVertex.y);
    if (dist < 0.35) {
      playSuccessSound();
      setScore(s => s + 1);
      fireConfetti();
      if (roundNumber >= 5) handleGameOver();
      else initRound(roundNumber + 1);
    } else {
      playErrorSound();
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 4 Root Rocket Launch
  const checkRootRocket = () => {
    const analysis = analyzeParabola(g4RootsParams);
    const parsed = parseFloat(g4RootGuess.trim());
    if (isNaN(parsed)) return;

    const isMatch = analysis.roots.some(r => Math.abs(r - parsed) < 0.2);
    if (isMatch) {
      playRocketSound();
      setG4FuelLevel(f => Math.min(100, f + 35));
      setScore(s => s + 1);
      setG4RootGuess('');
      if (roundNumber >= 4) {
        setTimeout(() => handleGameOver(), 800);
      } else {
        setTimeout(() => initRound(roundNumber + 1), 600);
      }
    } else {
      playErrorSound();
      setG4FuelLevel(f => Math.max(0, f - 25));
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 5 Speed Inc/Dec Answer
  const handleG5Answer = (userChoice: 'increasing' | 'decreasing') => {
    const analysis = analyzeParabola(g5ParabolaParams);
    const x0 = analysis.x0;
    const isUp = analysis.direction === 'up';

    let actual: 'increasing' | 'decreasing';
    if (isUp) {
      actual = g5PointX >= x0 ? 'increasing' : 'decreasing';
    } else {
      actual = g5PointX <= x0 ? 'increasing' : 'decreasing';
    }

    if (userChoice === actual) {
      playSuccessSound();
      setScore(s => s + 1);
      setG5Streak(st => st + 1);
      initRound(roundNumber + 1);
    } else {
      playErrorSound();
      setG5Streak(0);
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 6 Parity Sorter Answer
  const handleG6Sort = (bucket: 'even' | 'odd' | 'neither') => {
    const card = g6Cards[g6CardIndex];
    if (card.parity === bucket) {
      playSuccessSound();
      setScore(s => s + 1);
    } else {
      playErrorSound();
      setLives(l => Math.max(0, l - 1));
    }

    if (g6CardIndex + 1 >= g6Cards.length) {
      handleGameOver();
    } else {
      setG6CardIndex(i => i + 1);
    }
  };

  // Game 7 Range Shoot Check
  const checkRangeShooter = () => {
    const aInfo = analyzeParabola(g7Parabola);
    if (Math.abs(g7UserBound - aInfo.y0) <= 0.4) {
      playSuccessSound();
      setScore(s => s + 1);
      fireConfetti();
      if (roundNumber >= 4) handleGameOver();
      else initRound(roundNumber + 1);
    } else {
      playErrorSound();
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 8 Points Builder Check
  const checkG8Accuracy = () => {
    if (g8PlottedPoints.length < 5) return;
    let correctCount = 0;
    g8PlottedPoints.forEach(pt => {
      const expectedY = evaluateQuadratic(g8TargetEquation, pt.x);
      if (Math.abs(pt.y - expectedY) <= 0.6) correctCount++;
    });

    if (correctCount >= 4) {
      playSuccessSound();
      setScore(s => s + correctCount);
      handleGameOver();
    } else {
      playErrorSound();
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // Game 9 Bridge Span Check
  const checkBridgePass = () => {
    // Check if arch clears clearance at center and touches banks at left/right
    const heightAtCenter = evaluateQuadratic(g9BridgeParams, 0);
    const heightAtLeft = evaluateQuadratic(g9BridgeParams, g9RiverSpan.left);
    const heightAtRight = evaluateQuadratic(g9BridgeParams, g9RiverSpan.right);

    const safeCenter = heightAtCenter >= g9RiverSpan.clearance;
    const safeBase = Math.abs(heightAtLeft) <= 1.0 && Math.abs(heightAtRight) <= 1.0;

    if (safeCenter && safeBase) {
      playSuccessSound();
      setScore(s => s + 3);
      fireConfetti();
      handleGameOver();
    } else {
      playErrorSound();
      setLives(l => {
        if (l <= 1) {
          handleGameOver();
          return 0;
        }
        return l - 1;
      });
    }
  };

  // 9 Arcade Games Catalog
  const arcadeList = [
    { id: 'game_1', title: t.game1Title, desc: t.game1Desc, icon: '🕵️' },
    { id: 'game_2', title: t.game2Title, desc: t.game2Desc, icon: '🏀' },
    { id: 'game_3', title: t.game3Title, desc: t.game3Desc, icon: '🎯' },
    { id: 'game_4', title: t.game4Title, desc: t.game4Desc, icon: '🚀' },
    { id: 'game_5', title: t.game5Title, desc: t.game5Desc, icon: '⚡' },
    { id: 'game_6', title: t.game6Title, desc: t.game6Desc, icon: '📦' },
    { id: 'game_7', title: t.game7Title, desc: t.game7Desc, icon: '🏹' },
    { id: 'game_8', title: t.game8Title, desc: t.game8Desc, icon: '📐' },
    { id: 'game_9', title: t.game9Title, desc: t.game9Desc, icon: '🌉' },
  ];

  const activeGameMeta = arcadeList.find(g => g.id === selectedGameId) || arcadeList[0];
  const savedRecord = profile.gameScores[selectedGameId] || { highScore: 0, stars: 0 };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Arcade Header & Game Selector Carousel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span>{t.gamesTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.gamesSubtitle}
          </p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl text-xs font-bold">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => {
                playClickSound();
                setDifficulty(diff);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                difficulty === diff
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t[diff]}
            </button>
          ))}
        </div>
      </div>

      {/* Arcade Games Catalog Strip */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2.5 min-w-max">
          {arcadeList.map(g => {
            const active = g.id === selectedGameId;
            const rec = profile.gameScores[g.id] || { highScore: 0, stars: 0 };
            return (
              <button
                key={g.id}
                onClick={() => {
                  playClickSound();
                  setSelectedGameId(g.id);
                  setGameState('menu');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  active
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{g.title}</div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{rec.stars}/3 yulduz</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
        
        {/* Game Menu State */}
        {gameState === 'menu' && (
          <div className="text-center py-8 max-w-md mx-auto space-y-4">
            <span className="text-5xl block animate-bounce">{activeGameMeta.icon}</span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeGameMeta.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeGameMeta.desc}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-around text-xs">
              <div>
                <span className="text-slate-400 block">Eng yuqori ball</span>
                <strong className="text-sky-600 dark:text-sky-400 text-base">{savedRecord.highScore}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Yulduzlar</span>
                <strong className="text-amber-500 text-base">{'★'.repeat(savedRecord.stars) || '0'}</strong>
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{t.startGame}</span>
            </button>
          </div>
        )}

        {/* Game Over Result Screen */}
        {gameState === 'gameover' && (
          <div className="text-center py-8 max-w-md mx-auto space-y-4">
            <span className="text-5xl block">{stars >= 2 ? '🏆' : '💪'}</span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {t.gameOver}
            </h2>

            <div className="flex justify-center gap-2 text-2xl text-amber-400">
              {[1, 2, 3].map(st => (
                <span key={st} className={st <= stars ? 'scale-125 transition-transform' : 'opacity-30'}>
                  ★
                </span>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">{t.score}:</span>
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">{score}</div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +{score * 15 + stars * 20} XP qo'shildi!
              </span>
            </div>

            <button
              onClick={startNewGame}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.playAgain}</span>
            </button>
          </div>
        )}

        {/* Active Playing State */}
        {gameState === 'playing' && (
          <div className="space-y-4">
            
            {/* Game Status HUD */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Trophy className="w-4 h-4" />
                <span>{t.score}: {score}</span>
              </div>

              {(selectedGameId === 'game_5' || selectedGameId === 'game_6') && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Timer className="w-4 h-4" />
                  <span>{timeLeft}s</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-rose-500">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${i < lives ? 'fill-rose-500' : 'text-slate-300 dark:text-slate-600'}`}
                  />
                ))}
              </div>
            </div>

            {/* --- GAME 1: PARABOLA MATCH --- */}
            {selectedGameId === 'game_1' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game1Desc}
                </div>
                <GraphCanvas
                  params={g1TargetParams}
                  height={320}
                  readOnlyControls={true}
                  showVertexHighlight={true}
                  showRootsHighlight={true}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {g1Options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleG1Choice(i)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500 font-mono font-bold text-sm text-slate-800 dark:text-slate-200 active:scale-95 transition-all shadow-xs"
                    >
                      {analyzeParabola(opt).standardFormString}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- GAME 2: BASKETBALL SHOT DESIGNER --- */}
            {selectedGameId === 'game_2' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game2Desc} (Savat nishoni: X={g2HoopPos.x}, Y={g2HoopPos.y})
                </div>
                <GraphCanvas
                  params={g2PlayerParams}
                  onChangeParams={setG2PlayerParams}
                  targetPoints={[g2HoopPos]}
                  height={320}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {g2ShotResult === 'swish' && <span className="text-emerald-500 animate-bounce">🏀 SAVATGA TUSHDI! ANIQ!</span>}
                    {g2ShotResult === 'miss' && <span className="text-rose-500">❌ XATO! Qaytadan urinib ko'ring.</span>}
                  </div>
                  <button
                    onClick={launchBasketball}
                    disabled={g2IsShooting}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
                  >
                    🏀 Otish (Launch)!
                  </button>
                </div>
              </div>
            )}

            {/* --- GAME 3: VERTEX HUNTER --- */}
            {selectedGameId === 'game_3' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game3Desc} (Nishon uchi: X={g3TargetVertex.x}, Y={g3TargetVertex.y})
                </div>
                <GraphCanvas
                  params={g3UserParams}
                  onChangeParams={setG3UserParams}
                  targetPoints={[g3TargetVertex]}
                  height={320}
                  showVertexHighlight={true}
                />
                <div className="flex justify-end">
                  <button
                    onClick={checkVertexHunter}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
                  >
                    🎯 Nishonni Tasdiqlash
                  </button>
                </div>
              </div>
            )}

            {/* --- GAME 4: ROOT ROCKET --- */}
            {selectedGameId === 'game_4' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game4Desc}: <strong className="font-mono text-sky-500">{analyzeParabola(g4RootsParams).standardFormString}</strong> ning bitta ildizini kiriting!
                </div>
                {/* Fuel gauge */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${g4FuelLevel}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={g4RootGuess}
                    onChange={(e) => setG4RootGuess(e.target.value)}
                    placeholder="Ildiz qiymati..."
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm font-bold"
                  />
                  <button
                    onClick={checkRootRocket}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md active:scale-95"
                  >
                    🚀 Yoqilg'i quyish!
                  </button>
                </div>
              </div>
            )}

            {/* --- GAME 5: SPEED INCREASE / DECREASE --- */}
            {selectedGameId === 'game_5' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game5Desc} (x = {formatNum(g5PointX, 1)} nuqtada funksiya...)
                </div>
                <GraphCanvas
                  params={g5ParabolaParams}
                  height={280}
                  readOnlyControls={true}
                  showIntervalsHighlight={true}
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleG5Answer('increasing')}
                    className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-md active:scale-95 transition-all"
                  >
                    📈 O'smoqda (Increasing)
                  </button>
                  <button
                    onClick={() => handleG5Answer('decreasing')}
                    className="py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base shadow-md active:scale-95 transition-all"
                  >
                    📉 Kamaymoqda (Decreasing)
                  </button>
                </div>
              </div>
            )}

            {/* --- GAME 6: PARITY SORTER --- */}
            {selectedGameId === 'game_6' && (
              <div className="space-y-4 text-center">
                <div className="text-xs text-slate-500">{t.game6Desc}</div>
                {/* Active card */}
                <div className="p-6 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-mono font-extrabold text-2xl shadow-xl max-w-sm mx-auto">
                  {g6Cards[g6CardIndex]?.expr}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <button
                    onClick={() => handleG6Sort('even')}
                    className="p-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all"
                  >
                    Juft (Even)
                  </button>
                  <button
                    onClick={() => handleG6Sort('odd')}
                    className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all"
                  >
                    Toq (Odd)
                  </button>
                  <button
                    onClick={() => handleG6Sort('neither')}
                    className="p-3.5 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all"
                  >
                    Na juft, na toq
                  </button>
                </div>
              </div>
            )}

            {/* --- GAME 7: RANGE SHOOTER --- */}
            {selectedGameId === 'game_7' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game7Desc}: <strong className="font-mono text-sky-500">{analyzeParabola(g7Parabola).standardFormString}</strong>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Chegara y qiymati:</span>
                    <strong className="text-indigo-600 text-base">{g7UserBound}</strong>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    step="1"
                    value={g7UserBound}
                    onChange={(e) => setG7UserBound(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <button
                  onClick={checkRangeShooter}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md active:scale-95"
                >
                  🏹 Otish (Submit Boundary)!
                </button>
              </div>
            )}

            {/* --- GAME 8: 5 POINTS BUILDER --- */}
            {selectedGameId === 'game_8' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game8Desc}: <strong className="font-mono text-sky-500">{analyzeParabola(g8TargetEquation).standardFormString}</strong>
                  <br />
                  Grafik ustiga bosib 5 ta aniq nuqtani belgilang (Belgilandi: {g8PlottedPoints.length}/5)
                </div>
                <GraphCanvas
                  params={g8TargetEquation}
                  height={320}
                  readOnlyControls={true}
                  allowPlotPoints={true}
                  onPointsPlotted={setG8PlottedPoints}
                />
                <button
                  onClick={checkG8Accuracy}
                  disabled={g8PlottedPoints.length < 5}
                  className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-bold text-sm shadow-md active:scale-95"
                >
                  📐 Nuqtalarni Tekshirish ({g8PlottedPoints.length}/5)
                </button>
              </div>
            )}

            {/* --- GAME 9: BRIDGE ARCHITECT --- */}
            {selectedGameId === 'game_9' && (
              <div className="space-y-4">
                <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.game9Desc} (Daryo kengligi: -4 dan 4 gacha, balandlik talabi: ≥ 3m)
                </div>
                <GraphCanvas
                  params={g9BridgeParams}
                  onChangeParams={setG9BridgeParams}
                  height={320}
                />
                <button
                  onClick={checkBridgePass}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md active:scale-95"
                >
                  🌉 Ko'prikni Sinovdan O'tkazish!
                </button>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
