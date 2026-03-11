/**
 * Corridor layout: positions for path nodes along a vertical curve.
 * Used by ConnectionGraph for consistent node placement.
 */

const PADDING = 88;
const NODE_RADIUS = 44;
const STEP_Y = 130;
/** Extra vertical space for node name label below the circle. */
const LABEL_SPACE = 24;

export interface GraphNodePosition {
  x: number;
  y: number;
}

export function getPathLayout(nodeCount: number): {
  positions: GraphNodePosition[];
  width: number;
  height: number;
  nodeRadius: number;
} {
  if (nodeCount === 0) {
    return {
      positions: [],
      width: PADDING * 2 + NODE_RADIUS * 2,
      height: PADDING * 2,
      nodeRadius: NODE_RADIUS,
    };
  }

  const centerX = PADDING + NODE_RADIUS;
  const positions: GraphNodePosition[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const y = PADDING + NODE_RADIUS + i * STEP_Y;
    positions.push({ x: centerX, y });
  }

  const height =
    PADDING * 2 + (nodeCount - 1) * STEP_Y + NODE_RADIUS * 2 + LABEL_SPACE;
  const width = PADDING * 2 + NODE_RADIUS * 2;

  return {
    positions,
    width,
    height,
    nodeRadius: NODE_RADIUS,
  };
}

/** Quadratic Bezier path from (x1,y1) to (x2,y2) with control point offset for curve. */
export function getEdgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveOffset = 40
): string {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const cx = midX + (dx === 0 ? curveOffset : 0);
  const cy = midY + (dx === 0 ? 0 : curveOffset);
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/** Get point at t in [0,1] along quadratic Bezier for label placement. */
export function getPointOnQuadraticBezier(
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  t: number
): { x: number; y: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt1 = 2 * mt * t;
  const t2 = t * t;
  return {
    x: mt2 * x1 + mt1 * cx + t2 * x2,
    y: mt2 * y1 + mt1 * cy + t2 * y2,
  };
}
