import { useEffect, useRef } from "react";

function Confetti({ trigger }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Color choices
    const colors = [
      "#10B981", // emerald-500
      "#34D399", // emerald-400
      "#60A5FA", // blue-400
      "#FBBF24", // amber-400
      "#F472B6", // pink-400
      "#A78BFA", // purple-400
      "#22D3EE", // cyan-400
    ];

    // Create particles
    const particleCount = 120;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height * 0.6 + (Math.random() - 0.5) * 50, // Explode from center-ish bottom
        radius: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 15 - 5, // Upward velocity
        gravity: 0.35,
        drag: 0.98,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }
    particlesRef.current = particles;

    // Animation loop
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      const currentParticles = particlesRef.current;

      for (let i = 0; i < currentParticles.length; i++) {
        const p = currentParticles[i];
        if (p.opacity <= 0 || p.y > canvas.height + 20) continue;

        alive = true;

        // Apply physics
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out as they get lower
        if (p.y > canvas.height * 0.75) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          // Draw a rectangle or a small circle/polygon
          if (i % 2 === 0) {
            ctx.fillRect(-p.radius, -p.radius * 1.5, p.radius * 2, p.radius * 3);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (alive) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    tick();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}

export default Confetti;
