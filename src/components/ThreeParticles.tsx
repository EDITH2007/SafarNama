"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Configuration
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randomScales = new Float32Array(particleCount);

    // Spread particles in a box region
    for (let i = 0; i < particleCount; i++) {
      // X: [-10, 10]
      positions[i * 3] = (Math.random() - 0.5) * 20;
      // Y: [-8, 8]
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      // Z: [-5, 5]
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      randomScales[i] = Math.random();
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Warm saffron/clay colors for the firefly particle effect
    const color = new THREE.Color("#D69E2E"); // saffron

    // Create a circular particle texture using canvas
    const createCircleTexture = () => {
      const size = 16;
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = size;
      textureCanvas.height = size;
      const ctx = textureCanvas.getContext("2d");

      if (ctx) {
        // Soft radial gradient for a glowing effect
        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, "rgba(214, 158, 46, 0.8)"); // saffron glow
        gradient.addColorStop(0.5, "rgba(192, 86, 33, 0.2)");  // terracotta border
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
      }

      return new THREE.CanvasTexture(textureCanvas);
    };

    const texture = createCircleTexture();

    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interactive movement
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates to [-0.5, 0.5]
      targetMouseX = (event.clientX / window.innerWidth) - 0.5;
      targetMouseY = (event.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse interpolation (lerp)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Slowly rotate particle field
      particles.rotation.y = elapsedTime * 0.02 + mouseX * 0.5;
      particles.rotation.x = elapsedTime * 0.01 - mouseY * 0.3;

      // Animate particle position slightly (waves)
      const positionsArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Drift particles slowly upwards (like campfire sparks)
        positionsArray[i * 3 + 1] += 0.005; // Move Y up
        
        // Wrap around when escaping high bounds
        if (positionsArray[i * 3 + 1] > 8) {
          positionsArray[i * 3 + 1] = -8;
          positionsArray[i * 3] = (Math.random() - 0.5) * 20;
        }

        // Add a gentle horizontal sine wave drift
        const scale = randomScales[i];
        positionsArray[i * 3] += Math.sin(elapsedTime + scale * 100) * 0.002;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose resources
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-stone-950 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 pointer-events-none"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
