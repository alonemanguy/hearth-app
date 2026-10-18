import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase, supabaseUrl } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Icon } from '../lib/icons';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete || deleting) return;

    setDeleting(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      setError('Not signed in.');
      setDeleting(false);
      return;
    }

    try {
      const res = await fetch(
        `${supabaseUrl}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ confirm: 'DELETE' }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setError(text || 'Deletion failed. Please try again.');
        setDeleting(false);
        return;
      }

      await signOut();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Network error. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <Screen>
      <Header title="Delete account" onBack={() => navigate('/settings')} />

      <div className="delete-warning">
        <div className="delete-warning-icon">
          <Icon name="alert" size={24} />
        </div>
        <h2 className="delete-warning-title">This can't be undone.</h2>
        <p className="delete-warning-body">
          Deleting your account permanently removes:
        </p>
        <ul className="delete-warning-list">
          <li>Your home profile and address</li>
          <li>Every appliance, warranty, and serial number</li>
          <li>All tasks, notes, and completion history</li>
          <li>Notification preferences and push subscriptions</li>
        </ul>
        <p className="delete-warning-body">
          This happens immediately. There is no recovery, no backup, no undo.
        </p>
      </div>

      <Card>
        <Input
          id="confirm-delete"
          label="Type DELETE to confirm"
          value={confirmation}
          onChange={setConfirmation}
          placeholder="DELETE"
          autoComplete="off"
        />
      </Card>

      {error && (
        <div className="form-error" style={{ marginTop: 16 }} role="alert">
          {error}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!canDelete || deleting}
        >
          {deleting ? 'Deleting...' : 'Delete my account permanently'}
        </Button>
        <button
          className="sheet-cancel"
          onClick={() => navigate('/settings')}
          type="button"
        >
          Cancel
        </button>
      </div>
    </Screen>
  );
}