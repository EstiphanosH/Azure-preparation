import React, { HTMLAttributes } from 'react';

/**
 * Accessible Card Component
 * A11y Notes:
 * - Uses semantic HTML <article> or <section> elements
 * - Maintains 4.5:1 text-to-background contrast ratio
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'article' | 'section' | 'div';
}

export const Card: React.FC<CardProps> = ({
  as: Component = 'section',
  children,
  className = '',
  ...rest
}) => {
  return (
    <Component
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
