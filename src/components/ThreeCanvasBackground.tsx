'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasBackgroundProps {
  isAuditing?: boolean;
}

/**
 * Three.js Canvas Background
 * Mimics traditional Japanese ink-wash (Sumi-e) and dark fantasy watercolor:
 * - Floating ink droplets and smoky wash particle clouds in sepia and taupe
 * - Winding undulating neon electric violet and flame-orange ribbon trails
 * - Organically shifts with cursor movement and intensifies during audits
 */
export function ThreeCanvasBackground({ isAuditing = false }: ThreeCanvasBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 45;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Ink Droplets & Smoky Wash Cloud Particles
    const particleCount = 750;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const inkSepia = new THREE.Color('#73594b');
    const inkTaupe = new THREE.Color('#9e8473');
    const parchmentCream = new THREE.Color('#faebd7');
    const calligraphyBlack = new THREE.Color('#231b18');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const rand = Math.random();
      const c = rand > 0.7 ? parchmentCream : rand > 0.4 ? inkSepia : rand > 0.2 ? inkTaupe : calligraphyBlack;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 2.2 + 0.8;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
    });

    const inkParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(inkParticles);

    // 4. Winding Electric Violet & Flame-Orange Energy Ribbons
    // Create organic undulating 3D spline curves matching reference artwork
    const curvePointsViolet1 = [
      new THREE.Vector3(-35, -25, 0),
      new THREE.Vector3(-20, -10, 8),
      new THREE.Vector3(-28, 5, -5),
      new THREE.Vector3(-14, 18, 5),
      new THREE.Vector3(-22, 32, 0),
    ];
    const curveViolet1 = new THREE.CatmullRomCurve3(curvePointsViolet1);
    const tubeGeo1 = new THREE.TubeGeometry(curveViolet1, 64, 0.55, 8, false);
    const tubeMat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#b193c7'),
      transparent: true,
      opacity: 0.75,
      wireframe: true,
    });
    const ribbon1 = new THREE.Mesh(tubeGeo1, tubeMat1);
    scene.add(ribbon1);

    const curvePointsViolet2 = [
      new THREE.Vector3(25, -28, 0),
      new THREE.Vector3(18, -12, -6),
      new THREE.Vector3(30, 2, 6),
      new THREE.Vector3(20, 16, -4),
      new THREE.Vector3(28, 30, 2),
    ];
    const curveViolet2 = new THREE.CatmullRomCurve3(curvePointsViolet2);
    const tubeGeo2 = new THREE.TubeGeometry(curveViolet2, 64, 0.65, 8, false);
    const tubeMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7d598f'),
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const ribbon2 = new THREE.Mesh(tubeGeo2, tubeMat2);
    scene.add(ribbon2);

    // Flame-orange wisp ribbon
    const curvePointsOrange = [
      new THREE.Vector3(-5, 0, 5),
      new THREE.Vector3(4, 8, 2),
      new THREE.Vector3(-2, 16, 6),
      new THREE.Vector3(6, 22, 3),
    ];
    const curveOrange = new THREE.CatmullRomCurve3(curvePointsOrange);
    const tubeGeo3 = new THREE.TubeGeometry(curveOrange, 48, 0.35, 6, false);
    const tubeMat3 = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#f2612d'),
      transparent: true,
      opacity: 0.85,
      wireframe: true,
    });
    const ribbonOrange = new THREE.Mesh(tubeGeo3, tubeMat3);
    scene.add(ribbonOrange);

    // 5. Cursor Parallax Tracking
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera lerp
      targetX += (mouseX * 4 - targetX) * 0.035;
      targetY += (mouseY * 3 - targetY) * 0.035;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      const speedMultiplier = isAuditing ? 3.0 : 1.0;

      // Ink particle drift
      inkParticles.rotation.y = elapsed * 0.012 * speedMultiplier;
      inkParticles.rotation.x = Math.sin(elapsed * 0.02) * 0.04;

      // Organic undulation of energy ribbons
      ribbon1.rotation.z = Math.sin(elapsed * 0.5 * speedMultiplier) * 0.05;
      ribbon1.position.y = Math.cos(elapsed * 0.4 * speedMultiplier) * 0.8;

      ribbon2.rotation.z = -Math.cos(elapsed * 0.6 * speedMultiplier) * 0.06;
      ribbon2.position.y = Math.sin(elapsed * 0.45 * speedMultiplier) * 0.9;

      ribbonOrange.position.x = Math.sin(elapsed * 0.8 * speedMultiplier) * 1.2;
      ribbonOrange.position.y = Math.cos(elapsed * 0.7 * speedMultiplier) * 1.0;

      // Pulse ribbon opacities during audit
      if (isAuditing) {
        tubeMat1.opacity = 0.75 + Math.sin(elapsed * 6) * 0.2;
        tubeMat2.opacity = 0.8 + Math.cos(elapsed * 6) * 0.18;
        tubeMat3.opacity = 0.85 + Math.sin(elapsed * 8) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      tubeGeo1.dispose();
      tubeMat1.dispose();
      tubeGeo2.dispose();
      tubeMat2.dispose();
      tubeGeo3.dispose();
      tubeMat3.dispose();
      renderer.dispose();
    };
  }, [isAuditing]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
    />
  );
}
