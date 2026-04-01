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

// 星云配置
interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  driftX: number;
  driftY: number;
  phase: number;
}

// 流星配置
interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  active: boolean;
  tail: { x: number; y: number; opacity: number }[];
}

// 主题颜色配置
const COLORS = {
  light: {
    star: 'rgba(128, 90, 213, 0.8)', // primary 紫色
    starFar: 'rgba(128, 90, 213, 0.4)',
    nebula: 'rgba(128, 90, 213, 0.08)',
    moonGlow: 'rgba(255, 220, 150, 0.15)',
  },
  dark: {
    star: 'rgba(180, 150, 255, 0.9)',
    starFar: 'rgba(180, 150, 255, 0.5)',
    nebula: 'rgba(128, 90, 213, 0.12)',
    moonGlow: 'rgba(255, 220, 150, 0.2)',
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
  const nebulasRef = useRef<Nebula[]>([]);
  const meteorRef = useRef<Meteor | null>(null);
  const nextMeteorTimeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDarkRef = useRef(getIsDark());

  // 生成星云
  const generateNebulas = useCallback((width: number, height: number): Nebula[] => {
    const nebulas: Nebula[] = [];
    const count = Math.floor(Math.random() * 2) + 3;

    for (let i = 0; i < count; i++) {
      nebulas.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 100 + 80,
        color: COLORS.light.nebula,
        opacity: Math.random() * 0.08 + 0.03,
        driftX: (Math.random() - 0.5) * 0.1,
        driftY: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return nebulas;
  }, []);

  // 生成流星
  const generateMeteor = useCallback((width: number, height: number): Meteor => {
    const startX = Math.random() * width * 0.5 + width * 0.3;
    const startY = -20;

    return {
      x: startX,
      y: startY,
      length: Math.random() * 80 + 60,
      speed: Math.random() * 8 + 6,
      opacity: Math.random() * 0.5 + 0.4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // 约 45 度角
      active: true,
      tail: [],
    };
  }, []);

  // 绘制流星
  const drawMeteor = useCallback((
    ctx: CanvasRenderingContext2D,
    meteor: Meteor | null,
    width: number,
    height: number,
    isDark: boolean
  ) => {
    if (!meteor || !meteor.active) return;

    const tailLength = meteor.length;
    const tailX = meteor.x - Math.cos(meteor.angle) * tailLength;
    const tailY = meteor.y - Math.sin(meteor.angle) * tailLength;

    // 创建渐变拖尾
    const gradient = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
    const baseColor = isDark ? '200, 180, 255' : '180, 150, 255';
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, `rgba(${baseColor}, ${meteor.opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${meteor.opacity})`);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(meteor.x, meteor.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 流星头部光点
    ctx.beginPath();
    ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
    ctx.fill();

    // 更新位置
    meteor.x += Math.cos(meteor.angle) * meteor.speed;
    meteor.y += Math.sin(meteor.angle) * meteor.speed;

    // 检查是否超出边界
    if (meteor.x > width + 50 || meteor.y > height + 50) {
      meteor.active = false;
    }
  }, []);

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

  // 绘制星云
  const drawNebulas = useCallback((
    ctx: CanvasRenderingContext2D,
    nebulas: Nebula[],
    time: number,
    width: number,
    height: number,
    isDark: boolean
  ) => {
    nebulas.forEach((nebula) => {
      // 缓慢漂移
      nebula.x += nebula.driftX;
      nebula.y += nebula.driftY;

      // 边界循环
      if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
      if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
      if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
      if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

      // 呼吸效果
      const breathe = Math.sin(time * 0.2 + nebula.phase) * 0.02;
      const currentOpacity = nebula.opacity + breathe;
      const currentRadius = nebula.radius + Math.sin(time * 0.15 + nebula.phase) * 10;

      const gradient = ctx.createRadialGradient(
        nebula.x, nebula.y, 0,
        nebula.x, nebula.y, currentRadius
      );

      const color = isDark ? COLORS.dark.nebula : COLORS.light.nebula;
      gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${currentOpacity})`));
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }, []);

  // 绘制抽象月亮光晕
  const drawMoonGlow = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    isDark: boolean
  ) => {
    // 月亮位置：右上象限
    const moonX = width * 0.8;
    const moonY = height * 0.2;

    // 呼吸效果
    const breathe = Math.sin(time * 0.3) * 0.03;
    const baseOpacity = isDark ? 0.2 : 0.12;
    const currentOpacity = baseOpacity + breathe;

    // 多层光晕
    const layers = [
      { radius: 250, opacity: currentOpacity * 0.3 },
      { radius: 180, opacity: currentOpacity * 0.5 },
      { radius: 100, opacity: currentOpacity * 0.7 },
    ];

    const color = isDark ? COLORS.dark.moonGlow : COLORS.light.moonGlow;

    layers.forEach((layer) => {
      const gradient = ctx.createRadialGradient(
        moonX, moonY, 0,
        moonX, moonY, layer.radius
      );
      gradient.addColorStop(0, color.replace(/[\d.]+\)$/, `${layer.opacity})`));
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(moonX, moonY, layer.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
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

    // 重新生成星云
    nebulasRef.current = generateNebulas(canvas.width, canvas.height);
  }, [generateStars, generateNebulas]);

  // 动画循环
  const animate = useCallback(() => {
    // 可见性检测
    if (!isVisibleRef.current) {
      animationRef.current = null;
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const time = Date.now() / 1000;
    const isDark = isDarkRef.current; // 使用 ref 而非函数调用

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制月亮光晕（最底层）
    drawMoonGlow(ctx, canvas.width, canvas.height, time, isDark);

    // 绘制星云（在星星之前，作为背景层）
    drawNebulas(ctx, nebulasRef.current, time, canvas.width, canvas.height, isDark);

    // 绘制星星
    drawStars(ctx, starsRef.current, time, isDark);

    // 流星逻辑
    const now = Date.now();
    if (!meteorRef.current?.active && now > nextMeteorTimeRef.current) {
      meteorRef.current = generateMeteor(canvas.width, canvas.height);
      // 3-8 秒后出现下一颗流星
      nextMeteorTimeRef.current = now + (Math.random() * 5000 + 3000);
    }
    drawMeteor(ctx, meteorRef.current, canvas.width, canvas.height, isDark);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawStars, drawNebulas, drawMoonGlow, generateMeteor, drawMeteor]);

  // 防抖的 resize 处理
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      resizeCanvas();
    }, 200);
  }, [resizeCanvas]);

  // 可见性检测
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      if (isVisibleRef.current && !animationRef.current) {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [animate]);

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver(() => {
      isDarkRef.current = getIsDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 初始化
  useEffect(() => {
    resizeCanvas();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, animate, handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
