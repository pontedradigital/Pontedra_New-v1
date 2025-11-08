import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ShaderLinesBackgroundProps {
  lineColor1?: string;
  lineColor2?: string;
  backgroundColor?: string;
  opacity?: number;
  blurAmount?: number;
}

const ShaderLinesBackground: React.FC<ShaderLinesBackgroundProps> = ({
  lineColor1 = '#00ffae', // Neon Green
  lineColor2 = '#00b4ff', // Blue
  backgroundColor = '#0a0f1c', // Dark background
  opacity = 0.3,
  blurAmount = 5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const scrollYRef = useRef<number>(0);
  const targetYOffsetRef = useRef<number>(0);
  const currentYOffsetRef = useRef<number>(0);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    scrollYRef.current = window.scrollY;
    // Parallax: linhas se movem mais devagar que o scroll
    targetYOffsetRef.current = -scrollYRef.current * 0.1; // Ajuste o multiplicador para a força desejada do parallax
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Interpolação suave do offset Y
    currentYOffsetRef.current += (targetYOffsetRef.current - currentYOffsetRef.current) * 0.05; // Fator de easing

    const numLines = 50; // Número de linhas verticais
    const lineSpacing = width / numLines;
    const time = frameCount * 0.02; // Velocidade da animação

    for (let i = 0; i < numLines; i++) {
      const x = i * lineSpacing + Math.sin(i * 0.1 + time * 0.5) * 10; // Onda horizontal sutil
      const waveHeight = Math.sin(i * 0.05 + time) * 20 + 30; // Amplitude da onda vertical
      const startY = height / 2 - waveHeight / 2 + Math.sin(i * 0.2 + time * 0.8) * 50 + currentYOffsetRef.current;
      const endY = height / 2 + waveHeight / 2 + Math.sin(i * 0.2 + time * 0.8) * 50 + currentYOffsetRef.current;

      const gradient = ctx.createLinearGradient(0, startY, 0, endY);
      gradient.addColorStop(0, lineColor1);
      gradient.addColorStop(0.5, lineColor2);
      gradient.addColorStop(1, lineColor1);

      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.sin(i * 0.08 + time * 0.3) * 2 + 3; // Espessura variável
      ctx.lineCap = 'round';

      // Aplica efeito de brilho (glow)
      ctx.shadowBlur = blurAmount;
      ctx.shadowColor = i % 2 === 0 ? lineColor1 : lineColor2; // Alterna a cor do brilho

      ctx.stroke();
    }
  }, [canvasSize, lineColor1, lineColor2, backgroundColor, blurAmount]);

  const animate = useCallback((frameCount: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      draw(ctx, frameCount);
    }
    animationFrameId.current = requestAnimationFrame(() => animate(frameCount + 1));
  }, [draw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', handleScroll);

    animationFrameId.current = requestAnimationFrame(() => animate(0));

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [resizeCanvas, handleScroll, animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: opacity,
        zIndex: -1, // Garante que esteja atrás do conteúdo
      }}
    />
  );
};

export default ShaderLinesBackground;