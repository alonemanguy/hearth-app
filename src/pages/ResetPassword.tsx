import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

type Mode = 'loading' | 'form' | 'success' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [mode, setMode] = useState<Mode>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setMode('form');
      } else {
        setMode('invalid');
      }
    };

    void check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (cancelled) return;
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setMode('form');
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async () => {
    setPasswordError(null);
    setConfirmError(null);
    setFormError(null);

    let ok = true;
    if (!password) {
      setPasswordError('Password is required');
      ok = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      ok = false;
    }

    if (!confirm) {
      setConfirmError('Confirm your password');
      ok = false;
    } else if (confirm !== password) {
      setConfirmError('Passwords do not match');
      ok = false;
    }

    if (!ok) return;

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setMode('success');
    setTimeout(() => navigate('/', { replace: true }), 1800);
  };

  if (mode === 'loading') {
    return (
      <Screen>
        <div className="auth-loading">
          <Logo size={56} animated />
        </div>
      </Screen>
    );
  }

  if (mode === 'invalid') {
    return (
      <Screen>
        <motion.div
          className="auth-header"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <div className="auth-logo">
            <Icon name="alert" size={44} strokeWidth={1.5} />
          </div>
          <h1 className="auth-title">Link expired</h1>
          <p className="auth-subtitle">
            This reset link is invalid or has already been used.
          </p>
        </motion.div>
        <div className="action-buttons" style={{ marginTop: 24 }}>
          <Button onClick={() => navigate('/login', { replace: true })}>
            Back to sign in
          </Button>
        </div>
      </Screen>
    );
  }

  if (mode === 'success') {
    return (
      <Screen>
        <motion.div
          className="auth-header"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <motion.div
            className="wizard-done-icon"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: easings.easeOutExpo,
              delay: 0.05,
            }}
          >
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M 4 12.5 L 10 18 L 20 6"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.55,
                  ease: 'easeOut',
                  delay: 0.35,
                }}
              />
            </svg>
          </motion.div>
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">Taking you home...</p>
        </motion.div>
      </Screen>
    );
  }

  return (
    <Screen>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        noValidate
      >
        <motion.div
          className="auth-header"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easings.easeOutExpo }}
        >
          <div className="auth-logo">
            <Logo size={64} animated />
          </div>
          <h1 className="auth-title">Set a new password</h1>
          <p className="auth-subtitle">
            Choose something secure that you'll remember.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.15,
          }}
        >
          <Input
            id="reset-password"
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            error={passwordError}
            autoComplete="new-password"
            required
          />

          <Input
            id="reset-confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Type it again"
            error={confirmError}
            autoComplete="new-password"
            required
          />

          {formError && (
            <div className="auth-error" role="alert">
              {formError}
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update password'}
          </Button>
        </motion.div>
      </form>
    </Screen>
  );
}