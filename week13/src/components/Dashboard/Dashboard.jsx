import React from 'react';
import StatCard from './StatCard';
import RecentItems from './RecentItems';
import Announcements from './Announcements';
import styles from '../../styles/Dashboard.module.css';
import { 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  TrendingUp, 
  Bell, 
  LogOut,
  LayoutDashboard,
  Settings,
  CreditCard,
  Search
} from 'lucide-react';

const Dashboard = ({ data }) => {
  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>I</div>
          <span className={styles.logoText}>Innovature</span>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}><LayoutDashboard size={20} /> Dashboard</a>
          <a href="#" className={styles.navItem}><ShoppingBag size={20} /> E-commerce</a>
          <a href="#" className={styles.navItem}><Users size={20} /> Customers</a>
          <a href="#" className={styles.navItem}><CreditCard size={20} /> Transactions</a>
          <a href="#" className={styles.navItem}><MessageSquare size={20} /> Messages</a>
          <a href="#" className={styles.navItem}><Settings size={20} /> Settings</a>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}><LogOut size={20} /> Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search for data, users..." />
          </div>
          <div className={styles.userProfile}>
            <Bell size={20} className={styles.notifIcon} />
            <div className={styles.avatar}>R</div>
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.intro}>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, Rohit! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <StatCard 
              label="Total Revenue" 
              value="$45,231.89" 
              icon={TrendingUp} 
              trend={12.5} 
              color="var(--accent-primary)" 
            />
            <StatCard 
              label="Active Users" 
              value="2,350" 
              icon={Users} 
              trend={8.2} 
              color="var(--accent-secondary)" 
            />
            <StatCard 
              label="New Orders" 
              value="+124" 
              icon={ShoppingBag} 
              trend={-3.4} 
              color="var(--accent-tertiary)" 
            />
            <StatCard 
              label="Open Tickets" 
              value="12" 
              icon={MessageSquare} 
              trend={5.1} 
              color="#fbbf24" 
            />
          </div>

          {/* Bottom Grid */}
          <div className={styles.bottomGrid}>
            <div className={styles.recentSection}>
              <RecentItems items={data.recentActivity} />
            </div>
            <div className={styles.announcementsSection}>
              <Announcements items={data.announcements} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
