import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import { CreditCard, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

const demoData = {
  recentActivity: [
    { title: 'Payment received from Alex', time: '2 hours ago', amount: 450.00, icon: CreditCard },
    { title: 'Server subscription renewed', time: '5 hours ago', amount: -29.99, icon: Zap },
    { title: 'Withdrawal to Bank Account', time: 'Yesterday', amount: -1200.00, icon: ArrowUpRight },
    { title: 'Refund processed for #9823', time: '2 days ago', amount: 89.00, icon: ArrowDownRight },
  ],
  announcements: [
    { 
      type: 'update', 
      title: 'v2.4.0 System Update', 
      description: 'We have improved the dashboard performance by 40% and updated the security protocols.',
      date: 'Oct 24, 2023' 
    },
    { 
      type: 'alert', 
      title: 'Scheduled Maintenance', 
      description: 'System will be unavailable on Saturday from 2 AM to 4 AM UTC for database migration.',
      date: 'Oct 26, 2023' 
    },
    { 
      type: 'news', 
      title: 'Annual Report Ready', 
      description: 'The 2023 annual fiscal report is now available for download in the documents section.',
      date: 'Oct 28, 2023' 
    }
  ]
};

function App() {
  return (
    <div className="App">
      <Dashboard data={demoData} />
    </div>
  );
}

export default App;
