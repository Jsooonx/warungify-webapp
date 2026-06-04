import type { ReactNode } from 'react';

interface RollingTextProps {
  children: ReactNode;
  compact?: boolean;
}

export const RollingText = ({ children, compact = false }: RollingTextProps) => (
  <span className={`relative inline-flex min-w-max overflow-hidden align-middle ${compact ? 'h-[1.2em] leading-[1.2]' : 'h-[1.25em] leading-[1.25]'}`}>
    <span className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[115%]">
      {children}
    </span>
    <span className="absolute left-0 top-0 block translate-y-[115%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
      {children}
    </span>
  </span>
);
