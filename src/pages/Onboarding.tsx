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
import { ApplianceCategory, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICONS } from '../lib/icons';
import {
  getOnboardingPresets,
  getApplianceTemplates,
  getApplianceTemplateById,
} from '../lib/suggestions';

type Step = 'welcome' | 'name' | 'terms' | 'home' | 'appliance' | 'done';

const STEPS: Step[] = [
  'welcome',
  'name',
  'terms',
  'home',
  'appliance',
  'done',
];

const PROGRESS_STEPS: Step[] = [
  'welcome',
  'name',
  'terms',
  'home',
  'appliance',
];

const CATEGORIES: ApplianceCategory[] = [
  'hvac',
  'plumbing',
  'electrical',
  'appliance',
  'other',
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const reduce = useReducedMotion();

  const [step, setStep] = useState<Step>('welcome');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [level, setLevel] = useState<HelpLevel>('guided');
  const [firstName, setFirstName] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [homeNickname, setHomeNickname] = useState('');
  const [homeYear, setHomeYear] = useState('');

  const [applianceName, setApplianceName] = useState('');
  const [applianceCategory, setApplianceCategory] =
    useState<ApplianceCategory>('appliance');
  const [applianceMake, setApplianceMake] = useState('');
  const [applianceModel, setApplianceModel] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = getApplianceTemplates();

  const stepIndex = STEPS.indexOf(step);
  const progressIndex = PROGRESS_STEPS.indexOf(step);

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

  const selectTemplate = (templateId: string) => {
    const template = getApplianceTemplateById(templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setApplianceName(template.label);
    setApplianceCategory(template.category);
  };

  const handleFinish = async () => {
    setBusy(true);
    setError(null);
    await completeOnboarding(level, firstName);
    setBusy(false);
    navigate('/');
  };

  const handleSaveHome = async () => {
    if (!user) return;

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

    const template = selectedTemplate
      ? getApplianceTemplateById(selectedTemplate)
      : undefined;

    const { data: inserted, error: err } = await supabase
      .from('appliances')
      .insert({
        user_id: user.id,
        name: applianceName.trim(),
        category: applianceCategory,
        make: applianceMake.trim() || null,
        model: applianceModel.trim() || null,
        warranty_expires_at: warrantyExpiry || null,
      })
      .select()
      .single();

    if (err || !inserted) {
      setBusy(false);
      setError(err?.message ?? 'Could not save appliance.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let taskTitle: string;
    let taskRepeat: 'once' | 'monthly' | 'quarterly' | 'yearly' = 'once';
    let taskDueInDays: number = 7;

    if (template) {
      taskTitle = template.defaultTask;
      taskRepeat = template.defaultInterval;
      taskDueInDays = template.defaultDueInDays;
    } else {
      const presets = getOnboardingPresets(applianceCategory);
      if (presets.length > 0) {
        taskTitle = presets[0].title;
        taskRepeat = presets[0].repeat;
        taskDueInDays = presets[0].dueInDays;
      } else {
        taskTitle = 'Check appliance';
        taskRepeat = 'once';
        taskDueInDays = 7;
      }
    }

    const dueDate = addDays(today, taskDueInDays);

    const { error: taskError } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: taskTitle,
      appliance_id: inserted.id,
      appliance: inserted.name,
      due_date: dueDate,
      repeat: taskRepeat,
      status: 'due',
    });

    if (taskError) {
      console.error('Error creating first task:', taskError);
      setBusy(false);
      setError('Appliance saved, but we could not set up your first reminder.');
      goNext();
      return;
    }

    setBusy(false);
    goNext();
  };

  const renderProgress = () => {
    if (step === 'done') return null;
    return (
      <div className="wizard-progress">
        {PROGRESS_STEPS.map((s, i) => (
          <div
            key={s}
            className={`wizard-progress-dot ${
              i === progressIndex
                ? 'wizard-progress-dot--active'
                : i < progressIndex
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

  const renderName = () => (
    <motion.div
      className="wizard-body"
      key="name"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: easings.easeOutExpo }}
    >
      <div className="wizard-header">
        <h1 className="wizard-title">What should we call you?</h1>
        <p className="wizard-subtitle">
          We'll use your first name for greetings and reminders.
        </p>
      </div>

      <div className="wizard-content">
        <Input
          id="onboarding-name"
          label="First name"
          value={firstName}
          onChange={setFirstName}
          placeholder="e.g. Alex"
          autoComplete="given-name"
          autoFocus
        />
      </div>

      <div className="wizard-actions">
        <Button onClick={goNext} disabled={!firstName.trim()}>
          Continue
        </Button>
        <button className="wizard-back" onClick={goBack}>
          Back
        </button>
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
          placeholder="e.g. Cozy Nest, The Cabin"
        />
        <Input
          label="Year built (optional)"
          value={homeYear}
          onChange={setHomeYear}
          placeholder="e.g. 1998"
        />
      </div>

      <div className="wizard-actions">
        <Button onClick={handleSaveHome} disabled={busy}>
          {busy
            ? 'Saving...'
            : homeNickname.trim()
            ? 'Save home'
            : 'Skip for now'}
        </Button>
        <button className="wizard-back" onClick={goBack}>
          Back
        </button>
      </div>
    </motion.div>
  );

  const renderAppliance = () => {
    const template = selectedTemplate ? getApplianceTemplateById(selectedTemplate) : null;

    return (
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
            Pick what you have, and we'll set up its first reminder for you.
          </p>
        </div>

        <div className="wizard-content">
          <div className="template-grid">
            {templates.map((t) => {
              const isSelected = selectedTemplate === t.id;
              const TemplateIcon = CATEGORY_ICONS[t.category];
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`template-card ${isSelected ? 'template-card--active' : ''}`}
                  onClick={() => selectTemplate(t.id)}
                >
                  <div className="template-icon">
                    <TemplateIcon size={24} strokeWidth={1.8} />
                  </div>
                  <div className="template-info">
                    <div className="template-title">{t.label}</div>
                    <div className="template-task">{t.defaultTask}</div>
                    <div className="template-interval">
                      {t.defaultInterval} • {t.defaultDueInDays} days
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="divider">Or enter manually</div>

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
                    onClick={() => {
                      setApplianceCategory(c);
                      setSelectedTemplate(null);
                    }}
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

          <div className="details-section-header">
            <span className="details-section-title">Details</span>
            <span className="details-section-hint">
              Helps Hearth track warranties. Skip if you don't know them yet.
            </span>
          </div>

          <div className="input-row">
            <Input
              label="Make"
              value={applianceMake}
              onChange={setApplianceMake}
              placeholder="Whirlpool"
            />
            <Input
              label="Model"
              value={applianceModel}
              onChange={setApplianceModel}
              placeholder="WRX735"
            />
          </div>

          <Input
            label="Warranty expires"
            type="date"
            value={warrantyExpiry}
            onChange={setWarrantyExpiry}
          />
        </div>

        <div className="wizard-actions">
          <Button onClick={handleSaveAppliance} disabled={busy}>
            {busy
              ? 'Setting up...'
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
  };

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

      <h1 className="wizard-title">
        You're all set{firstName.trim() ? `, ${firstName.trim()}` : ''}
      </h1>
      <p className="wizard-subtitle">
        Hearth is ready. Your first task is already waiting for you.
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
        {step === 'name' && renderName()}
        {step === 'terms' && renderTerms()}
        {step === 'home' && renderHome()}
        {step === 'appliance' && renderAppliance()}
        {step === 'done' && renderDone()}
      </div>
    </Screen>
  );
}