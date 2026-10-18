import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, CATEGORY_LABELS } from '../lib/types';
import { CATEGORY_ICONS, Icon, IconName } from '../lib/icons';

type Bucket = 'expiring' | 'active' | 'expired' | 'unknown';

type BucketMeta = {
  key: Bucket;
  label: string;
  tone: 'warning' | 'success' | 'error' | 'neutral';
  icon: IconName;
};

const BUCKETS: BucketMeta[] = [
  { key: 'expiring', label: 'Expiring soon', tone: 'warning', icon: 'alert' },
  { key: 'active', label: 'Active', tone: 'success', icon: 'warranty' },
  { key: 'expired', label: 'Expired', tone: 'error', icon: 'clock' },
  { key: 'unknown', label: 'No warranty info', tone: 'neutral', icon: 'info' },
];

function getBucket(warranty: string | null): Bucket {
  if (!warranty) return 'unknown';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(warranty);
  const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring';
  return 'active';
}

function daysLabel(warranty: string | null): string {
  if (!warranty) return 'Not tracked';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(warranty);
  const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 60) return `${days} days left`;
  const months = Math.round(days / 30);
  return `~${months} month${months === 1 ? '' : 's'} left`;
}

export default function Warranties() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) return;
    void fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    setLoadError(false);
    const { data, error } = await supabase
      .from('appliances')
      .select('*')
      .order('warranty_expires_at', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching appliances:', error);
      setLoadError(true);
      setLoading(false);
      return;
    }

    setAppliances((data as Appliance[]) ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Warranties" onBack={() => navigate('/profile')} />
        <Skeleton height="80px" />
        <div style={{ height: 12 }} />
        <Skeleton height="80px" />
        <div style={{ height: 12 }} />
        <Skeleton height="80px" />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen>
        <Header title="Warranties" onBack={() => navigate('/profile')} />
        <EmptyState
          icon="alert"
          title="Couldn't load warranties"
          body="Check your connection and try again."
          ctaLabel="Retry"
          onCta={fetchAll}
        />
      </Screen>
    );
  }

  if (appliances.length === 0) {
    return (
      <Screen>
        <Header title="Warranties" onBack={() => navigate('/profile')} />
        <EmptyState
          icon="warranty"
          title="No appliances yet"
          body="Add your appliances to track warranties and get alerts before they expire."
          ctaLabel="Add appliance"
          onCta={() => navigate('/appliance/new')}
        />
      </Screen>
    );
  }

  const grouped: Record<Bucket, Appliance[]> = {
    expiring: [],
    active: [],
    expired: [],
    unknown: [],
  };

  appliances.forEach((a) => {
    grouped[getBucket(a.warranty_expires_at)].push(a);
  });

  const nonEmptyBuckets = BUCKETS.filter((b) => grouped[b.key].length > 0);

  return (
    <Screen>
      <Header title="Warranties" onBack={() => navigate('/profile')} />

      {nonEmptyBuckets.map((bucket, bucketIdx) => (
        <motion.div
          key={bucket.key}
          className="warranty-bucket"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : bucketIdx * 0.08,
          }}
        >
          <div className={`warranty-bucket-header warranty-bucket-header--${bucket.tone}`}>
            <span className="warranty-bucket-icon">
              <Icon name={bucket.icon} size={16} />
            </span>
            <span className="warranty-bucket-title">{bucket.label}</span>
            <span className="warranty-bucket-count">{grouped[bucket.key].length}</span>
          </div>

          <div className="warranty-list">
            {grouped[bucket.key].map((a, i) => {
              const CategoryIcon = CATEGORY_ICONS[a.category];
              return (
                <motion.div
                  key={a.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: easings.easeOutExpo,
                    delay: reduce ? 0 : bucketIdx * 0.08 + i * 0.05,
                  }}
                >
                  <Card
                    className="warranty-card"
                    onClick={() => navigate(`/appliance/${a.id}`)}
                  >
                    <div className="warranty-card-icon">
                      <CategoryIcon size={20} strokeWidth={2} />
                    </div>
                    <div className="warranty-card-info">
                      <div className="warranty-card-name">{a.name}</div>
                      <div className="warranty-card-meta">
                        {CATEGORY_LABELS[a.category]}
                        {a.make ? ` · ${a.make}` : ''}
                      </div>
                      <div className={`warranty-card-days warranty-card-days--${bucket.tone}`}>
                        {daysLabel(a.warranty_expires_at)}
                      </div>
                    </div>
                    <span className="menu-chevron">
                      <Icon name="chevronRight" size={20} />
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </Screen>
  );
}