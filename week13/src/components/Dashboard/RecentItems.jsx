import React from 'react';
import styles from '../../styles/RecentItems.module.css';

const RecentItems = ({ items }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
        <button className={styles.viewAll}>View All</button>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.iconWrapper}>
              <item.icon size={18} />
            </div>
            <div className={styles.content}>
              <p className={styles.itemTitle}>{item.title}</p>
              <p className={styles.itemSub}>{item.time}</p>
            </div>
            <div className={styles.amount} style={{ color: item.amount > 0 ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>
              {item.amount > 0 ? '+' : ''}{item.amount ? `$${Math.abs(item.amount)}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentItems;
