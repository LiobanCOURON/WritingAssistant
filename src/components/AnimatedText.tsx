import React from 'react';

interface AnimatedTextProps {
  text: string;
  animation?: 'wave' | 'bounce' | 'rotate' | 'jiggle' | 'float' | 'pulse';
  delay?: number;
  className?: string;
}

export function AnimatedText({ text, animation = 'wave', delay = 0, className = '' }: AnimatedTextProps) {
  const animationClass = {
    wave: 'anim-char-wave',
    bounce: 'anim-char-bounce',
    rotate: 'anim-char-rotate',
    jiggle: 'anim-char-jiggle',
    float: 'anim-char-float',
    pulse: 'anim-char-pulse',
  }[animation];

  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={animationClass}
          style={{
            display: 'inline-block',
            animationDelay: `${delay + index * 0.05}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
