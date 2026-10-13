import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, CATEGORY_ICONS, CATEGORY_LABELS } from '../lib/types';

export default function Appliances() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appliances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appliances:', error);
      setLoading(false);
      return;
    }

    setAppliances(data ?? []);
    setLoading(false);
  };

  const warrantyStatus = (expires: string | null) => {
    if (!expires) return null;
    const now = new Date();
    const exp = new Date(expires);
    const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Expired', color: 'error' as const };
    if (days <= 30) return { label: `${days}d left`, color: 'due' as const };
    return { label: 'Under warranty', color: 'success' as const };
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Appliances" onBack={() => navigate('/profile')} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
      </Screen>
    );
  }

  if (appliances.length === 0) {
    return (
      <Screen>
        <Header title="Appliances" onBack={() => navigate('/profile')} />
        <EmptyState
          icon="🔌"
          title="No appliances yet"
          body="Add your first appliance to track maintenance, warranties, and service history."
          ctaLabel="Add appliance"
          onCta={() => navigate('/appliance/new')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="Appliances"
        onBack={() => navigate('/profile')}
        right={
          <button
            className="header-add-btn"
            onClick={() => navigate('/appliance/new')}
            aria-label="Add appliance"
          >
            +
          </button>
        }
      />

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        {appliances.map((a, i) => {
          const w = warrantyStatus(a.warranty_expires_at);
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: easings.easeOutExpo,
                delay: reduce ? 0 : i * 0.05,
              }}
              style={{ marginBottom: 12 }}
            >
              <Card
                className="appliance-list-card"
                onClick={() => navigate(`/appliance/${a.id}`)}
              >
                <div className="appliance-list-icon">
                  {CATEGORY_ICONS[a.category]}
                </div>
                <div className="appliance-list-info">
                  <div className="appliance-list-name">{a.name}</div>
                  <div className="appliance-list-meta">
                    {CATEGORY_LABELS[a.category]}
                    {a.make ? ` · ${a.make}` : ''}
                  </div>
                </div>
                {w && (
                  <span className={`appliance-warranty-pill appliance-warranty-pill--${w.color}`}>
                    {w.label}
                  </span>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </Screen>
  );
}