import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';
import {
  Household as HouseholdType,
  HouseholdMember,
  getCurrentHousehold,
  getHouseholdMembers,
  createHousehold,
  joinHousehold,
  leaveHousehold,
} from '../lib/household';

type Mode = 'view' | 'choose' | 'create' | 'join';

export default function Household() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('view');
  const [household, setHousehold] = useState<HouseholdType | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTone, setToastTone] = useState<'default' | 'error'>('default');

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const h = await getCurrentHousehold();
    if (h) {
      const m = await getHouseholdMembers(h.id);
      setHousehold(h);
      setMembers(m);
      setMode('view');
    } else {
      setHousehold(null);
      setMembers([]);
      setMode('choose');
    }
    setLoading(false);
  };

  const showToast = (msg: string, tone: 'default' | 'error' = 'default') => {
    setToastMessage(msg);
    setToastTone(tone);
    setToastVisible(true);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const { household: h, error: err } = await createHousehold(name.trim());
    setBusy(false);
    if (err || !h) {
      setError(err ?? 'Could not create household.');
      return;
    }
    await load();
    showToast('Household created');
    setName('');
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const { household: h, error: err } = await joinHousehold(code.trim());
    setBusy(false);
    if (err || !h) {
      setError(err ?? 'Could not join household.');
      return;
    }
    await load();
    showToast('Joined household');
    setCode('');
  };

  const handleLeave = async () => {
    if (!household) return;
    if (
      !confirm(
        `Leave "${household.name}"? You\u2019ll lose access to its shared data.`
      )
    )
      return;
    setBusy(true);
    const { error: err } = await leaveHousehold(household.id);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    await load();
    showToast('Left household');
  };

  const handleCopyCode = async () => {
    if (!household) return;
    try {
      await navigator.clipboard.writeText(household.invite_code);
      showToast('Code copied');
    } catch {
      showToast('Copy failed', 'error');
    }
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Household" onBack={() => navigate('/profile')} />
        <Skeleton height="120px" />
        <div style={{ height: 12 }} />
        <Skeleton height="80px" />
      </Screen>
    );
  }

  const isOwner = household?.created_by === user?.id;

  return (
    <Screen>
      <Header title="Household" onBack={() => navigate('/profile')} />

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* ---------- No household: choose ---------- */}
      {mode === 'choose' && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
        >
          <div className="household-hero">
            <div className="household-hero-icon">
              <Icon name="household" size={32} strokeWidth={1.6} />
            </div>
            <h2 className="household-hero-title">Share your home</h2>
            <p className="household-hero-body">
              Invite a partner, spouse, or family member to see the same
              property, appliances, and tasks.
            </p>
          </div>

          <div className="household-actions">
            <Card
              className="household-action-card"
              onClick={() => setMode('create')}
            >
              <div className="household-action-icon">
                <Icon name="add" size={20} />
              </div>
              <div className="household-action-content">
                <div className="household-action-title">
                  Create a household
                </div>
                <div className="household-action-body">
                  Start fresh and invite others with a code.
                </div>
              </div>
              <Icon name="chevronRight" size={20} />
            </Card>

            <Card
              className="household-action-card"
              onClick={() => setMode('join')}
            >
              <div className="household-action-icon">
                <Icon name="arrowRight" size={20} />
              </div>
              <div className="household-action-content">
                <div className="household-action-title">
                  Join a household
                </div>
                <div className="household-action-body">
                  Enter an invite code someone shared with you.
                </div>
              </div>
              <Icon name="chevronRight" size={20} />
            </Card>
          </div>
        </motion.div>
      )}

      {/* ---------- Create ---------- */}
      {mode === 'create' && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <h2 className="household-form-title">Name your household</h2>
          <p className="household-form-sub">
            Something you and your household will recognize.
          </p>
          <Input
            label="Household name"
            value={name}
            onChange={setName}
            placeholder="e.g. The Smith Home"
          />
          <Button onClick={handleCreate} disabled={!name.trim() || busy}>
            {busy ? 'Creating...' : 'Create household'}
          </Button>
          <button
            className="sheet-cancel"
            onClick={() => {
              setMode('choose');
              setName('');
              setError(null);
            }}
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* ---------- Join ---------- */}
      {mode === 'join' && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <h2 className="household-form-title">Enter your invite code</h2>
          <p className="household-form-sub">
            Ask the household owner for the code. It looks like{' '}
            <strong>H-XXXXX</strong>.
          </p>
          <Input
            label="Invite code"
            value={code}
            onChange={(v) => setCode(v.toUpperCase())}
            placeholder="H-XXXXX"
          />
          <Button onClick={handleJoin} disabled={!code.trim() || busy}>
            {busy ? 'Joining...' : 'Join household'}
          </Button>
          <button
            className="sheet-cancel"
            onClick={() => {
              setMode('choose');
              setCode('');
              setError(null);
            }}
          >
            Cancel
          </button>
        </motion.div>
      )}

      {/* ---------- View household ---------- */}
      {mode === 'view' && household && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easings.easeOutExpo }}
        >
          <div className="household-hero">
            <div className="household-hero-icon">
              <Icon name="household" size={32} strokeWidth={1.6} />
            </div>
            <h2 className="household-hero-title">{household.name}</h2>
            <p className="household-hero-body">
              {isOwner ? 'You own this household.' : 'You are a member.'}
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">Invite code</h3>
            <Card className="household-code-card">
              <div className="household-code">{household.invite_code}</div>
              <button
                className="household-copy-btn"
                onClick={handleCopyCode}
                aria-label="Copy invite code"
              >
                <Icon name="documents" size={16} />
                Copy
              </button>
            </Card>
            <p className="input-hint">
              Share this with anyone you want in your household. They enter it
              on their Household screen.
            </p>
          </div>

          <div className="section">
            <h3 className="section-title">
              Members ({members.length})
            </h3>
            <div className="household-members">
              {members.map((m, i) => {
                const isYou = m.user_id === user?.id;
                const initial =
                  isYou && user?.email
                    ? user.email[0].toUpperCase()
                    : '?';
                return (
                  <motion.div
                    key={m.user_id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: easings.easeOutExpo,
                      delay: reduce ? 0 : i * 0.05,
                    }}
                  >
                    <Card className="household-member-card">
                      <div className="household-member-avatar">
                        {isYou ? initial : <Icon name="household" size={18} />}
                      </div>
                      <div className="household-member-info">
                        <div className="household-member-name">
                          {isYou
                            ? 'You'
                            : m.role === 'owner'
                              ? 'Owner'
                              : 'Household member'}
                        </div>
                        {isYou && (
                          <div className="household-member-role">
                            {m.role === 'owner' ? 'Owner' : 'Member'}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="household-leave">
            <button
              className="danger-link"
              onClick={handleLeave}
              disabled={busy}
            >
              Leave household
            </button>
            <p className="input-hint">
              Leaving removes your access to shared data. It does not delete
              anything from the household.
            </p>
          </div>
        </motion.div>
      )}

      <Toast
        message={toastMessage}
        visible={toastVisible}
        tone={toastTone}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}