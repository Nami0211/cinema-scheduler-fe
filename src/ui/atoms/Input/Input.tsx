import React from 'react';
import cx from 'classnames';
import styles from './Input.module.css';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input ref={ref} className={cx(styles.input, className)} {...props} />
    );
  }
);

Input.displayName = 'Input';
