import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  duration?: number; // duration of the effect in milliseconds
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  '#FF3F6C', // Hot Pink
  '#3B82F6', // Vibrant Blue
  '#10B981', // Emerald Green
  '#F59E0B', // Amber Gold
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#06B6D4', // Cyan
];

const SHAPES: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

export default function ConfettiEffect({ duration = 4000, onComplete }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let isRunning = true;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create a particle
    const createParticle = (x: number, y: number, angle: number, speed: number): Particle => {
      const angleRad = (angle * Math.PI) / 180;
      return {
        x,
        y,
        size: Math.random() * 8 + 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        vx: Math.cos(angleRad) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angleRad) * speed + (Math.random() - 0.5) * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      };
    };

    // Trigger initial bursts from corners
    const triggerInitialBursts = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Left corner shooting up-right
      for (let i = 0; i < 70; i++) {
        const speed = Math.random() * 15 + 10;
        const angle = -45 + (Math.random() - 0.5) * 30; // -30 to -60 degrees
        particles.push(createParticle(0, height, angle, speed));
      }

      // Right corner shooting up-left
      for (let i = 0; i < 70; i++) {
        const speed = Math.random() * 15 + 10;
        const angle = -135 + (Math.random() - 0.5) * 30; // -120 to -150 degrees
        particles.push(createParticle(width, height, angle, speed));
      }
    };

    triggerInitialBursts();

    // Spawn minor continuous streams from corners for the first half of duration
    const startTime = Date.now();
    let lastSpawn = Date.now();

    const animate = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = Date.now() - startTime;

      // Spawn continuous sprinkles
      if (elapsed < duration * 0.6 && Date.now() - lastSpawn > 60) {
        lastSpawn = Date.now();
        // Left corner stream
        particles.push(createParticle(0, canvas.height, -45 + (Math.random() - 0.5) * 20, Math.random() * 8 + 8));
        // Right corner stream
        particles.push(createParticle(canvas.width, canvas.height, -135 + (Math.random() - 0.5) * 20, Math.random() * 8 + 8));
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Physics
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // air resistance
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out as it ages or falls off screen
        if (elapsed > duration * 0.7) {
          p.opacity -= 0.02;
        }

        // Draw
        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          if (p.shape === 'circle') {
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'triangle') {
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          } else {
            // square
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.restore();
        }
      });

      // Filter out dead or out-of-bounds particles
      particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 20 && p.x > -20 && p.x < canvas.width + 20);

      if (elapsed < duration || particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        isRunning = false;
        if (onComplete) onComplete();
      }
    };

    animate();

    // Fallback timer to clean up
    const timer = setTimeout(() => {
      isRunning = false;
      if (onComplete) onComplete();
    }, duration + 500);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      id="confetti-canvas"
    />
  );
}
