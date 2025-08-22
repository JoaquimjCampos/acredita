// Simple confetti animation using canvas
import React, { useEffect, useRef } from 'react';

const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth;
    const H = 300;
    canvas.width = W;
    canvas.height = H;
    const particles: any[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 6 + 4,
        d: Math.random() * 80,
        color: `hsl(${Math.random() * 360},80%,60%)`,
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
      });
    }
    let angle = 0;
    let animationFrame: number;
    function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
      angle += 0.01;
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.y += Math.cos(angle + p.d) + 2 + p.r / 2;
        p.x += Math.sin(angle);
        p.tiltAngle += 0.1;
        p.tilt = Math.sin(p.tiltAngle) * 15;
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.fill();
      }
      animationFrame = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, W, H);
    }, 2500);
    return () => cancelAnimationFrame(animationFrame);
  }, [show]);

  return show ? (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 50 }} />
  ) : null;
};

export default Confetti;
