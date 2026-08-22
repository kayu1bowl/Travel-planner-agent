import React from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  CalendarDays, 
  TicketCheck 
} from 'lucide-react';

export default function MobileNavBar({
  activeTab = 'home',
  onSelectTab,
  language = 'zh'
}) {
  const tabs = [
    {
      id: 'chat',
      label: language === 'zh' ? 'AI 向导' : 'Copilot',
      icon: MessageSquare
    },
    {
      id: 'home',
      label: language === 'zh' ? '探索看板' : 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'itineraries',
      label: language === 'zh' ? '全景路线' : 'Timeline',
      icon: CalendarDays
    },
    {
      id: 'bookings',
      label: language === 'zh' ? '预订待办' : 'Bookings',
      icon: TicketCheck
    }
  ];

  return (
    <nav className="mobile-bottom-navbar">
      <div className="mobile-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              aria-label={tab.label}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} />
                {tab.id === 'bookings' && <span className="nav-badge-dot" />}
              </div>
              <span className="mobile-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
