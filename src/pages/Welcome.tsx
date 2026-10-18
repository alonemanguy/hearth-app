import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { easings } from '../lib/motion';
import { Icon, IconName } from '../lib/icons';

type Feature = {
  icon: IconName;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: 'bell',
    title: 'Reminders that arrive',
    body: 'A push notification before a filter, flush, or service is due.',
  },
  {
    icon: 'warranty',
    title: 'Warranty dates on file',
    body: 'Add the expiry date once and see it before it lapses.',
  },
  {
    icon: 'appliance',
    title: 'Appliances and records',
    body: 'Make, model, serial number, and service notes for each one.',
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <motion.div
          className="welcome-logo"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: easings.easeOutExpo }}
        >
          <Logo size={96} animated />
        </motion.div>

        <motion.h1
          className="welcome-title"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.15,
          }}
        >
          Filter changes, warranty dates,
          <br />
          service history.
        </motion.h1>

        <motion.p
          className="welcome-subtitle"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.25,
          }}
        >
          One place for all of it, with a reminder before each one is due.
        </motion.p>

        <motion.div
          className="welcome-cta"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.35,
          }}
        >
          <Button onClick={() => navigate('/login')}>
            Get started
            <Icon name="arrowRight" size={18} />
          </Button>
          <p className="welcome-hint">Free to use. No credit card.</p>
        </motion.div>
      </section>

      <section className="welcome-features">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="welcome-feature"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.5,
              ease: easings.easeOutExpo,
              delay: reduce ? 0 : i * 0.08,
            }}
          >
            <div className="welcome-feature-icon">
              <Icon name={feature.icon} size={22} />
            </div>
            <h3 className="welcome-feature-title">{feature.title}</h3>
            <p className="welcome-feature-body">{feature.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="welcome-footer">
        <div className="welcome-footer-inner">
          <div className="welcome-footer-brand">
            <Logo size={28} />
            <span className="welcome-footer-name">Hearth</span>
          </div>
          <div className="welcome-footer-links">
            <button onClick={() => navigate('/privacy')}>Privacy</button>
            <button onClick={() => navigate('/terms')}>Terms</button>
          </div>
          <p className="welcome-footer-copy">
            © {new Date().getFullYear()} Hearth. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}