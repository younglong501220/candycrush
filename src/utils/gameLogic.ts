import { CandyColor, CandyTile, Position, SpecialType } from '../types';
import { ALL_COLORS, BOARD_COLS, BOARD_ROWS } from './constants';

let idCounter = 1;
export function generateUniqueId(): string {
  return `candy-${Date.now()}-${idCounter++}-${Math.random().toString(36).substring(2, 6)}`;
}

export function createRandomTile(row: number, col: number, allowedColors: CandyColor[]): CandyTile {
  const color = allowedColors[Math.floor(Math.random() * allowedColors.length)];
  return {
    id: generateUniqueId(),
    color,
    special: 'none',
    row,
    col,
  };
}

/**
 * Initializes an 8x8 board without any starting 3-matches and with at least one guaranteed move.
 */
export function createInitialBoard(colorsCount: number = 5): (CandyTile | null)[][] {
  const allowedColors = ALL_COLORS.slice(0, colorsCount);
  let board: (CandyTile | null)[][] = [];
  let attempts = 0;

  while (attempts < 50) {
    attempts++;
    board = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      board[r] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        let color: CandyColor;
        let colorTries = 0;
        do {
          color = allowedColors[Math.floor(Math.random() * allowedColors.length)];
          colorTries++;
        } while (
          colorTries < 20 &&
          ((c >= 2 && board[r][c - 1]?.color === color && board[r][c - 2]?.color === color) ||
            (r >= 2 && board[r - 1][c]?.color === color && board[r - 2][c]?.color === color))
        );

        board[r][c] = {
          id: generateUniqueId(),
          color,
          special: 'none',
          row: r,
          col: c,
        };
      }
    }

    if (hasPossibleMoves(board)) {
      return board;
    }
  }

  return board;
}

export interface MatchResult {
  matchedPositions: Position[];
  newSpecials: { pos: Position; special: SpecialType; color: CandyColor }[];
  blastEffects: { pos: Position; blastDirection: 'h' | 'v' | 'both' | 'area' }[];
}

/**
 * Detects all 3+ matches, detects 4-in-a-row (striped), 5-in-a-row (color bomb), L/T shapes (wrapped),
 * and recurses to include special activations (striped lines, wrapped blast, etc).
 */
