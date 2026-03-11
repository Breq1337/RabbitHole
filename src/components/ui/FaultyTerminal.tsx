'use client';

import React, { useRef, useEffect, useMemo } from 'react';

// Hex to normalized RGB [0-1]
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, '').match(/.{2}/g);
  if (!m) return [1, 1, 1];
  return [parseInt(m[0], 16) / 255, parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255];
}

export interface FaultyTerminalProps {
  scale?: number;
  digitSize?: number;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
}

const defaultProps: Required<Omit<FaultyTerminalProps, 'className' | 'style'>> = {
  scale: 2.7,
  digitSize: 1.5,
  scanlineIntensity: 0.3,
  glitchAmount: 1,
  flickerAmount: 1,
  noiseAmp: 0,
  chromaticAberration: 0,
  dither: 0,
  curvature: 0.2,
  tint: '#ffffff',
  mouseReact: true,
  mouseStrength: 0.2,
  brightness: 1,
};

const vertexShader = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uScanlineIntensity;
  uniform float uGlitchAmount;
  uniform float uFlickerAmount;
  uniform float uNoiseAmp;
  uniform float uChromaticAberration;
  uniform float uDither;
  uniform float uCurvature;
  uniform vec3 uTint;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uBrightness;

  varying vec2 vUv;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv - 0.5;

    // Curvature (barrel distortion)
    float r2 = dot(uv, uv);
    float f = 1.0 + r2 * (uCurvature * 2.0);
    uv *= f;
    uv += 0.5;
    if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    // Base color (dark terminal green/gray)
    vec3 col = vec3(0.06, 0.08, 0.06);

    // Scanlines
    float scanline = sin(uv.y * uResolution.y * 0.5) * 0.5 + 0.5;
    col -= scanline * uScanlineIntensity;

    // Flicker
    float flicker = 1.0 - random(vec2(uTime * 20.0, 0.0)) * uFlickerAmount;
    col *= flicker;

    // Glitch (horizontal shift)
    float glitch = step(0.98, random(vec2(uTime * 30.0, uv.y * 10.0))) * uGlitchAmount;
    col.r = col.r + random(vec2(uv.x + uTime, uv.y)) * glitch;
    col.g = col.g + random(vec2(uv.x + uTime + 0.1, uv.y)) * glitch;
    col.b = col.b + random(vec2(uv.x + uTime + 0.2, uv.y)) * glitch;

    // Noise
    col += (noise(uv * 400.0 + uTime * 10.0) - 0.5) * uNoiseAmp;

    // Mouse ripple / vignette
    vec2 m = uMouse - 0.5;
    float dist = length(uv - 0.5 - m * uMouseStrength);
    col *= 1.0 - smoothstep(0.3, 0.8, dist) * uMouseStrength;

    // Chromatic aberration (subtle RGB shift)
    col.r = col.r + (random(uv + vec2(uTime * 0.5, 0)) - 0.5) * uChromaticAberration;
    col.g = col.g + (random(uv + vec2(uTime * 0.5 + 0.1, 0)) - 0.5) * uChromaticAberration;
    col.b = col.b + (random(uv + vec2(uTime * 0.5 + 0.2, 0)) - 0.5) * uChromaticAberration;

    // Dither
    float d = random(uv * 100.0 + uTime) * uDither;
    col += d - uDither * 0.5;

    // Tint & brightness
    col *= uTint * uBrightness;
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function FaultyTerminal({
  scale = defaultProps.scale,
  digitSize = defaultProps.digitSize,
  scanlineIntensity = defaultProps.scanlineIntensity,
  glitchAmount = defaultProps.glitchAmount,
  flickerAmount = defaultProps.flickerAmount,
  noiseAmp = defaultProps.noiseAmp,
  chromaticAberration = defaultProps.chromaticAberration,
  dither = defaultProps.dither,
  curvature = defaultProps.curvature,
  tint = defaultProps.tint,
  mouseReact = defaultProps.mouseReact,
  mouseStrength = defaultProps.mouseStrength,
  brightness = defaultProps.brightness,
  className = '',
  style = {},
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: [1080, 1080] as [number, number] },
    uScanlineIntensity: { value: scanlineIntensity },
    uGlitchAmount: { value: glitchAmount },
    uFlickerAmount: { value: flickerAmount },
    uNoiseAmp: { value: noiseAmp },
    uChromaticAberration: { value: chromaticAberration },
    uDither: { value: dither },
    uCurvature: { value: curvature },
    uTint: { value: hexToRgb(tint) as [number, number, number] },
    uMouse: { value: [0.5, 0.5] as [number, number] },
    uMouseStrength: { value: mouseStrength },
    uBrightness: { value: brightness },
  }), [
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    dither,
    curvature,
    tint,
    mouseStrength,
    brightness,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('webgl', { alpha: false });
    if (!ctx) return;

    const gl = ctx;

    const compile = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(vertexShader, gl.VERTEX_SHADER);
    const fs = compile(fragmentShader, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const uvs = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLoc = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    const setUniform = (name: string, value: number | number[]) => {
      const loc = gl.getUniformLocation(program, name);
      if (loc === null) return;
      if (typeof value === 'number') {
        gl.uniform1f(loc, value);
      } else if (value.length === 2) {
        gl.uniform2fv(loc, value);
      } else if (value.length === 3) {
        gl.uniform3fv(loc, value);
      }
    };

    let raf = 0;
    const render = () => {
      const time = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTimeRef.current;
      uniforms.uTime.value = time * 0.001;
      uniforms.uMouse.value[0] = mouseRef.current.x;
      uniforms.uMouse.value[1] = mouseRef.current.y;

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      setUniform('uTime', uniforms.uTime.value);
      setUniform('uResolution', uniforms.uResolution.value);
      setUniform('uScanlineIntensity', uniforms.uScanlineIntensity.value);
      setUniform('uGlitchAmount', uniforms.uGlitchAmount.value);
      setUniform('uFlickerAmount', uniforms.uFlickerAmount.value);
      setUniform('uNoiseAmp', uniforms.uNoiseAmp.value);
      setUniform('uChromaticAberration', uniforms.uChromaticAberration.value);
      setUniform('uDither', uniforms.uDither.value);
      setUniform('uCurvature', uniforms.uCurvature.value);
      setUniform('uTint', uniforms.uTint.value);
      setUniform('uMouse', uniforms.uMouse.value);
      setUniform('uMouseStrength', uniforms.uMouseStrength.value);
      setUniform('uBrightness', uniforms.uBrightness.value);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };

    const resize = () => {
      const w = container.clientWidth || 1080;
      const h = container.clientHeight || 1080;
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      uniforms.uResolution.value[0] = w;
      uniforms.uResolution.value[1] = h;
    };

    resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
      if (mouseReact) {
        const onMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          mouseRef.current.x = (e.clientX - rect.left) / rect.width;
          mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
        };
        container.addEventListener('mousemove', onMove);
        const cleanup = () => {
          window.removeEventListener('resize', resize);
          container.removeEventListener('mousemove', onMove);
          cancelAnimationFrame(raf);
        };
        render();
        return cleanup;
      }
    }
    render();
    return () => cancelAnimationFrame(raf);
  }, [mouseReact]);

  const size = 1080;
  const scaledSize = size * scale;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          inset: 0,
        }}
        width={Math.floor(scaledSize)}
        height={Math.floor(scaledSize)}
      />
    </div>
  );
}
