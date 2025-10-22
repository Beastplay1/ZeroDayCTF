"use client";
import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorClassName?: string;
}

export default function Typewriter({
  text,
  className = "",
  typingSpeed = 150,
  deletingSpeed = 150,
  pauseDuration = 2000,
  loop = true,
  showCursor = true,
  cursorClassName = "border-r-2 border-current animate-pulse ml-0.5"
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        if (loop) {
          setIsDeleting(true);
        }
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    const handleTyping = () => {
      if (!isDeleting && displayText.length < text.length) {
        setDisplayText(text.substring(0, displayText.length + 1));
      } else if (!isDeleting && displayText.length === text.length) {
        setIsPaused(true);
      } else if (isDeleting && displayText.length > 0) {
        setDisplayText(text.substring(0, displayText.length - 1));
      } else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false);
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(handleTyping, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, isPaused, text, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && <span className={cursorClassName}></span>}
    </span>
  );
}