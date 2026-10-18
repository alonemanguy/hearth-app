import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { Icon } from '../lib/icons';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';

export default function Waitlist() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: err } = await supabase
      .from('waitlist')
      .insert({ email: email.trim() });

    setSubmitting(false);

    if (err) {
      if (err.code === '23505') {
        // Already on the list — that's the outcome they wanted anyway.
        setSubmitted(true);
        return;
      }
      setError("That didn't go through. Try again in a moment.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Screen>
        <Header title="Waitlist" onBack={() => navigate('/login')} />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
          style={{ textAlign: 'center', paddingTop: 24 }}
        >
          <div className="auth-success-icon">
            <Icon name="check" size={32} strokeWidth={1.6} />
          </div>
          <h1 className="auth-title" style={{ marginBottom: 12 }}>
            You're on the waitlist
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            We'll let you know when Hearth is ready for you.
          </p>
          <Button onClick={() => navigate('/login')}>Go to login</Button>
        </motion.div>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Join the waitlist" onBack={() => navigate('/welcome')} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <h1 className="auth-title" style={{ marginBottom: 12 }}>
          Hearth is coming soon
        </h1>
        <p className="auth-subtitle" style={{ marginBottom: 20 }}>
          We're opening up to a small group of homeowners first. Enter your
          email and we'll let you know when it's your turn.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            required
          />
          <Button type="submit" disabled={submitting || !email.trim()}>
            {submitting ? 'Joining...' : 'Join waitlist'}
          </Button>
        </form>

        <p
          className="auth-subtitle"
          style={{ fontSize: 13, marginTop: 20, textAlign: 'center' }}
        >
          No spam. We'll only email you when your invite is ready.
        </p>
      </motion.div>
    </Screen>
  );
}
