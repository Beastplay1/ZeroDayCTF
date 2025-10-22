"use client";
import { useEffect, useRef } from "react";

interface MatrixRainTriangleProps {
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  speed?: number;
  fadeEffect?: number;
  columns?: number;
  className?: string;
}

export default function MatrixRainTriangle({
  width = 200,
  height = 230,
  color = "#0F0",
  fontSize = 15,
  speed = 100,
  fadeEffect = 0.02,
  columns = 10,
  className = "",
}: MatrixRainTriangleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Create diagonal cascade pattern
    const drops: number[] = [];
    const resetPositions: number[] = [];
    const spacing = fontSize * 1.2;
    canvas.width = spacing * columns;

    for (let i = 0; i < columns; i++) {
      const initialY = height - i * 20;
      drops.push(initialY);
      resetPositions.push(initialY);
    }

    function drawTriangle() {
      if (!ctx || !canvas) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeEffect})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, i) => {
        const txt = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(txt, i * spacing, y);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = resetPositions[i];
        }
        drops[i] += 20;
      });

      setTimeout(() => requestAnimationFrame(drawTriangle), speed);
    }

    drawTriangle();
  }, [width, height, color, fontSize, speed, fadeEffect, columns]);

  return <canvas ref={canvasRef} className={className} />;
}
