import React from 'react';
import styles from '../../styles/StatCard.module.css';

const StatCard = ({ label, value, icon: Icon, trend, color = 'var(--accent-primary)' }) => {
  const isPositive = trend > 0;
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div 
          className={styles.iconWrapper} 
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          <Icon size={20} />
        </div>
        <span className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? '+' : ''}{trend}%
        </span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
