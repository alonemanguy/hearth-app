import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import HelpLevelPicker from '../components/HelpLevelPicker';
import { useAuth, HelpLevel } from '../lib/auth';
import { Icon, IconName } from '../lib/icons';
import { easings } from '../lib/motion';

const LABELS: Record<HelpLevel, string> = {
  basic: 'Just the basics',
  guided: 'Guide me',
  detailed: 'Everything',
};

type Row = {
  icon: IconName;
  label: string;
  to?: string;
  onClick?: () => void;
  value?: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, helpLevel, setHelpLevel } = useAuth();
  const reduce = useReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<HelpLevel>(helpLevel);

  const openSheet = () => {
    setDraft(helpLevel);
    setSheetOpen(true);
  };
  const closeSheet = () => setSheetOpen(false);
  const saveSheet = () => {
    setSheetOpen(false);
    void setHelpLevel(draft);
  };

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  const rows: Row[] = [
    { icon: 'home', label: 'My Home', to: '/property' },
    { icon: 'appliance', label: 'My Appliances', to: '/appliances' },
    { icon: 'warranty', label: 'Warranties', to: '/warranties' },
    { icon: 'household', label: 'Household', to: '/household' },
    { icon: 'bell', label: 'Notifications', to: '/notification-preferences' },
    {
      icon: 'compass',
      label: 'Help level',
      onClick: openSheet,
      value: LABELS[helpLevel],
    },
    { icon: 'settings', label: 'Settings', to: '/settings' },
  ];

  const sheetPortal =
    sheetOpen && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div className="sheet-backdrop" onClick={closeSheet} />
            <div className="sheet">
              <div className="sheet-handle" />
              <h3 className="sheet-title">How much help would you like?</h3>
              <HelpLevelPicker value={draft} onChange={setDraft} />
              <div className="sheet-actions">
                <Button onClick={saveSheet} disabled={draft === helpLevel}>
                  {draft === helpLevel ? 'No changes' : 'Save'}
                </Button>
                <button className="sheet-cancel" onClick={closeSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <Screen>
      <Header title="Profile" />

      <motion.div
        className="profile-header"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easings.easeOutExpo }}
      >
        <div className="avatar">{emailInitial}</div>
        <div className="profile-name">
          {user?.email?.split('@')[0] ?? 'User'}
        </div>
        <div className="profile-email">{user?.email}</div>
      </motion.div>

      <Card>
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            className="menu-row"
            onClick={row.onClick ?? (() => row.to && navigate(row.to))}
            style={{ cursor: 'pointer' }}
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : 0.05 + i * 0.04,
            }}
          >
            <span className="menu-icon">
              <Icon name={row.icon} size={18} />
            </span>
            <span className="menu-label">{row.label}</span>
            {row.value && <span className="menu-value">{row.value}</span>}
            <span className="menu-chevron">
              <Icon name="chevronRight" size={20} />
            </span>
          </motion.div>
        ))}
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card>
          <motion.div
            className="menu-row menu-row--error"
            onClick={signOut}
            style={{ cursor: 'pointer' }}
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : 0.4,
            }}
          >
            <span className="menu-icon">
              <Icon name="signOut" size={18} />
            </span>
            <span className="menu-label">Sign out</span>
          </motion.div>
        </Card>
      </div>

      {sheetPortal}
    </Screen>
  );
}