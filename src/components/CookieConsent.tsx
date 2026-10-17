import { useEffect, useState } from 'react';
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

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'essential-only');
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
              Hearth uses essential cookies to keep you signed in, and optional
              analytics (PostHog) to improve the app. No ads, no selling your
              data.
            </p>
            <div className="cookie-banner-actions">
              <button
                className="cookie-btn cookie-btn--ghost"
                onClick={decline}
                type="button"
              >
                Essential only
              </button>
              <button
                className="cookie-btn cookie-btn--primary"
                onClick={accept}
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