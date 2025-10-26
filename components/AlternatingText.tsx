"use client";

import React, { useState, useEffect } from 'react';

interface AlternatingTextProps {
  words: string[];
  intervalMs?: number;
  className?: string;
  hoverClassName?: string;
  initialColor?: string;
  hoverColor?: string;
}

const AlternatingText: React.FC<AlternatingTextProps> = ({
  words,
  intervalMs = 3000,
  className = '',
  hoverClassName = '',
  initialColor = 'text-purple-400',
  hoverColor = 'text-white',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [words, intervalMs]);

  const currentWord = words[currentIndex];

  return (
    <span
      key={currentWord} // Add key to trigger re-render and animation
      className={`inline-flex justify-center items-center transition-all duration-200 ease-in-out ${className} ${initialColor} ${hoverClassName} hover:${hoverColor} hover:scale-105 w-[220px] text-center`}
      style={{ animation: `word-enter 0.5s forwards, word-exit 0.5s 1.2s forwards` }}
    >
      {currentWord}
    </span>
  );
};

export default AlternatingText;

