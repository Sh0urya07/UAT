'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasBackgroundProps {
  isAuditing?: boolean;
}

/**
 * Three.js Interactive Background Shader & Orbital Energy System
 * Replicates the fluid, organic, and cinematic motion style from the reference video:
 * - Dynamic 3D GLSL vertex-shader undulating liquid plasma / ink-fabric wave field
 * - Dual gyroscopic orbital energy rings (electric violet & flame-orange fire) inspired by 00:06 of reference video
 * - Floating Sumi-e ink droplets and drifting ember particles with Brownian motion
 * - Real-time cursor parallax & ripple inertia
 * - Audit acceleration mode: ramps up wave turbulence and gyroscopic rotation speed
 */
export function ThreeCanvasBackground({ isAuditing = false }: ThreeCanvasBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const auditStateRef = useRef(isAuditing);

  useEffect(() => {
    auditStateRef.current = isAuditing;
  }, [isAuditing]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera & Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf4ece1, 0.012);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -4, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- 2. Custom GLSL Vertex & Fragment Shader Wave Field ---
    // Warm parchment ink-wash waves with subtle violet/flame ripples
    const waveUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAuditIntensity: { value: 0.0 },
      uColorBase: { value: new THREE.Color('#f4ece1') },
      uColorInk: { value: new THREE.Color('#e8ddcf') },
      uColorViolet: { value: new THREE.Color('#9370a8') },
      uColorLavender: { value: new THREE.Color('#cbb7db') },
      uColorOrange: { value: new THREE.Color('#e87b48') },
      uColorFlame: { value: new THREE.Color('#cf4b2d') },
    };

    const waveVertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uAuditIntensity;
      varying vec2 vUv;
      varying float vElevation;
      varying vec3 vNormal;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;
        float speed = 0.28 + uAuditIntensity * 0.65;
        float t = uTime * speed;

        float wave1 = snoise(vec3(pos.x * 0.035, pos.y * 0.035, t * 0.35)) * 4.0;
        float wave2 = snoise(vec3(pos.x * 0.07 + t * 0.2, pos.y * 0.07, t * 0.5)) * 1.8;

        float distToMouse = length(pos.xy - uMouse * vec2(28.0, 18.0));
        float mouseRipple = exp(-distToMouse * 0.07) * sin(distToMouse * 0.3 - uTime * 3.0) * (2.0 + uAuditIntensity * 3.0);

        float totalElevation = (wave1 + wave2) * (1.0 + uAuditIntensity * 0.7) + mouseRipple;
        pos.z += totalElevation;

        vElevation = totalElevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const waveFragmentShader = `
      uniform float uTime;
      uniform float uAuditIntensity;
      uniform vec3 uColorBase;
      uniform vec3 uColorInk;
      uniform vec3 uColorViolet;
      uniform vec3 uColorLavender;
      uniform vec3 uColorOrange;
      uniform vec3 uColorFlame;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        float normElev = clamp((vElevation + 5.0) / 10.0, 0.0, 1.0);

        // Soft watercolor ink-wash gradient over light parchment
        vec3 color = mix(uColorBase, uColorInk, smoothstep(0.0, 0.45, normElev));
        color = mix(color, uColorViolet, smoothstep(0.45, 0.78, normElev));
        color = mix(color, uColorLavender, smoothstep(0.78, 0.95, normElev));

        // Subtle flame watercolor crests
        float flameMix = smoothstep(0.85, 1.0, normElev) * (0.35 + uAuditIntensity * 0.5);
        color = mix(color, uColorOrange, flameMix);

        // Soft parchment vignette
        float edgeDist = length(vUv - vec2(0.5)) * 2.0;
        float alpha = clamp(1.0 - smoothstep(0.4, 1.15, edgeDist), 0.0, 0.55);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const waveGeo = new THREE.PlaneGeometry(130, 90, 80, 50);
    const waveMat = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      uniforms: waveUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });

    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0, 0, -24);
    waveMesh.rotation.x = -0.32;
    scene.add(waveMesh);

    // --- 3. Dual Gyroscopic Orbital Energy Rings (Set in Deep Background) ---
    const violetCurvePoints = [];
    const ringRadius = 24;
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const x = Math.cos(theta) * ringRadius;
      const y = Math.sin(theta) * (ringRadius * 0.42);
      const z = Math.sin(theta * 2.0) * 5.0;
      violetCurvePoints.push(new THREE.Vector3(x, y, z));
    }
    const violetCurve = new THREE.CatmullRomCurve3(violetCurvePoints, true);
    const violetRingGeo = new THREE.TubeGeometry(violetCurve, 96, 0.16, 8, true);
    const violetRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7d598f'),
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
    });
    const violetOrbitalRing = new THREE.Mesh(violetRingGeo, violetRingMat);
    violetOrbitalRing.rotation.set(0.65, 0.4, 0.15);
    violetOrbitalRing.position.set(0, 2, -16);
    scene.add(violetOrbitalRing);

    // Ring 2: Flame-Orange Fire Ribbon (Deep Background)
    const orangeCurvePoints = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const x = Math.cos(theta) * (ringRadius * 1.12);
      const y = Math.sin(theta) * (ringRadius * 0.46);
      const z = Math.cos(theta * 2.0) * -5.5;
      orangeCurvePoints.push(new THREE.Vector3(x, y, z));
    }
    const orangeCurve = new THREE.CatmullRomCurve3(orangeCurvePoints, true);
    const orangeRingGeo = new THREE.TubeGeometry(orangeCurve, 96, 0.14, 8, true);
    const orangeRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#bf4c24'),
      transparent: true,
      opacity: 0.3,
      blending: THREE.NormalBlending,
    });
    const orangeOrbitalRing = new THREE.Mesh(orangeRingGeo, orangeRingMat);
    orangeOrbitalRing.rotation.set(-0.55, -0.5, 0.35);
    orangeOrbitalRing.position.set(0, 2, -16);
    scene.add(orangeOrbitalRing);

    // --- 4. Soft Circular Glow Texture for Particles (Zero square boxes) ---
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    };

    const circleTexture = createCircleTexture();

    // Floating Sumi-e Ink Droplets & Ember Particles (Deep Background)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialVelocities: { x: number; y: number; z: number }[] = [];

    const colParchment = new THREE.Color('#946237');
    const colViolet = new THREE.Color('#7d598f');
    const colOrange = new THREE.Color('#bf4c24');
    const colDark = new THREE.Color('#231b18');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      // Keep strictly in deep background behind UI
      positions[i * 3 + 2] = -12 - Math.random() * 25;

      const rand = Math.random();
      const col = rand > 0.65 ? colViolet : rand > 0.4 ? colOrange : rand > 0.2 ? colParchment : colDark;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      initialVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: Math.random() * 0.018 + 0.004,
        z: (Math.random() - 0.5) * 0.01,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.85,
      map: circleTexture || undefined,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const emberParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(emberParticles);

    // --- 5. Mouse Interaction & Inertia ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- 6. Resize Handling ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let currentAuditIntensity = 0.0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth lerp mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Parallax camera sway
      camera.position.x = mouse.x * 2.5;
      camera.position.y = -4 + mouse.y * 1.8;
      camera.lookAt(0, 0, -10);

      // Smooth lerp audit intensity
      const targetIntensity = auditStateRef.current ? 1.0 : 0.0;
      currentAuditIntensity += (targetIntensity - currentAuditIntensity) * 0.05;

      // Update shader uniforms
      waveUniforms.uTime.value = time;
      waveUniforms.uMouse.value.set(mouse.x, mouse.y);
      waveUniforms.uAuditIntensity.value = currentAuditIntensity;

      // Rotate gyroscopic orbital energy rings
      const rotSpeed = 0.3 + currentAuditIntensity * 1.2;
      violetOrbitalRing.rotation.z += delta * rotSpeed * 0.55;
      violetOrbitalRing.rotation.y += delta * rotSpeed * 0.4;
      orangeOrbitalRing.rotation.z -= delta * rotSpeed * 0.6;
      orangeOrbitalRing.rotation.x += delta * rotSpeed * 0.45;

      violetRingMat.opacity = 0.45 + currentAuditIntensity * 0.35;
      orangeRingMat.opacity = 0.35 + currentAuditIntensity * 0.35;

      // Drift floating embers
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const pSpeed = 1.0 + currentAuditIntensity * 2.0;

      for (let i = 0; i < particleCount; i++) {
        pArr[i * 3 + 1] += initialVelocities[i].y * pSpeed;
        pArr[i * 3] += (initialVelocities[i].x + Math.sin(time + i) * 0.008) * pSpeed;

        if (pArr[i * 3 + 1] > 26) {
          pArr[i * 3 + 1] = -26;
          pArr[i * 3] = (Math.random() - 0.5) * 80;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- 8. Cleanup ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      scene.remove(waveMesh);
      scene.remove(violetOrbitalRing);
      scene.remove(orangeOrbitalRing);
      scene.remove(emberParticles);

      waveGeo.dispose();
      waveMat.dispose();
      violetRingGeo.dispose();
      violetRingMat.dispose();
      orangeRingGeo.dispose();
      orangeRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (circleTexture) circleTexture.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden"
      aria-hidden="true"
    />
  );
}

