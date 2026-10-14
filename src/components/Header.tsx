import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';
import { easings } from '../lib/motion';
import { Icon } from '../lib/icons';

type Props = { title: string; right?: ReactNode; onBack?: () => void };

export default function Header({ title, right, onBack }: Props) {
  const reduce = useReducedMotion();
  const words = title.split(' ');

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        {onBack && (
          <button
            className="header-back"
            onClick={onBack}
            aria-label="Back"
          >
            <Icon name="back" size={20} />
          </button>
        )}
        <h1 className="header-title">
          {words.map((word, i) => (
            <span key={i} className="header-word-mask">
              <motion.span
                className="header-word"
                initial={reduce ? { y: 0, opacity: 1 } : { y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  ease: easings.easeOutExpo,
                  delay: reduce ? 0 : i * 0.06,
                }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && ' '}
            </span>
          ))}
        </h1>
      </div>
      {right}
    </div>
  );
}

export { Header };