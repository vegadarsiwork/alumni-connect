'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const DotRippleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Set initial state for all dots
    gsap.set(dotsRef.current, { scale: 1, opacity: 0.5, x: 0, y: 0 }); // Initial opacity set to 0.5

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      dotsRef.current.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const dotX = rect.left + rect.width / 2;
        const dotY = rect.top + rect.height / 2;

        // Calculate distance between mouse and dot
        const distX = clientX - dotX;
        const distY = clientY - dotY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // Only animate dots within a certain radius
        if (distance < 150) { // Increased radius for a wider effect
          // Calculate animation intensity based on distance
          const intensity = 1 - distance / 150; // Adjusted intensity calculation

          gsap.to(dot, {
            scale: 1 + intensity * 3, // Slightly less aggressive scale
            opacity: 0.5 + intensity * 0.5, // Opacity from 0.5 to 1
            x: distX * intensity * 0.3, // Pull towards cursor
            y: distY * intensity * 0.3, // Pull towards cursor
            duration: 0.6, // Faster animation
            ease: "power2.out",
            overwrite: true,
          });
        } else {
          // Reset dots that are outside the influence radius
          gsap.to(dot, {
            scale: 1,
            opacity: 0.5,
            x: 0,
            y: 0,
            duration: 0.8, // Slower reset
            ease: "power2.in",
            overwrite: true,
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Create a 40x40 grid of dots
  const renderDots = () => {
    const dots = [];
    const rows = 40; // Increased density
    const cols = 40; // Increased density

    for (let i = 0; i < rows * cols; i++) {
      dots.push(
        <div
          key={i}
          ref={(el) => el && (dotsRef.current[i] = el)}
          className="w-[2px] h-[2px] bg-white/50 rounded-full" // Smaller dots
          style={{
            margin: '0.5rem', // Reduced margin
          }}
        />
      );
    }

    return dots;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
    >
      <div className="flex flex-wrap justify-center items-center w-full h-full">
        {renderDots()}
      </div>
    </div>
  );
};

export default DotRippleBackground;