export function evaluateBoardMatches(board: (CandyTile | null)[][]): MatchResult {
  const matchedCoords = new Set<string>();
  const newSpecials: { pos: Position; special: SpecialType; color: CandyColor }[] = [];
  const blastEffects: { pos: Position; blastDirection: 'h' | 'v' | 'both' | 'area' }[] = [];

  interface LineMatch {
    type: 'h' | 'v';
    positions: Position[];
    color: CandyColor;
  }

  const lines: LineMatch[] = [];

  // 1. Horizontal lines
  for (let r = 0; r < BOARD_ROWS; r++) {
    let c = 0;
    while (c < BOARD_COLS) {
      const tile = board[r][c];
      if (!tile) {
        c++;
        continue;
      }
      let matchLen = 1;
      while (c + matchLen < BOARD_COLS && board[r][c + matchLen]?.color === tile.color) {
        matchLen++;
      }
      if (matchLen >= 3) {
        const linePositions: Position[] = [];
        for (let i = 0; i < matchLen; i++) {
          linePositions.push({ row: r, col: c + i });
          matchedCoords.add(`${r},${c + i}`);
        }
        lines.push({ type: 'h', positions: linePositions, color: tile.color });
        c += matchLen;
      } else {
        c++;
      }
    }
  }

  // 2. Vertical lines
  for (let c = 0; c < BOARD_COLS; c++) {
    let r = 0;
    while (r < BOARD_ROWS) {
      const tile = board[r][c];
      if (!tile) {
        r++;
        continue;
      }
      let matchLen = 1;
      while (r + matchLen < BOARD_ROWS && board[r + matchLen][c]?.color === tile.color) {
        matchLen++;
      }
      if (matchLen >= 3) {
        const linePositions: Position[] = [];
        for (let i = 0; i < matchLen; i++) {
          linePositions.push({ row: r + i, col: c });
          matchedCoords.add(`${r + i},${c}`);
        }
        lines.push({ type: 'v', positions: linePositions, color: tile.color });
        r += matchLen;
      } else {
        r++;
      }
    }
  }

  if (lines.length === 0) {
    return { matchedPositions: [], newSpecials: [], blastEffects: [] };
  }

  // 3. Determine if any L or T intersecting shapes exist
  const usedLines = new Set<LineMatch>();

  for (let i = 0; i < lines.length; i++) {
    const lineA = lines[i];
    if (usedLines.has(lineA)) continue;

    for (let j = i + 1; j < lines.length; j++) {
      const lineB = lines[j];
      if (usedLines.has(lineB)) continue;

      if (lineA.color === lineB.color && lineA.type !== lineB.type) {
        // Find intersection
        const intersection = lineA.positions.find((pA) =>
          lineB.positions.some((pB) => pA.row === pB.row && pA.col === pB.col)
        );

        if (intersection) {
          // Wrapped candy created at intersection!
          newSpecials.push({
            pos: intersection,
            special: 'wrapped',
            color: lineA.color,
          });
          usedLines.add(lineA);
          usedLines.add(lineB);
          break;
        }
      }
    }
  }

  // 4. Determine 5-in-a-row (color bomb) or 4-in-a-row (striped)
  for (const line of lines) {
    if (usedLines.has(line)) continue;

    if (line.positions.length >= 5) {
      // Color bomb created at middle
      const mid = line.positions[Math.floor(line.positions.length / 2)];
      newSpecials.push({
        pos: mid,
        special: 'color_bomb',
        color: line.color,
      });
      usedLines.add(line);
    } else if (line.positions.length === 4) {
      // Striped candy:
      // If horizontal match of 4, make it vertical stripe (clears column);
      // if vertical match of 4, make it horizontal stripe (clears row).
      const special: SpecialType = line.type === 'h' ? 'striped_v' : 'striped_h';
      const targetPos = line.positions[1];
      newSpecials.push({
        pos: targetPos,
        special,
        color: line.color,
      });
      usedLines.add(line);
    }
  }

  // 5. Expand cascade for any already-existing special candies inside matchedCoords
  const processedSpecials = new Set<string>();
  const toCheck = Array.from(matchedCoords);

  while (toCheck.length > 0) {
    const coordStr = toCheck.pop()!;
    if (processedSpecials.has(coordStr)) continue;
    processedSpecials.add(coordStr);

    const [r, c] = coordStr.split(',').map(Number);
    const tile = board[r]?.[c];
    if (!tile) continue;

    if (tile.special === 'striped_h') {
      blastEffects.push({ pos: { row: r, col: c }, blastDirection: 'h' });
      for (let colIdx = 0; colIdx < BOARD_COLS; colIdx++) {
        const key = `${r},${colIdx}`;
        if (!matchedCoords.has(key)) {
          matchedCoords.add(key);
          toCheck.push(key);
        }
      }
    } else if (tile.special === 'striped_v') {
      blastEffects.push({ pos: { row: r, col: c }, blastDirection: 'v' });
      for (let rowIdx = 0; rowIdx < BOARD_ROWS; rowIdx++) {
        const key = `${rowIdx},${c}`;
        if (!matchedCoords.has(key)) {
          matchedCoords.add(key);
          toCheck.push(key);
        }
      }
    } else if (tile.special === 'wrapped') {
      blastEffects.push({ pos: { row: r, col: c }, blastDirection: 'area' });
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
            const key = `${nr},${nc}`;
            if (!matchedCoords.has(key)) {
              matchedCoords.add(key);
              toCheck.push(key);
            }
          }
        }
      }
    } else if (tile.special === 'color_bomb') {
      // Explodes randomly selected most common color
      const colorCounts: Record<string, number> = {};
      for (let cr = 0; cr < BOARD_ROWS; cr++) {
        for (let cc = 0; cc < BOARD_COLS; cc++) {
          const clr = board[cr][cc]?.color;
          if (clr) colorCounts[clr] = (colorCounts[clr] || 0) + 1;
        }
      }
      let maxColor: CandyColor = 'red';
      let maxCount = -1;
      for (const [clr, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          maxColor = clr as CandyColor;
        }
      }
      for (let cr = 0; cr < BOARD_ROWS; cr++) {
        for (let cc = 0; cc < BOARD_COLS; cc++) {
          if (board[cr][cc]?.color === maxColor) {
            const key = `${cr},${cc}`;
            if (!matchedCoords.has(key)) {
              matchedCoords.add(key);
              toCheck.push(key);
            }
          }
        }
      }
    }
  }

  // Filter out any new special candies from being destroyed immediately on this step
  const matchedPositions: Position[] = [];
  for (const str of matchedCoords) {
    const [r, c] = str.split(',').map(Number);
    const isNewSpecial = newSpecials.some((ns) => ns.pos.row === r && ns.pos.col === c);
    if (!isNewSpecial) {
      matchedPositions.push({ row: r, col: c });
    }
  }

  return { matchedPositions, newSpecials, blastEffects };
}

/**
 * Checks whether any valid move exists on the current board.
 */
