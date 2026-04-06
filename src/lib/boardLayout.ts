/** Classic perimeter path: 40 tiles on an 11×11 grid (hollow center). */
export const BOARD_ROWS = 11;
export const BOARD_COLS = 11;

/** Build grid[row][col] = tile index 0..39 or null (center / unused). */
export function buildPerimeterIndexGrid(): (number | null)[][] {
  const g: (number | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null)
  );
  let idx = 0;
  for (let c = 0; c <= 10; c++) g[10][c] = idx++;
  for (let r = 9; r >= 0; r--) g[r][10] = idx++;
  for (let c = 9; c >= 0; c--) g[0][c] = idx++;
  for (let r = 1; r <= 9; r++) g[r][0] = idx++;
  return g;
}
