import { type ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <Reveal className={`max-w-3xl ${alignClass} ${className}`}>
      {label && (
        <span className={`section-label ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-gold-500" />
          {label}
        </span>
      )}
      <h2
        className={`mt-4 font-display text-4xl md:text-5xl font-extrabold leading-[1.1] ${
          dark ? 'text-white' : 'text-ink-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-lg leading-relaxed ${
            dark ? 'text-ink-300' : 'text-ink-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
