import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'tertiary' | 'ghost';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'pixel-button',
  tertiary: 'pixel-button pixel-button--tertiary',
  ghost: 'pixel-button pixel-button--ghost',
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ variant = 'primary', leftIcon, rightIcon, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={[VARIANT_CLASS[variant], className].filter(Boolean).join(' ')}
        {...rest}
      >
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </button>
    );
  },
);

PixelButton.displayName = 'PixelButton';
