"use client";
import { useEffect, useRef } from "react";

interface MatrixRainSingleProps {
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  speed?: number;
  fadeEffect?: number;
  className?: string;
}

export default function MatrixRainSingle({
  width = 20,
  height = 230,
  color = "#0F0",
  fontSize = 15,
  speed = 100,
  fadeEffect = 0.05,
  className = "",
}: MatrixRainSingleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    let y = 0;

    function drawLine() {
      if (!ctx || !canvas) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeEffect})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      const txt = Math.random() > 0.5 ? "1" : "0";
      ctx.fillText(txt, 0, y);

      y += 20;
      if (y > canvas.height) y = 0;

      setTimeout(() => requestAnimationFrame(drawLine), speed);
    }

    drawLine();
  }, [width, height, color, fontSize, speed, fadeEffect]);

  return <canvas ref={canvasRef} className={className} />;
}
