import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoosterType,
  CandyColor,
  CandyTile,
  ComboBanner,
  FloatingScore,
  GameStatus,
  Position,
} from './types';
import {
  BOARD_COLS,
  BOARD_ROWS,
  COMBO_PRAISES,
  LEVELS,
} from './utils/constants';
import { sound } from './utils/audio';
import {
  createInitialBoard,
  createRandomTile,
  evaluateBoardMatches,
  findHintMove,
  generateUniqueId,
  hasPossibleMoves,
  shuffleBoard,
} from './utils/gameLogic';
import { TopBar } from './components/TopBar';
import { GameBoard } from './components/GameBoard';
import { BoosterBar } from './components/BoosterBar';
import { LevelModal } from './components/LevelModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const currentLevel = LEVELS[levelIndex] || LEVELS[0];

  const [board, setBoard] = useState<(CandyTile | null)[][]>(() =>
    createInitialBoard(currentLevel.colorsCount)
  );
  const [score, setScore] = useState<number>(0);
  const [moves, setMoves] = useState<number>(currentLevel.moves);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [freeSwapFirst, setFreeSwapFirst] = useState<Position | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Boosters
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [boosterCounts, setBoosterCounts] = useState<Record<BoosterType, number>>({
    hammer: 3,
    color_bomb: 2,
    free_swap: 2,
  });

  // Effects & Feedback
  const [comboBanner, setComboBanner] = useState<ComboBanner | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [blastEffects, setBlastEffects] = useState<
    { id: string; row: number; col: number; direction: 'h' | 'v' | 'both' | 'area' }[]
  >([]);
  const [hintTiles, setHintTiles] = useState<{ from: Position; to: Position } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef<boolean>(false);

  // Keep ref updated
  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  // Restart idle timer whenever board or processing changes
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setHintTiles(null);

    if (gameStatus !== 'playing' || processingRef.current) return;

    idleTimerRef.current = setTimeout(() => {
      setBoard((currentBoard) => {
        const hint = findHintMove(currentBoard);
        if (hint) {
          setHintTiles(hint);
        }
        return currentBoard;
      });
    }, 6000);
  }, [gameStatus]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer, board]);

  // Handle Level Initialization
  const initLevel = useCallback((lvlIdx: number) => {
    const lvl = LEVELS[lvlIdx] || LEVELS[0];
    setLevelIndex(lvlIdx);
    setScore(0);
    setMoves(lvl.moves);
    setSelectedTile(null);
    setFreeSwapFirst(null);
    setActiveBooster(null);
    setComboBanner(null);
    setFloatingScores([]);
    setBlastEffects([]);
    setGameStatus('playing');
    setIsProcessing(false);
    setIsShuffling(false);
    const newBoard = createInitialBoard(lvl.colorsCount);
    setBoard(newBoard);
  }, []);

  const handleRestart = () => {
    initLevel(levelIndex);
  };

  const handleNextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      initLevel(levelIndex + 1);
    } else {
      initLevel(0);
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Helper sleep
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Cascade elimination and fall loop
  const runCascade = async (initialBoard: (CandyTile | null)[][], startingScore: number, remainingMoves: number) => {
    setIsProcessing(true);
    let currentBoard = initialBoard.map((row) => [...row]);
    let currentScore = startingScore;
    let combo = 1;

    while (true) {
      const matchResult = evaluateBoardMatches(currentBoard);
      if (matchResult.matchedPositions.length === 0 && matchResult.newSpecials.length === 0) {
        break;
      }

      // Calculate score for this match step
      const stepMatchesCount = matchResult.matchedPositions.length + matchResult.newSpecials.length;
      const stepScore = stepMatchesCount * 25 * combo;
      currentScore += stepScore;
      setScore(currentScore);

      // Play match sounds
      sound.playMatch(combo);

      // Trigger blast effects if any
      if (matchResult.blastEffects.length > 0) {
        const effects = matchResult.blastEffects.map((be) => ({
          id: generateUniqueId(),
          row: be.pos.row,
          col: be.pos.col,
          direction: be.blastDirection,
        }));
        setBlastEffects(effects);
        sound.playSpecialBlast();
        setTimeout(() => setBlastEffects([]), 400);
      }

      // Add floating score popups
      if (matchResult.matchedPositions.length > 0) {
        const centerPos = matchResult.matchedPositions[0];
        const newFloating: FloatingScore = {
          id: generateUniqueId(),
          score: stepScore,
          row: centerPos.row,
          col: centerPos.col,
        };
        setFloatingScores((prev) => [...prev.slice(-3), newFloating]);
        setTimeout(() => {
          setFloatingScores((prev) => prev.filter((item) => item.id !== newFloating.id));
        }, 700);
      }

      // Show combo praises for combos >= 2
      if (combo >= 2) {
        const praise =
          COMBO_PRAISES.find((p) => p.minCombo === Math.min(combo, 5)) || COMBO_PRAISES[0];
        setComboBanner({
          id: generateUniqueId(),
          text: praise.text,
          subtext: praise.subtext,
          comboCount: combo,
        });
        sound.playComboCheer();
      }

      // Mark matched tiles for popping animation
      const boardWithPops = currentBoard.map((row) =>
        row.map((tile) => {
          if (!tile) return null;
          const isDestroyed = matchResult.matchedPositions.some(
            (p) => p.row === tile.row && p.col === tile.col
          );
          if (isDestroyed) {
            return { ...tile, isMatched: true };
          }
          return tile;
        })
      );
      setBoard(boardWithPops);
      await sleep(240);

      // Place newly created specials and set destroyed tiles to null
      const updatedBoard = currentBoard.map((row) =>
        row.map((tile) => {
          if (!tile) return null;
          // Check if transformed into a new special
          const specialCreated = matchResult.newSpecials.find(
            (ns) => ns.pos.row === tile.row && ns.pos.col === tile.col
          );
          if (specialCreated) {
            return {
              ...tile,
              special: specialCreated.special,
              color: specialCreated.color,
              isMatched: false,
            };
          }
          // Destroy matched
          const isDestroyed = matchResult.matchedPositions.some(
            (p) => p.row === tile.row && p.col === tile.col
          );
          return isDestroyed ? null : tile;
        })
      );

      // Gravity Drop: drop tiles down column by column, fill top with new tiles
      const allowedColors: CandyColor[] = currentLevel.colorsCount === 6
        ? ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
        : ['red', 'orange', 'yellow', 'green', 'blue'];

      const fallenBoard: (CandyTile | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => null)
      );

      for (let c = 0; c < BOARD_COLS; c++) {
        let bottomRow = BOARD_ROWS - 1;
        // Shift non-null tiles down
        for (let r = BOARD_ROWS - 1; r >= 0; r--) {
          const tile = updatedBoard[r][c];
          if (tile !== null) {
            fallenBoard[bottomRow][c] = {
              ...tile,
              row: bottomRow,
              col: c,
              isMatched: false,
            };
            bottomRow--;
          }
        }
        // Fill empty top rows with fresh random candies
        for (let r = bottomRow; r >= 0; r--) {
          fallenBoard[r][c] = createRandomTile(r, c, allowedColors);
        }
      }

      currentBoard = fallenBoard;
      setBoard(currentBoard);
      await sleep(260);

      combo++;
    }

    // Finished cascades
    setTimeout(() => setComboBanner(null), 1200);

    // Check Win/Loss
    if (currentScore >= currentLevel.targetScore) {
      // Won!
      sound.playWin();
      setGameStatus('won');
    } else if (remainingMoves <= 0) {
      // Lost
      sound.playInvalid();
      setGameStatus('lost');
    } else {
      // Verify board has possible moves; shuffle if stuck
      if (!hasPossibleMoves(currentBoard)) {
        setIsShuffling(true);
        await sleep(600);
        const allowedColors: CandyColor[] = currentLevel.colorsCount === 6
          ? ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
          : ['red', 'orange', 'yellow', 'green', 'blue'];
        const shuffled = shuffleBoard(currentBoard, allowedColors);
        setBoard(shuffled);
        setIsShuffling(false);
      }
    }

    setIsProcessing(false);
  };

  // Perform a swap between p1 and p2
  const executeSwap = async (p1: Position, p2: Position) => {
    if (isProcessing || gameStatus !== 'playing') return;

    const t1 = board[p1.row]?.[p1.col];
    const t2 = board[p2.row]?.[p2.col];
    if (!t1 || !t2) return;

    setIsProcessing(true);
    setHintTiles(null);

    // Check for direct special interactions
    // 1. Color Bomb + Color Bomb: clears full board!
    if (t1.special === 'color_bomb' && t2.special === 'color_bomb') {
      sound.playColorBomb();
      sound.playExplosion();
      setBlastEffects([{ id: generateUniqueId(), row: p1.row, col: p1.col, direction: 'area' }]);

      // Mark all tiles as destroyed
      const clearedBoard = board.map((row) =>
        row.map((t) => (t ? { ...t, isMatched: true } : null))
      );
      setBoard(clearedBoard);
      await sleep(300);

      const nextMoves = moves - 1;
      setMoves(nextMoves);
      const emptyBoard = Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => null)
      );
      await runCascade(emptyBoard, score + 2000, nextMoves);
      return;
    }

    // 2. Color Bomb + Striped Candy: turns all of that color into striped candies and triggers them!
    if (
      (t1.special === 'color_bomb' && (t2.special === 'striped_h' || t2.special === 'striped_v')) ||
      (t2.special === 'color_bomb' && (t1.special === 'striped_h' || t1.special === 'striped_v'))
    ) {
      const targetColor = t1.special === 'color_bomb' ? t2.color : t1.color;
      sound.playColorBomb();
      sound.playSpecialBlast();

      const transformedBoard = board.map((row) =>
        row.map((t) => {
          if (!t) return null;
          if (t.color === targetColor) {
            return {
              ...t,
              special: Math.random() > 0.5 ? 'striped_h' : 'striped_v',
            } as CandyTile;
          }
          if (t.special === 'color_bomb') return null;
          return t;
        })
      );

      setBoard(transformedBoard);
      await sleep(250);

      const nextMoves = moves - 1;
      setMoves(nextMoves);
      await runCascade(transformedBoard, score + 400, nextMoves);
      return;
    }

    // 3. Color Bomb + Normal / Wrapped: clears all candies of that color
    if (t1.special === 'color_bomb' || t2.special === 'color_bomb') {
      const targetColor = t1.special === 'color_bomb' ? t2.color : t1.color;
      sound.playColorBomb();

      const clearedBoard = board.map((row) =>
        row.map((t) => {
          if (!t) return null;
          if (t.color === targetColor || t.special === 'color_bomb') {
            return null;
          }
          return t;
        })
      );

      setBoard(clearedBoard);
      await sleep(220);

      const nextMoves = moves - 1;
      setMoves(nextMoves);
      await runCascade(clearedBoard, score + 300, nextMoves);
      return;
    }

    // 4. Striped + Striped: cross blast
    if (
      (t1.special === 'striped_h' || t1.special === 'striped_v') &&
      (t2.special === 'striped_h' || t2.special === 'striped_v')
    ) {
      sound.playSpecialBlast();
      setBlastEffects([
        { id: generateUniqueId(), row: p2.row, col: p2.col, direction: 'h' },
        { id: generateUniqueId(), row: p2.row, col: p2.col, direction: 'v' },
      ]);

      const clearedBoard = board.map((row, r) =>
        row.map((t, c) => {
          if (r === p2.row || c === p2.col) return null;
          return t;
        })
      );
      setBoard(clearedBoard);
      await sleep(260);

      const nextMoves = moves - 1;
      setMoves(nextMoves);
      await runCascade(clearedBoard, score + 250, nextMoves);
      return;
    }

    // 5. Normal Swap logic
    sound.playSwap();

    // Swap pieces in local board
    const swappedBoard = board.map((row) => [...row]);
    swappedBoard[p1.row][p1.col] = { ...t2, row: p1.row, col: p1.col };
    swappedBoard[p2.row][p2.col] = { ...t1, row: p2.row, col: p2.col };

    setBoard(swappedBoard);
    await sleep(200);

    // Evaluate matches on swapped board
    const evalResult = evaluateBoardMatches(swappedBoard);
    if (evalResult.matchedPositions.length === 0 && evalResult.newSpecials.length === 0) {
      // Invalid swap: animate back!
      sound.playInvalid();
      const revertedBoard = board.map((row) => [...row]);
      revertedBoard[p1.row][p1.col] = t1;
      revertedBoard[p2.row][p2.col] = t2;
      setBoard(revertedBoard);
      setIsProcessing(false);
      return;
    }

    // Valid swap: deduct move and run cascade!
    const nextMoves = moves - 1;
    setMoves(nextMoves);
    await runCascade(swappedBoard, score, nextMoves);
  };

  // Booster Interactions
  const handleBoosterClick = async (row: number, col: number) => {
    if (!activeBooster || boosterCounts[activeBooster] <= 0 || isProcessing) return;

    const targetTile = board[row][col];
    if (!targetTile) return;

    if (activeBooster === 'hammer') {
      sound.playExplosion();
      setBoosterCounts((prev) => ({ ...prev, hammer: prev.hammer - 1 }));
      setActiveBooster(null);

      setBlastEffects([{ id: generateUniqueId(), row, col, direction: 'area' }]);

      // Clear the hammered tile
      const updated = board.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? null : c))
      );
      setBoard(updated);
      await sleep(200);
      await runCascade(updated, score + 50, moves);
      return;
    }

    if (activeBooster === 'color_bomb') {
      sound.playColorBomb();
      setBoosterCounts((prev) => ({ ...prev, color_bomb: prev.color_bomb - 1 }));
      setActiveBooster(null);

      const updated = board.map((r, rIdx) =>
        r.map((c, cIdx) => {
          if (rIdx === row && cIdx === col && c) {
            return { ...c, special: 'color_bomb' as const };
          }
          return c;
        })
      );
      setBoard(updated);
      return;
    }

    if (activeBooster === 'free_swap') {
      if (!freeSwapFirst) {
        setFreeSwapFirst({ row, col });
      } else {
        const isNeighbor =
          Math.abs(freeSwapFirst.row - row) + Math.abs(freeSwapFirst.col - col) === 1;
        if (isNeighbor) {
          setBoosterCounts((prev) => ({ ...prev, free_swap: prev.free_swap - 1 }));
          setActiveBooster(null);
          const first = freeSwapFirst;
          setFreeSwapFirst(null);

          sound.playSwap();
          const t1 = board[first.row][first.col];
          const t2 = board[row][col];
          if (t1 && t2) {
            const swapped = board.map((r) => [...r]);
            swapped[first.row][first.col] = { ...t2, row: first.row, col: first.col };
            swapped[row][col] = { ...t1, row, col };
            setBoard(swapped);
            await sleep(200);
            await runCascade(swapped, score, moves);
          }
        } else {
          setFreeSwapFirst({ row, col });
        }
      }
    }
  };

  // Click handler for tiles
  const handleTileClick = (row: number, col: number) => {
    if (isProcessing || gameStatus !== 'playing') return;

    // If booster is active, delegate to booster handler
    if (activeBooster) {
      handleBoosterClick(row, col);
      return;
    }

    if (!selectedTile) {
      setSelectedTile({ row, col });
    } else {
      if (selectedTile.row === row && selectedTile.col === col) {
        // Deselect
        setSelectedTile(null);
        return;
      }

      const isNeighbor =
        Math.abs(selectedTile.row - row) + Math.abs(selectedTile.col - col) === 1;

      if (isNeighbor) {
        const from = selectedTile;
        const to = { row, col };
        setSelectedTile(null);
        executeSwap(from, to);
      } else {
        // Switch selection to new tile
        setSelectedTile({ row, col });
      }
    }
  };

  // Swipe handler for tiles
  const handleTileSwipe = (from: Position, to: Position) => {
    if (isProcessing || gameStatus !== 'playing' || activeBooster) return;
    setSelectedTile(null);
    executeSwap(from, to);
  };

  const unusedMoves = Math.max(0, moves);
  const bonusScore = unusedMoves * 150;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-rose-100 to-amber-200 flex flex-col items-center justify-between p-3 sm:p-5 font-sans relative overflow-x-hidden selection:bg-pink-300">
      {/* Decorative Pastel Backdrops */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber-300/30 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="w-full max-w-lg flex flex-col items-center z-10 my-auto">
        {/* Top Header & Stats */}
        <TopBar
          score={score}
          moves={moves}
          levelConfig={currentLevel}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Shuffling Notification */}
        {isShuffling && (
          <div className="mb-2 py-1 px-4 rounded-full bg-amber-600 text-white text-xs font-bold shadow-md animate-bounce">
            無路可走，重新洗牌中...
          </div>
        )}

        {/* Interactive Match-3 Game Board */}
        <GameBoard
          board={board}
          selectedTile={selectedTile || freeSwapFirst}
          hintTiles={hintTiles}
          activeBooster={activeBooster}
          comboBanner={comboBanner}
          floatingScores={floatingScores}
          blastEffects={blastEffects}
          onTileClick={handleTileClick}
          onTileSwipe={handleTileSwipe}
          isProcessing={isProcessing}
        />

        {/* Power-up Boosters */}
        <BoosterBar
          activeBooster={activeBooster}
          boosterCounts={boosterCounts}
          onSelectBooster={(b) => {
            setActiveBooster(b);
            setFreeSwapFirst(null);
            setSelectedTile(null);
          }}
          isProcessing={isProcessing}
        />
      </main>

      {/* Level Completion / Loss Modal */}
      <LevelModal
        status={gameStatus}
        score={score + (gameStatus === 'won' ? bonusScore : 0)}
        levelConfig={currentLevel}
        unusedMoves={unusedMoves}
        bonusScore={bonusScore}
        hasNextLevel={levelIndex < LEVELS.length - 1}
        onNextLevel={handleNextLevel}
        onRestartLevel={handleRestart}
      />

      {/* Help & Mechanics Tutorial Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
