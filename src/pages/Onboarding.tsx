import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Button from '../components/Button';
import HelpLevelPicker from '../components/HelpLevelPicker';
import { useAuth, HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const reduce = useReducedMotion();
  const [level, setLevel] = useState<HelpLevel>('guided');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!ageConfirmed) return;
    setSaving(true);
    await completeOnboarding(level);
    setSaving(false);
  };

  return (
    <Screen>
      <div className="onboarding-wrap">
        <motion.div
          className="onboarding-header"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easings.easeOutExpo }}
        >
          <motion.div
            className="onboarding-logo"
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.55,
              ease: easings.easeOutExpo,
              delay: 0.05,
            }}
          >
            <Icon name="home" size={40} strokeWidth={1.5} />
          </motion.div>
          <h1 className="onboarding-title">Welcome to Hearth</h1>
          <p className="onboarding-subtitle">
            Two quick things, then you're in.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="onboarding-question">How much help would you like?</div>
          <HelpLevelPicker value={level} onChange={setLevel} />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.4,
            ease: easings.easeOutExpo,
          }}
        >
          <label className="age-gate">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="age-gate-checkbox"
            />
            <span className="age-gate-text">
              I confirm I am 18 years or older and I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.45,
            duration: 0.4,
            ease: easings.easeOutExpo,
          }}
        >
          <Button onClick={handleContinue} disabled={!ageConfirmed || saving}>
            {saving ? 'Setting up...' : 'Continue'}
          </Button>
          <p className="onboarding-hint">
            You can change your help level anytime in Settings.
          </p>
        </motion.div>
      </div>
    </Screen>
  );
}