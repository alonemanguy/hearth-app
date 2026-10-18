import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { easings } from '../lib/motion';

const STORAGE_KEY = 'hearth.cookie_consent.v1';

export default function CookieConsent() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const choose = (value: 'accepted' | 'essential-only') => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cookie-banner"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: easings.easeOutExpo }}
        >
          <div className="cookie-banner-inner">
            <p className="cookie-banner-text">
              Hearth keeps you signed in with one essential cookie. With your
              permission we also measure which features get used, so we know
              what to work on next. Details in our{' '}
              <Link to="/privacy">privacy policy</Link>.
            </p>
            <div className="cookie-banner-actions">
              <button
                className="cookie-btn cookie-btn--ghost"
                onClick={() => choose('essential-only')}
                type="button"
              >
                Essential only
              </button>
              <button
                className="cookie-btn cookie-btn--primary"
                onClick={() => choose('accepted')}
                type="button"
              >
                Accept all
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
