import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import HelpLevelPicker from '../components/HelpLevelPicker';
import { useAuth, HelpLevel } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';
import { ApplianceCategory, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICONS } from '../lib/icons';

type Step = 'welcome' | 'terms' | 'home' | 'appliance' | 'done';

const STEPS: Step[] = ['welcome', 'terms', 'home', 'appliance', 'done'];

const CATEGORIES: ApplianceCategory[] = [
  'hvac',
  'plumbing',
  'electrical',
  'appliance',
  'other',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const reduce = useReducedMotion();

  const [step, setStep] = useState<Step>('welcome');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [level, setLevel] = useState<HelpLevel>('guided');

  // Step 2
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Step 3
  const [homeNickname, setHomeNickname] = useState('');
  const [homeYear, setHomeYear] = useState('');

  // Step 4
  const [applianceName, setApplianceName] = useState('');
  const [applianceCategory, setApplianceCategory] =
    useState<ApplianceCategory>('appliance');

  const stepIndex = STEPS.indexOf(step);

  const goTo = (s: Step) => {
    setError(null);
    setStep(s);
  };

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) goTo(next);
  };

  const goBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) goTo(prev);
  };

  const handleFinish = async () => {
    setBusy(true);
    setError(null);
    await completeOnboarding(level);
    setBusy(false);
    navigate('/');
  };

  const handleSaveHome = async () => {
    if (!user) return;

    // Optional step — if empty, just move on
    if (!homeNickname.trim()) {
      goNext();
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.from('properties').insert({
      user_id: user.id,
      nickname: homeNickname.trim(),
      year_built: homeYear ? parseInt(homeYear) : null,
      home_type: 'house',
    });
    setBusy(false);

    if (err) {
      setError(err.message);
      return;
    }
    goNext();
  };

  const handleSaveAppliance = async () => {
    if (!user) return;

    if (!applianceName.trim()) {
      goNext();
      return;
    }

    setBusy(true);
    const { error: err } = await supabase.from('appliances').insert({
      user_id: user.id,
      name: applianceName.trim(),
      category: applianceCategory,
    });
    setBusy(false);

    if (err) {
      setError(err.message);
      return;
    }
    goNext();
  };

  /* ---------------------------------------------------------------- */
  /* Step renderers                                                   */
  /* ---------------------------------------------------------------- */

  const renderProgress = () => {
    if (step === 'done') return null;
    return (
      <div className="wizard-progress">
        {STEPS.slice(0, 4).map((s, i) => (
          <div
            key={s}
            className={`wizard-progress-dot ${
              i === stepIndex
                ? 'wizard-progress-dot--active'
                : i < stepIndex
                ? 'wizard-progress-dot--done'
                : ''
            }`}
          />
        ))}
      </div>
    );
  };

  const renderWelcome = () => (
    <motion.div
      className="wizard-body"
      key="welcome"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easings.easeOutExpo }}
    >
      <div className="wizard-header">
        <motion.div
          className="wizard-logo"
          initial={reduce ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.55,
            ease: easings.easeOutExpo,
            delay: 0.05,
          }}
        >
          <Logo size={72} animated />
        </motion.div>
        <h1 className="wizard-title">Welcome to Hearth</h1>
        <p className="wizard-subtitle">
          A few quick questions so we can shape the app around how you live.
        </p>
      </div>

      <div className="wizard-content">
        <div className="onboarding-question">How much help would you like?</div>
        <HelpLevelPicker value={level} onChange={setLevel} />
      </div>

      <div className="wizard-actions">
        <Button onClick={goNext}>Continue</Button>
      </div>
    </motion.div>
  );

  const renderTerms = () => (
    <motion.div
      className="wizard-body"
      key="terms"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easings.easeOutExpo }}
    >
      <div className="wizard-header">
        <h1 className="wizard-title">Before we begin</h1>
        <p className="wizard-subtitle">
          Hearth handles details about your home. We take that seriously.
        </p>
      </div>

      <div className="wizard-content">
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
      </div>

      <div className="wizard-actions">
        <Button onClick={goNext} disabled={!ageConfirmed}>
          I agree — continue
        </Button>
        <button className="wizard-back" onClick={goBack}>
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderHome = () => (
    <motion.div
      className="wizard-body"
      key="home"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easings.easeOutExpo }}
    >
      <div className="wizard-header">
        <h1 className="wizard-title">Tell us about your home</h1>
        <p className="wizard-subtitle">
          Just the basics for now — you can fill in more later.
        </p>
      </div>

      <div className="wizard-content">
        <Input
          label="Nickname"
          value={homeNickname}
          onChange={setHomeNickname}
          placeholder="e.g. Home, Beach House"
        />
        <Input
          label="Year built (optional)"
          value={homeYear}
          onChange={setHomeYear}
          placeholder="1998"
        />
      </div>

      <div className="wizard-actions">
        <Button
          onClick={handleSaveHome}
          disabled={busy}
        >
          {busy
            ? 'Saving...'
            : homeNickname.trim()
            ? 'Save home'
            : 'Skip for now'}
        </Button>
        {!homeNickname.trim() && (
          <button className="wizard-back" onClick={goBack}>
            Back
          </button>
        )}
        {homeNickname.trim() && (
          <button className="wizard-back" onClick={goBack}>
            Back
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderAppliance = () => (
    <motion.div
      className="wizard-body"
      key="appliance"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easings.easeOutExpo }}
    >
      <div className="wizard-header">
        <h1 className="wizard-title">Add your first appliance</h1>
        <p className="wizard-subtitle">
          Hearth tracks warranties and maintenance for each appliance you add.
        </p>
      </div>

      <div className="wizard-content">
        <Input
          label="Name"
          value={applianceName}
          onChange={setApplianceName}
          placeholder="e.g. Kitchen Fridge, Main HVAC"
        />

        <div className="input-group">
          <label>Category</label>
          <div className="category-grid">
            {CATEGORIES.map((c) => {
              const CategoryIcon = CATEGORY_ICONS[c];
              return (
                <button
                  key={c}
                  type="button"
                  className={`category-chip ${
                    applianceCategory === c ? 'category-chip--active' : ''
                  }`}
                  onClick={() => setApplianceCategory(c)}
                >
                  <CategoryIcon size={22} strokeWidth={1.8} />
                  <span className="category-chip-label">
                    {CATEGORY_LABELS[c]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="wizard-actions">
        <Button
          onClick={handleSaveAppliance}
          disabled={busy}
        >
          {busy
            ? 'Saving...'
            : applianceName.trim()
            ? 'Add appliance'
            : 'Skip for now'}
        </Button>
        <button className="wizard-back" onClick={goBack}>
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderDone = () => (
    <motion.div
      className="wizard-body wizard-body--done"
      key="done"
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
          delay: 0.1,
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
              delay: 0.4,
            }}
          />
        </svg>
      </motion.div>

      <h1 className="wizard-title">You're all set</h1>
      <p className="wizard-subtitle">
        Hearth is ready. Add tasks as they come up — or just let the reminders
        find you.
      </p>

      <div className="wizard-actions">
        <Button onClick={handleFinish} disabled={busy}>
          {busy ? 'One moment...' : 'Go to Hearth'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <Screen>
      <div className="wizard">
        {renderProgress()}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        {step === 'welcome' && renderWelcome()}
        {step === 'terms' && renderTerms()}
        {step === 'home' && renderHome()}
        {step === 'appliance' && renderAppliance()}
        {step === 'done' && renderDone()}
      </div>
    </Screen>
  );
}