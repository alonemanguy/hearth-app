import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import HelpLevelPicker from '../components/HelpLevelPicker';
import { useAuth, HelpLevel } from '../lib/auth';

const LABELS: Record<HelpLevel, string> = {
  basic: 'Just the basics',
  guided: 'Guide me',
  detailed: 'Everything',
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, helpLevel, setHelpLevel } = useAuth();
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

      <div className="profile-header">
        <div className="avatar">{emailInitial}</div>
        <div className="profile-name">
          {user?.email?.split('@')[0] ?? 'User'}
        </div>
        <div className="profile-email">{user?.email}</div>
      </div>

      <Card>
        <div
          className="menu-row"
          onClick={() => navigate('/property')}
          style={{ cursor: 'pointer' }}
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-label">My Home</span>
          <span className="menu-chevron">›</span>
        </div>
        <div
          className="menu-row"
          onClick={() => navigate('/appliances')}
          style={{ cursor: 'pointer' }}
        >
          <span className="menu-icon">🔌</span>
          <span className="menu-label">My Appliances</span>
          <span className="menu-chevron">›</span>
        </div>
        <div
          className="menu-row"
          onClick={() => navigate('/notification-preferences')}
          style={{ cursor: 'pointer' }}
        >
          <span className="menu-icon">🔔</span>
          <span className="menu-label">Notifications</span>
          <span className="menu-chevron">›</span>
        </div>
        <div
          className="menu-row"
          onClick={openSheet}
          style={{ cursor: 'pointer' }}
        >
          <span className="menu-icon">🎚️</span>
          <span className="menu-label">Help level</span>
          <span className="menu-value">{LABELS[helpLevel]}</span>
          <span className="menu-chevron">›</span>
        </div>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card>
          <div
            className="menu-row menu-row--error"
            onClick={signOut}
            style={{ cursor: 'pointer' }}
          >
            <span className="menu-icon">🚪</span>
            <span className="menu-label">Sign out</span>
          </div>
        </Card>
      </div>

      {sheetPortal}
    </Screen>
  );
}