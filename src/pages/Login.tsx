import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;

// Mirrors PASSWORD_RE, one line per requirement so nothing is a surprise
// at submit time.
const PW_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  {
    label: 'Upper and lowercase letters',
    test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  },
  { label: 'A number', test: (pw) => /\d/.test(pw) },
  {
    label: 'A symbol',
    test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
];

function PasswordChecklist({ password }: { password: string }) {
  const reduce = useReducedMotion();
  return (
    <ul className="pw-rules">
      {PW_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`pw-rule ${ok ? 'pw-rule--ok' : ''}`}
          >
            <span className="pw-rule-mark" aria-hidden="true">
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                <motion.path
                  d="M 2 6.5 L 4.8 9 L 10 3"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={{ pathLength: ok ? 1 : 0, opacity: ok ? 1 : 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.25, ease: 'easeOut' }
                  }
                />
              </svg>
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export function Login() {
  const navigate = useNavigate();
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

    if (isSignUp) {
      if (!password) {
        setPasswordError('Password is required');
        ok = false;
      } else if (!PASSWORD_RE.test(password)) {
        setPasswordError(
          'Password must be 12+ characters with uppercase, lowercase, number, and special character'
        );
        ok = false;
      } else {
        setPasswordError(null);
      }
    } else {
      if (!password) {
        setPasswordError('Password is required');
        ok = false;
      } else {
        setPasswordError(null);
      }
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
            initial={reduce ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : 0.05,
            }}
          >
            <Logo size={72} animated />
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
            delay: reduce ? 0 : 0.2,
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
            onChange={(v) => {
              setPassword(v);
              // The checklist tells the story while typing; the error
              // only needs to exist at submit time.
              if (passwordError) setPasswordError(null);
            }}
            placeholder={isSignUp ? 'Make it count' : 'Your password'}
            error={passwordError}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
          />

          {isSignUp && <PasswordChecklist password={password} />}

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
          )}

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

          <Button type="submit" disabled={submitting}>
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

export default Login;