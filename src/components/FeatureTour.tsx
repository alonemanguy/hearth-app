import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Button from './Button';
import { Icon, IconName } from '../lib/icons';
import { easings } from '../lib/motion';

type Slide = {
  icon: IconName;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'home',
    title: 'Welcome to Hearth',
    body: 'Task reminders, appliance records, warranty dates. Here is where each one lives.',
  },
  {
    icon: 'wrench',
    title: 'Recurring tasks',
    body: 'Mark a task as recurring and Hearth schedules the next one automatically.',
  },
  {
    icon: 'household',
    title: 'Share your home',
    body: 'Invite a partner or family member to see the same tasks and appliances.',
  },
  {
    icon: 'camera',
    title: 'Save photos and warranties',
    body: 'Attach photos of nameplates or warranty PDFs to any appliance.',
  },
];

type Props = {
  onDone: () => void;
};

export default function FeatureTour({ onDone }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const handleNext = () => {
    if (isLast) onDone();
    else setIndex((i) => i + 1);
  };

  const handleSkip = () => onDone();

  return (
    <div className="tour-backdrop">
      <motion.div
        className="tour-card"
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <button
          className="tour-skip"
          onClick={handleSkip}
          aria-label="Skip tour"
          type="button"
        >
          Skip
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: easings.easeOutExpo }}
            className="tour-slide"
          >
            <div className="tour-icon">
              <Icon name={slide.icon} size={36} strokeWidth={1.6} />
            </div>
            <h2 className="tour-title">{slide.title}</h2>
            <p className="tour-body">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="tour-dots">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`tour-dot ${i === index ? 'tour-dot--active' : ''}`}
            />
          ))}
        </div>

        <Button onClick={handleNext}>
          {isLast ? 'Got it' : 'Next'}
        </Button>
      </motion.div>
    </div>
  );
}