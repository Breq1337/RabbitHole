'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface TransformState {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.25;
const MAX_K = 4;
const ZOOM_SENSITIVITY = 0.002;

export function useGraphPanZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, k: 1 });
  const transformRef = useRef(transform);
  const dragStart = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const transformString = `translate(${transform.x},${transform.y}) scale(${transform.k})`;

  const recenter = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      setTransform((prev) => ({
        ...prev,
        k: Math.min(MAX_K, Math.max(MIN_K, prev.k * (1 + delta))),
      }));
    },
    []
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const t = transformRef.current;
    dragStart.current = {
      x: t.x,
      y: t.y,
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    setTransform((prev) => ({
      ...prev,
      x: dragStart.current!.x + dx,
      y: dragStart.current!.y + dy,
    }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragStart.current = null;
  }, []);

  return {
    transform: transformString,
    setTransform,
    recenter,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
