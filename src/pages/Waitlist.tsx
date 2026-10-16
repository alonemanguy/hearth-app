import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
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
      setError(err.message);
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
          className="p-6 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6 mx-auto">
            <Icon name="check" size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're on the waitlist</h1>
          <p className="text-gray-600 mb-6">
            We'll let you know when Hearth is ready for you.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to login
          </Button>
        </motion.div>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Join the Waitlist" onBack={() => navigate('/welcome')} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        className="p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hearth is coming soon</h1>
        <p className="text-gray-600 mb-8">
          We're opening up to a small group of homeowners first. Enter your email and we'll let you know when it's your turn.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            required
          />
          <Button
            type="submit"
            disabled={submitting || !email.trim()}
            className="w-full"
          >
            {submitting ? 'Joining...' : 'Join waitlist'}
          </Button>
        </form>
        <p className="mt-6 text-xs text-gray-400 text-center">
          No spam. Home OS for every homeowner.
        </p>
      </motion.div>
    </Screen>
  );
}