import React from 'react';
import styles from '../../styles/Announcements.module.css';
import { Megaphone } from 'lucide-react';

const Announcements = ({ items }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Megaphone size={20} className={styles.icon} />
          <h2 className={styles.title}>Announcements</h2>
        </div>
      </div>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div key={index} className={styles.announcement}>
            <div className={styles.badge} style={{ backgroundColor: item.type === 'alert' ? 'var(--accent-tertiary)' : 'var(--accent-primary)' }}>
              {item.type}
            </div>
            <h4 className={styles.announcementTitle}>{item.title}</h4>
            <p className={styles.desc}>{item.description}</p>
            <span className={styles.date}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
