import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !EMAIL_RE.test(email)) {
      setError('Enter a valid email address');
      return;
    }

    setSubmitting(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );
    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  return (
    <Screen>
      <Header title="Reset password" onBack={() => navigate('/login')} />

      {sent ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
          style={{ textAlign: 'center', paddingTop: 24 }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(46, 125, 50, 0.1)',
              color: '#2E7D32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 32,
            }}
          >
            ✉️
          </div>
          <h2 className="auth-title" style={{ marginBottom: 12 }}>
            Check your inbox
          </h2>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            We sent a reset link to <strong>{email}</strong>. Tap it to set a
            new password.
          </p>
          <Button onClick={() => navigate('/login')}>Back to sign in</Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easings.easeOutExpo }}
          >
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              Enter your email and we'll send you a link to reset your
              password.
            </p>

            <Input
              id="reset-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="alex@example.com"
              autoComplete="email"
              required
            />

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </motion.div>
        </form>
      )}
    </Screen>
  );
}