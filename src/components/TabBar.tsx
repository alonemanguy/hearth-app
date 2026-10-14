import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Icon, IconName } from '../lib/icons';
import { springs } from '../lib/motion';

type Tab = { to: string; label: string; icon: IconName };

const tabs: Tab[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/add', label: 'Add', icon: 'add' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

export function TabBar() {
  const location = useLocation();

  return (
    <nav className="tab-bar" aria-label="Primary">
      {tabs.map((tab) => {
        const isActive =
          location.pathname === tab.to ||
          (tab.to !== '/' && location.pathname.startsWith(tab.to));

        return (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}>
            <div className={`tab-slot ${isActive ? 'tab-slot--active' : ''}`}>
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="tab-pill"
                  transition={springs.gentle}
                />
              )}
              <motion.div
                animate={{ y: isActive ? -1 : 0 }}
                transition={springs.snappy}
              >
                <Icon name={tab.icon} size={22} strokeWidth={isActive ? 2.4 : 2} />
              </motion.div>
              <span className="tab-label">{tab.label}</span>
            </div>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default TabBar;