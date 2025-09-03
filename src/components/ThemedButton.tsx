'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useThemeStore } from '@/lib/theme-store';
import { useSoundEffects } from '@/lib/useSoundEffects';
import { LoadingSpinner } from './LoadingComponents';

export interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  soundOnClick?: boolean;
  soundOnHover?: boolean;
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    soundOnClick = true,
    soundOnHover = false,
    onClick,
    onMouseEnter,
    disabled,
    ...props
  }, ref) => {
    const { animations, compactMode } = useThemeStore();
    const { playClickSound, playHoverSound } = useSoundEffects();

    // Clases base
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${animations ? 'transform hover:scale-105 active:scale-95' : ''}
    `.trim();

    // Clases de tamaño
    const sizeClasses = {
      sm: compactMode ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      md: compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm',
      lg: compactMode ? 'px-4 py-2 text-base' : 'px-6 py-3 text-base',
    };

    // Clases de variante
    const variantClasses = {
      primary: `
        bg-[var(--color-primary)] text-white
        hover:bg-[var(--color-secondary)]
        focus:ring-[var(--color-primary)]
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-white dark:bg-gray-800 
        text-gray-900 dark:text-white
        border border-gray-300 dark:border-gray-600
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:ring-gray-500
        shadow-sm hover:shadow-md
      `,
      ghost: `
        bg-transparent
        text-gray-700 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:ring-gray-500
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-500
        shadow-sm hover:shadow-md
      `,
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundOnClick && !disabled && !isLoading) {
        playClickSound();
      }
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundOnHover && !disabled && !isLoading) {
        playHoverSound();
      }
      onMouseEnter?.(e);
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <LoadingSpinner 
            size="sm" 
            className="mr-2" 
          />
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2 flex-shrink-0">
            {leftIcon}
          </span>
        )}
        
        <span>{children}</span>
        
        {!isLoading && rightIcon && (
          <span className="ml-2 flex-shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

ThemedButton.displayName = 'ThemedButton';
