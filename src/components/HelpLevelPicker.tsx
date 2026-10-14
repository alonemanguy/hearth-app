import { motion, useReducedMotion } from 'motion/react';
import { HelpLevel } from '../lib/auth';
import { easings } from '../lib/motion';
import { Icon, IconName } from '../lib/icons';

type Option = {
  value: HelpLevel;
  title: string;
  body: string;
  icon: IconName;
};

const OPTIONS: Option[] = [
  {
    value: 'basic',
    title: 'Just the basics',
    body: 'I know my home. Show me the essentials, skip the rest.',
    icon: 'add',
  },
  {
    value: 'guided',
    title: 'Guide me',
    body: 'Teach me as I go. Helpful tips, no overwhelm.',
    icon: 'compass',
  },
  {
    value: 'detailed',
    title: 'Everything',
    body: 'Show me the why. Full context for every task and reminder.',
    icon: 'book',
  },
];

type Props = {
  value: HelpLevel;
  onChange: (level: HelpLevel) => void;
};

export function HelpLevelPicker({ value, onChange }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="help-picker">
      {OPTIONS.map((opt, i) => {
        const active = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            className={`help-option ${active ? 'help-option--active' : ''}`}
            onClick={() => onChange(opt.value)}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.42,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : i * 0.08,
            }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <div className="help-option-icon">
              <Icon name={opt.icon} size={22} />
            </div>
            <div className="help-option-text">
              <div className="help-option-title">{opt.title}</div>
              <div className="help-option-body">{opt.body}</div>
            </div>
            <div className={`help-radio ${active ? 'help-radio--active' : ''}`}>
              {active && (
                <motion.div
                  layoutId="help-radio-dot"
                  className="help-radio-dot"
                />
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default HelpLevelPicker;