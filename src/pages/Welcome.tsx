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
    title: 'Never miss maintenance',
    body: 'Reminders that reach you even when the app is closed.',
  },
  {
    icon: 'warranty',
    title: 'Remember every warranty',
    body: 'Know exactly what\u2019s covered — and when it expires.',
  },
  {
    icon: 'home',
    title: 'Know your home',
    body: 'One calm place for appliances, records, and service history.',
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
          Every home has a story.
          <br />
          Hearth keeps it.
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
          Track maintenance, warranties, and everything that keeps your home
          running — in one calm place.
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

      <section className="welcome-quote">
        <motion.blockquote
          className="welcome-quote-inner"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: easings.easeOutExpo }}
        >
          <p className="welcome-quote-text">
            &ldquo;I stopped worrying about my HVAC filter the day I started
            using Hearth.&rdquo;
          </p>
          <footer className="welcome-quote-attribution">
            — Early Hearth user
          </footer>
        </motion.blockquote>
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