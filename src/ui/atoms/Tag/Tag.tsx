import React from 'react';
import cx from 'classnames';
import styles from './Tag.module.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger';
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cx(styles.tag, styles[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
