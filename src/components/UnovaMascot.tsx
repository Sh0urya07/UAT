'use client';

import React, { useRef, useEffect } from 'react';
import anime from 'animejs';

interface UnovaMascotProps {
  size?: number;
  className?: string;
  isAuditing?: boolean;
  withContainerBadge?: boolean;
}

/**
 * Official Unova Robot Mascot Logo
 * Precision-modeled after the official Unova brand visual:
 * - Rounded squircle head chassis in luminous parchment cream (#fbf9f4) with distinct dark borders (#0d1017) and outer light rim highlight
 * - Cream antenna stalk topped with a glowing mint/aquamarine orb (#4fe0af)
 * - Rounded capsule dark visor frame housing a vibrant mint visor screen (#4be3b5) with dynamic scanning sweep
 * - Soft coral blush cheek dots (#fa7a5e)
 * - Smooth physics-based hover & scanning animations powered by anime.js
 * - Optional high-contrast background container badge with subtle inner glow
 */
export function UnovaMascot({
  size = 48,
  className = '',
  isAuditing = false,
  withContainerBadge = false,
}: UnovaMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headGroupRef = useRef<SVGGElement>(null);
  const antennaOrbRef = useRef<SVGCircleElement>(null);
  const visorBeamRef = useRef<SVGRectElement>(null);
  const leftCheekRef = useRef<SVGCircleElement>(null);
  const rightCheekRef = useRef<SVGCircleElement>(null);

  // Hover animation powered by Anime.js
  const handleMouseEnter = () => {
    // 1. Head elastic spring nod
    anime({
      targets: headGroupRef.current,
      translateY: [-3, 1.5, 0],
      rotate: [-2, 2, 0],
      duration: 700,
      easing: 'easeOutElastic(1, .5)',
    });

    // 2. Antenna orb pulse
    anime({
      targets: antennaOrbRef.current,
      scale: [1, 1.35, 1.1],
      duration: 500,
      easing: 'easeOutBack',
    });

    // 3. Visor beam light sweep
    anime({
      targets: visorBeamRef.current,
      translateX: [-80, 80],
      duration: 650,
      easing: 'easeInOutQuad',
    });

    // 4. Cheeks warm glow
    anime({
      targets: [leftCheekRef.current, rightCheekRef.current],
      scale: [1, 1.25, 1.05],
      duration: 400,
      easing: 'easeOutQuad',
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: [headGroupRef.current, antennaOrbRef.current, leftCheekRef.current, rightCheekRef.current],
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      duration: 450,
      easing: 'easeOutQuad',
    });
  };

  // Continuous idle & auditing loop
  useEffect(() => {
    // Antenna node pulse
    const antennaPulse = anime({
      targets: antennaOrbRef.current,
      scale: isAuditing ? [1, 1.4, 1] : [1, 1.15, 1],
      duration: isAuditing ? 700 : 2200,
      loop: true,
      easing: 'easeInOutSine',
    });

    // Visor beam sweep
    const visorSweep = anime({
      targets: visorBeamRef.current,
      translateX: isAuditing ? [-65, 65] : [-45, 45],
      duration: isAuditing ? 800 : 2600,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });

    return () => {
      antennaPulse.pause();
      visorSweep.pause();
    };
  }, [isAuditing]);

  const mascotSvg = (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title="Unova Official Robot Mascot"
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mint Visor Glow */}
          <filter id="mint-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Cheek Warm Glow */}
          <filter id="cheek-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Visor Scanner Beam Gradient */}
          <linearGradient id="visor-scan-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="35%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.9)" />
            <stop offset="65%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Luminous Parchment Chassis Gradient */}
          <linearGradient id="unova-chassis-cream" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f7f3eb" />
            <stop offset="100%" stopColor="#ede5d6" />
          </linearGradient>

          {/* Stalk Gradient */}
          <linearGradient id="stalk-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e4ddd0" />
          </linearGradient>

          {/* Clip path for the mint visor screen */}
          <clipPath id="unova-visor-screen-clip">
            <rect x="61" y="98" width="78" height="26" rx="13" />
          </clipPath>
        </defs>

        <g ref={headGroupRef} className="origin-[100px_110px]">
          {/* Outer high-contrast definition shadow / rim for dark backgrounds */}
          <rect
            x="36"
            y="50"
            width="128"
            height="120"
            rx="60"
            fill="none"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="3"
          />

          {/* 1. Antenna Stalk Outer Rim */}
          <rect
            x="92.5"
            y="30.5"
            width="15"
            height="25"
            rx="4.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="2"
          />

          {/* 1b. Antenna Stalk */}
          <rect
            x="94"
            y="32"
            width="12"
            height="22"
            rx="3"
            fill="url(#stalk-grad)"
            stroke="#0d1017"
            strokeWidth="7.5"
            strokeLinejoin="round"
          />

          {/* 2a. Antenna Outer Mint Aura Rim */}
          <circle
            cx="100"
            cy="24"
            r="16.5"
            fill="none"
            stroke="rgba(79, 224, 175, 0.45)"
            strokeWidth="2.5"
          />

          {/* 2b. Antenna Node/Orb (Mint Green) */}
          <circle
            ref={antennaOrbRef}
            cx="100"
            cy="24"
            r="14"
            fill="#4fe0af"
            stroke="#0d1017"
            strokeWidth="7.5"
            filter="url(#mint-glow)"
            className="origin-[100px_24px]"
          />
          {/* Specular highlight in antenna node */}
          <circle cx="96" cy="20" r="4.5" fill="rgba(255, 255, 255, 0.8)" />

          {/* 3. Outer Head Chassis (Smooth Squircle with crisp dark border & parchment gradient) */}
          <rect
            x="40"
            y="54"
            width="120"
            height="112"
            rx="56"
            fill="url(#unova-chassis-cream)"
            stroke="#0d1017"
            strokeWidth="10"
            strokeLinejoin="round"
          />

          {/* 4. Visor Outer Frame (Bold Dark Pill Capsule with subtle border) */}
          <rect
            x="49"
            y="84"
            width="102"
            height="54"
            rx="27"
            fill="#09080d"
            stroke="#261f2e"
            strokeWidth="2"
          />

          {/* 5. Mint Screen Inside Visor */}
          <g clipPath="url(#unova-visor-screen-clip)">
            <rect
              x="61"
              y="98"
              width="78"
              height="26"
              rx="13"
              fill="#3ce4ad"
              filter="url(#mint-glow)"
            />

            {/* Subtle inner top glow arc */}
            <path
              d="M 66 102 Q 100 99 134 102"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Dynamic Scanning Light Sweep */}
            <rect
              ref={visorBeamRef}
              x="50"
              y="95"
              width="38"
              height="34"
              fill="url(#visor-scan-beam)"
              opacity="0.95"
            />
          </g>

          {/* 6. Soft Coral Blush Cheek Dots */}
          {/* Left Cheek */}
          <circle
            ref={leftCheekRef}
            cx="62"
            cy="150"
            r="12.5"
            fill="#fa7a5e"
            filter="url(#cheek-glow)"
            className="origin-[62px_150px]"
          />

          {/* Right Cheek */}
          <circle
            ref={rightCheekRef}
            cx="138"
            cy="150"
            r="12.5"
            fill="#fa7a5e"
            filter="url(#cheek-glow)"
            className="origin-[138px_150px]"
          />
        </g>
      </svg>
    </div>
  );

  if (withContainerBadge) {
    return (
      <div className="relative inline-flex items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-[#231b26]/90 via-[#18131d]/95 to-[#110e15] border border-gengar-bright-violet/35 shadow-[0_4px_16px_rgba(0,0,0,0.65)] backdrop-blur-md group-hover:border-aura-light-lavender/60 group-hover:shadow-[0_4px_24px_rgba(125,89,143,0.35)] transition-all">
        {/* Ambient mint/violet inner backglow */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(79,224,175,0.14),transparent_70%)] pointer-events-none" />
        {mascotSvg}
      </div>
    );
  }

  return mascotSvg;
}
