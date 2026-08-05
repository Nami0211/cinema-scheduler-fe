import React from 'react';
import cx from 'classnames';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md' }) => {
  return (
    <div className={cx(styles.spinner, styles[size], className)}>
      <div className={styles.circle}></div>
    </div>
  );
};
