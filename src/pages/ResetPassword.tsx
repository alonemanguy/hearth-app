import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';

export default function ResetPassword() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase client auto-detects the recovery token in the URL hash
    // and emits PASSWORD_RECOVERY. We just check if a session exists.
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(Boolean(session));
      setChecking(false);
    };

    // Give Supabase a moment to process the URL hash
    const timer = setTimeout(checkSession, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/'), 1500);
  };

  if (checking) {
    return (
      <Screen>
        <Header title="Set new password" onBack={() => navigate('/login')} />
        <p className="auth-subtitle">Verifying your reset link...</p>
      </Screen>
    );
  }

  if (!hasSession) {
    return (
      <Screen>
        <Header title="Set new password" onBack={() => navigate('/login')} />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
          style={{ textAlign: 'center', paddingTop: 24 }}
        >
          <h2 className="auth-title" style={{ marginBottom: 12 }}>
            Link expired
          </h2>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            This reset link is no longer valid. Request a new one.
          </p>
          <Button onClick={() => navigate('/forgot-password')}>
            Request new link
          </Button>
        </motion.div>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <Header title="Set new password" />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
          style={{ textAlign: 'center', paddingTop: 24 }}
        >
          <h2 className="auth-title" style={{ marginBottom: 12 }}>
            Password updated
          </h2>
          <p className="auth-subtitle">Taking you to your home...</p>
        </motion.div>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Set new password" onBack={() => navigate('/login')} />

      <form onSubmit={handleSubmit} noValidate>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <p className="auth-subtitle" style={{ marginBottom: 20 }}>
            Choose a new password for your Hearth account.
          </p>

          <Input
            id="new-password"
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
            id="confirm-password"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Same password again"
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="auth-error" role="alert">
              {error}
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