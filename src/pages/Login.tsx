import { useState, FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { signIn, signUp } = useAuth();
  const reduce = useReducedMotion();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validate = () => {
    let ok = true;
    if (!email) {
      setEmailError('Email is required');
      ok = false;
    } else if (!EMAIL_RE.test(email)) {
      setEmailError('Enter a valid email address');
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required');
      ok = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      ok = false;
    } else {
      setPasswordError(null);
    }

    return ok;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validate()) return;

    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setSubmitting(false);

    if (error) setAuthError(error);
  };

  const toggleMode = () => {
    setIsSignUp((v) => !v);
    setAuthError(null);
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <Screen>
      <form onSubmit={handleSubmit} noValidate>
        <motion.div
          className="auth-header"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easings.easeOutExpo }}
        >
          <motion.div
            className="auth-logo"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : 0.05,
            }}
          >
            <Icon name="home" size={44} strokeWidth={1.5} />
          </motion.div>
          <h1 className="auth-title">Hearth</h1>
          <p className="auth-subtitle">
            {isSignUp ? 'Create your account' : 'Welcome back'}
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
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="alex@example.com"
            error={emailError}
            autoComplete="email"
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
            error={passwordError}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
          />

          {authError && (
            <motion.div
              className="auth-error"
              role="alert"
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {authError}
            </motion.div>
          )}

          <Button disabled={submitting}>
            {submitting
              ? isSignUp
                ? 'Creating account...'
                : 'Signing in...'
              : isSignUp
              ? 'Create account'
              : 'Sign in'}
          </Button>

          <button
            type="button"
            className="auth-toggle"
            onClick={toggleMode}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </motion.div>
      </form>
    </Screen>
  );
}