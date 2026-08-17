import React from 'react';
import cx from 'classnames';
import styles from './Button.module.css';
import { Spinner } from '../Spinner/Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cx(
          styles.button,
          styles[variant],
          {
            [styles.loading]: isLoading,
          },
          className
        )}
        {...props}
      >
        {isLoading && <Spinner className={styles.spinner} />}
        <span className={cx({ [styles.hidden]: isLoading })}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
