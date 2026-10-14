import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAuth } from '../lib/auth';
import { Icon, IconName } from '../lib/icons';
import { exportUserData, downloadJson } from '../lib/export';

const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'myabirnjr@gmail.com';

type Row = {
  icon: IconName;
  label: string;
  to?: string;
  onClick?: () => void;
  value?: string;
  danger?: boolean;
  disabled?: boolean;
};

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const { error, data } = await exportUserData();
    setExporting(false);

    if (error || !data) {
      showToast(error ?? 'Export failed');
      return;
    }

    const filename = `hearth-export-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadJson(data, filename);
    showToast('Data exported');
  };

  const accountRows: Row[] = [
    {
      icon: 'mail',
      label: 'Email',
      value: user?.email ?? '—',
    },
  ];

  const privacyRows: Row[] = [
    {
      icon: 'download',
      label: exporting ? 'Exporting...' : 'Export my data',
      onClick: handleExport,
      disabled: exporting,
    },
    {
      icon: 'documents',
      label: 'Privacy Policy',
      to: '/privacy',
    },
    {
      icon: 'documents',
      label: 'Terms of Service',
      to: '/terms',
    },
  ];

  const aboutRows: Row[] = [
    {
      icon: 'info',
      label: 'Version',
      value: APP_VERSION,
    },
    {
      icon: 'mail',
      label: 'Send feedback',
      onClick: () => {
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Hearth%20feedback`;
      },
    },
  ];

  const renderRow = (row: Row) => {
    const clickable = !row.disabled && (row.onClick || row.to);
    return (
      <div
        key={row.label}
        className={`menu-row ${row.danger ? 'menu-row--error' : ''}`}
        onClick={
          clickable
            ? row.onClick ?? (() => navigate(row.to!))
            : undefined
        }
        style={{
          cursor: clickable ? 'pointer' : 'default',
          opacity: row.disabled ? 0.5 : 1,
        }}
      >
        <span className="menu-icon">
          <Icon name={row.icon} size={18} />
        </span>
        <span className="menu-label">{row.label}</span>
        {row.value && <span className="menu-value">{row.value}</span>}
        {clickable && (
          <span className="menu-chevron">
            <Icon name="chevronRight" size={20} />
          </span>
        )}
      </div>
    );
  };

  return (
    <Screen>
      <Header title="Settings" onBack={() => navigate('/profile')} />

      <div className="settings-section">
        <div className="settings-section-title">Account</div>
        <Card>{accountRows.map(renderRow)}</Card>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Privacy &amp; Data</div>
        <Card>{privacyRows.map(renderRow)}</Card>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">About</div>
        <Card>{aboutRows.map(renderRow)}</Card>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Danger zone</div>
        <Card>
          <div
            className="menu-row menu-row--error"
            onClick={() => navigate('/delete-account')}
            style={{ cursor: 'pointer' }}
          >
            <span className="menu-icon">
              <Icon name="trash" size={18} />
            </span>
            <span className="menu-label">Delete my account</span>
            <span className="menu-chevron">
              <Icon name="chevronRight" size={20} />
            </span>
          </div>
        </Card>
      </div>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}