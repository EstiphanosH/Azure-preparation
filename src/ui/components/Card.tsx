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
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-lg transition-colors ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
