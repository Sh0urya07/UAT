'use client';

import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  subtitle?: string;
  showGrade?: boolean;
}

export function ScoreRing({
  score,
  label,
  size = 140,
  strokeWidth = 10,
  subtitle,
  showGrade = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const circleProgressRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Determine color scheme based on score using Gengar palette
  let strokeGradient = 'url(#gengar-lavender-grad)';
  let glowColor = 'rgba(125, 89, 143, 0.25)';
  let textColor = 'text-gengar-bright-violet';
  let grade = 'A+';

  if (score < 50) {
    strokeGradient = 'url(#gengar-red-grad)';
    glowColor = 'rgba(234, 58, 34, 0.3)';
    textColor = 'text-eye-flame-red';
    grade = 'F';
  } else if (score < 70) {
    strokeGradient = 'url(#gengar-orange-grad)';
    glowColor = 'rgba(242, 97, 45, 0.25)';
    textColor = 'text-eye-glow-orange';
    grade = 'C';
  } else if (score < 90) {
    strokeGradient = 'url(#gengar-ochre-grad)';
    glowColor = 'rgba(184, 134, 86, 0.25)';
    textColor = 'text-sun-warm-ochre';
    grade = 'B+';
  }

  // Anime.js timeline for counter and SVG stroke offset
  useEffect(() => {
    const targetOffset = circumference - (circumference * Math.min(100, Math.max(0, score))) / 100;
    const counterObj = { value: 0 };

    const anim = anime({
      targets: counterObj,
      value: score,
      round: 1,
      duration: 1400,
      easing: 'easeOutElastic(1, .7)',
      update: () => {
        setDisplayScore(counterObj.value);
      },
    });

    if (circleProgressRef.current) {
      anime({
        targets: circleProgressRef.current,
        strokeDashoffset: [circumference, targetOffset],
        duration: 1300,
        easing: 'easeOutCubic',
      });
    }

    return () => {
      anim.pause();
    };
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        >
          <defs>
            {/* Gengar lavender gradient */}
            <linearGradient id="gengar-lavender-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7d598f" />
              <stop offset="100%" stopColor="#b193c7" />
            </linearGradient>

            {/* Sun ochre gradient */}
            <linearGradient id="gengar-ochre-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b88656" />
              <stop offset="100%" stopColor="#d7b48c" />
            </linearGradient>

            {/* Eye glow orange gradient */}
            <linearGradient id="gengar-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b3391b" />
              <stop offset="100%" stopColor="#f2612d" />
            </linearGradient>

            {/* Eye flame red gradient */}
            <linearGradient id="gengar-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea3a22" />
              <stop offset="100%" stopColor="#f2612d" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated progress circle */}
          <circle
            ref={circleProgressRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeGradient}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score & grade */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span
              ref={numberRef}
              className="text-3xl font-black tracking-tight font-mono text-stone-900"
            >
              {displayScore}
            </span>
            <span className="text-xs font-semibold text-stone-400 font-mono">/100</span>
          </div>
          {showGrade && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-200 mt-0.5 bg-stone-100 uppercase tracking-wider ${textColor}`}
            >
              Grade {grade}
            </span>
          )}
        </div>
      </div>

      <span className="mt-2 text-xs font-bold uppercase tracking-wider text-stone-800 text-center">
        {label}
      </span>
      {subtitle && (
        <span className="text-[11px] text-stone-500 text-center mt-0.5 max-w-[130px] truncate">
          {subtitle}
        </span>
      )}
    </div>
  );
}
