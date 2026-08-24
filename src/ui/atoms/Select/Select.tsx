import React from 'react';
import cx from 'classnames';
import styles from './Select.module.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className={styles.selectWrapper}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cx(
            styles.select,
            { [styles.hasError]: !!error },
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