export function hasPossibleMoves(board: (CandyTile | null)[][]): boolean {
  // 1. Any Color Bomb on board can swap with any adjacent tile
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[r][c]?.special === 'color_bomb') {
        return true;
      }
    }
  }

  // 2. Horizontal swaps
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS - 1; c++) {
      if (wouldSwapCreateMatch(board, { row: r, col: c }, { row: r, col: c + 1 })) {
        return true;
      }
    }
  }

  // 3. Vertical swaps
  for (let r = 0; r < BOARD_ROWS - 1; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (wouldSwapCreateMatch(board, { row: r, col: c }, { row: r + 1, col: c })) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Finds a valid move on the board to highlight as a hint for the user.
 */
export function findHintMove(board: (CandyTile | null)[][]): { from: Position; to: Position } | null {
  // Check color bomb first
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[r][c]?.special === 'color_bomb') {
        const neighbor = c < BOARD_COLS - 1 ? { row: r, col: c + 1 } : { row: r, col: c - 1 };
        return { from: { row: r, col: c }, to: neighbor };
      }
    }
  }

  // Check horizontal swaps
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS - 1; c++) {
      if (wouldSwapCreateMatch(board, { row: r, col: c }, { row: r, col: c + 1 })) {
        return { from: { row: r, col: c }, to: { row: r, col: c + 1 } };
      }
    }
  }

  // Check vertical swaps
  for (let r = 0; r < BOARD_ROWS - 1; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (wouldSwapCreateMatch(board, { row: r, col: c }, { row: r + 1, col: c })) {
        return { from: { row: r, col: c }, to: { row: r + 1, col: c } };
      }
    }
  }

  return null;
}

function wouldSwapCreateMatch(board: (CandyTile | null)[][], p1: Position, p2: Position): boolean {
  const t1 = board[p1.row][p1.col];
  const t2 = board[p2.row][p2.col];
  if (!t1 || !t2) return false;

  // If either is a color bomb, it's always a valid move
  if (t1.special === 'color_bomb' || t2.special === 'color_bomb') return true;

  // Two specials combined is always a valid move!
  if (t1.special !== 'none' && t2.special !== 'none') return true;

  // Simulate swap
  const color1 = t1.color;
  const color2 = t2.color;

  // Check matches around p1 with color2
  if (checkPositionForMatch(board, p1.row, p1.col, color2, p2)) return true;
  // Check matches around p2 with color1
  if (checkPositionForMatch(board, p2.row, p2.col, color1, p1)) return true;

  return false;
}

function checkPositionForMatch(
  board: (CandyTile | null)[][],
  row: number,
  col: number,
  color: CandyColor,
  ignorePos: Position
): boolean {
  // Horizontal check
  let hCount = 1;
  // Look left
  let c = col - 1;
  while (c >= 0) {
    if (row === ignorePos.row && c === ignorePos.col) break;
    if (board[row][c]?.color === color) {
      hCount++;
      c--;
    } else break;
  }
  // Look right
  c = col + 1;
  while (c < BOARD_COLS) {
    if (row === ignorePos.row && c === ignorePos.col) break;
    if (board[row][c]?.color === color) {
      hCount++;
      c++;
    } else break;
  }
  if (hCount >= 3) return true;

  // Vertical check
  let vCount = 1;
  // Look up
  let r = row - 1;
  while (r >= 0) {
    if (r === ignorePos.row && col === ignorePos.col) break;
    if (board[r][col]?.color === color) {
      vCount++;
      r--;
    } else break;
  }
  // Look down
  r = row + 1;
  while (r < BOARD_ROWS) {
    if (r === ignorePos.row && col === ignorePos.col) break;
    if (board[r][col]?.color === color) {
      vCount++;
      r++;
    } else break;
  }
  if (vCount >= 3) return true;

  return false;
}

/**
 * Shuffles current tiles on board when no moves are left, ensuring no instant 3-matches.
 */
export function shuffleBoard(board: (CandyTile | null)[][], allowedColors: CandyColor[]): (CandyTile | null)[][] {
  const flattened: CandyTile[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const tile = board[r][c];
      if (tile) {
        flattened.push({ ...tile });
      }
    }
  }

  let attempts = 0;
  while (attempts < 40) {
    attempts++;
    // Shuffle array
    for (let i = flattened.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flattened[i], flattened[j]] = [flattened[j], flattened[i]];
    }

    const newBoard: (CandyTile | null)[][] = [];
    let idx = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      newBoard[r] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        const item = flattened[idx++];
        newBoard[r][c] = {
          ...item,
          row: r,
          col: c,
        };
      }
    }

    // Check if it has no matches already and has at least one possible move
    const result = evaluateBoardMatches(newBoard);
    if (result.matchedPositions.length === 0 && hasPossibleMoves(newBoard)) {
      return newBoard;
    }
  }

  return createInitialBoard(allowedColors.length);
}
