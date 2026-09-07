import { useEffect, useRef } from 'react';

export function useExplosionParticles() {
  const createExplosion = (x: number, y: number, color: string = '#10b981') => {
    const container = document.createElement('div');
    container.className = 'explosion-container';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    document.body.appendChild(container);

    // Create 12 particles in a circle
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      particle.style.background = color;
      
      const angle = (i / 12) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      container.appendChild(particle);
    }

    // Create sparkle burst
    for (let i = 0; i < 8; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-burst';
      sparkle.style.left = `${Math.random() * 40 - 20}px`;
      sparkle.style.top = `${Math.random() * 40 - 20}px`;
      sparkle.style.animationDelay = `${Math.random() * 0.2}s`;
      container.appendChild(sparkle);
    }

    // Remove after animation
    setTimeout(() => {
      container.remove();
    }, 1000);
  };

  return { createExplosion };
}

export function useConfetti() {
  const createConfetti = (x: number, y: number) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${x + (Math.random() - 0.5) * 200}px`;
      confetti.style.top = `${y}px`;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  };

  return { createConfetti };
}

export function useSuccessCheck() {
  const showSuccess = (x: number, y: number) => {
    const check = document.createElement('div');
    check.className = 'success-check';
    check.textContent = '✓';
    check.style.left = `${x}px`;
    check.style.top = `${y}px`;
    check.style.color = '#10b981';
    document.body.appendChild(check);

    setTimeout(() => check.remove(), 1000);
  };

  return { showSuccess };
}

export function useClickRipple() {
  const createRipple = (e: React.MouseEvent) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX - 100}px`;
    ripple.style.top = `${e.clientY - 100}px`;
    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  return { createRipple };
}

export function useHoverTrail() {
  const lastTrailTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTrailTime.current < 50) return; // Throttle
      lastTrailTime.current = now;

      const trail = document.createElement('div');
      trail.className = 'hover-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);

      setTimeout(() => trail.remove(), 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
}
