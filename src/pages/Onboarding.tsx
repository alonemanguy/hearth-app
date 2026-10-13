import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Button from '../components/Button';
import HelpLevelPicker from '../components/HelpLevelPicker';
import { useAuth, HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const reduce = useReducedMotion();
  const [level, setLevel] = useState<HelpLevel>('guided');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
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
          <div className="onboarding-logo">🏠</div>
          <h1 className="onboarding-title">Welcome to Hearth</h1>
          <p className="onboarding-subtitle">
            One quick question so we can shape the app around how you like to work.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="onboarding-question">How much help would you like?</div>
          <HelpLevelPicker value={level} onChange={setLevel} />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: easings.easeOutExpo }}
        >
          <Button onClick={handleContinue} disabled={saving}>
            {saving ? 'Setting up...' : 'Continue'}
          </Button>
          <p className="onboarding-hint">
            You can change this anytime in Settings.
          </p>
        </motion.div>
      </div>
    </Screen>
  );
}