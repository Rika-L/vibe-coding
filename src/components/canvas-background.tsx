'use client';

import { useEffect, useRef, useCallback } from 'react';

// 星星配置
interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: 'far' | 'near';
}

// 主题颜色配置
const COLORS = {
  light: {
    star: 'rgba(128, 90, 213, 0.8)', // primary 紫色
    starFar: 'rgba(128, 90, 213, 0.4)',
  },
  dark: {
    star: 'rgba(180, 150, 255, 0.9)',
    starFar: 'rgba(180, 150, 255, 0.5)',
  },
};

// 检测当前主题
function getIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

interface CanvasBackgroundProps {
  className?: string;
}

export function CanvasBackground({ className }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);

  // 生成星星
  const generateStars = useCallback((width: number, height: number): Star[] => {
    const stars: Star[] = [];
    const baseCount = Math.floor((width * height) / 8000);

    // 远景星星
    const farCount = Math.floor(baseCount * 0.7);
    for (let i = 0; i < farCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 'far',
      });
    }

    // 近景星星
    const nearCount = Math.floor(baseCount * 0.3);
    for (let i = 0; i < nearCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.4 + 0.4,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        layer: 'near',
      });
    }

    return stars;
  }, []);

  // 绘制星星
  const drawStars = useCallback((
    ctx: CanvasRenderingContext2D,
    stars: Star[],
    time: number,
    isDark: boolean
  ) => {
    const colors = isDark ? COLORS.dark : COLORS.light;

    stars.forEach((star) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const currentOpacity = star.opacity + twinkle * 0.2;
      const color = star.layer === 'far' ? colors.starFar : colors.star;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(/[\d.]+\)$/, `${Math.max(0.1, currentOpacity)})`);
      ctx.fill();

      // 近景星星添加光晕
      if (star.layer === 'near' && star.size > 2) {
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        );
        gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${currentOpacity * 0.3})`));
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });
  }, []);

  // 初始化 canvas 尺寸
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // 重新生成星星
    starsRef.current = generateStars(canvas.width, canvas.height);
  }, [generateStars]);

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const time = Date.now() / 1000;
    const isDark = getIsDark();

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制星星
    drawStars(ctx, starsRef.current, time, isDark);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawStars]);

  // 初始化
  useEffect(() => {
    resizeCanvas();
    animate();

    // 监听窗口大小变化
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
