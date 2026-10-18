import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ScoreRing, { scoreColor } from '../components/ScoreRing';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Task, Appliance, Property } from '../lib/types';
import { computeHealthReport, HealthReport } from '../lib/health';

const EMPTY_REPORT: HealthReport = {
  total: 0,
  category: 'needs_work',
  categoryLabel: 'Needs work',
  categoryBlurb: '',
  sections: [],
  recommendations: [],
};

export default function Health() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [report, setReport] = useState<HealthReport>(EMPTY_REPORT);

  useEffect(() => {
    if (!user) return;
    void fetchHealth();
  }, [user]);

  const fetchHealth = async () => {
    setFailed(false);
    setLoading(true);
    const [tasksRes, appliancesRes, propertyRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('appliances').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
    ]);

    if (tasksRes.error || appliancesRes.error || propertyRes.error) {
      console.error(
        'Error fetching health data:',
        tasksRes.error || appliancesRes.error || propertyRes.error
      );
      setFailed(true);
      setLoading(false);
      return;
    }

    const tasks = (tasksRes.data as Task[]) ?? [];
    const appliances = (appliancesRes.data as Appliance[]) ?? [];
    const property = (propertyRes.data as Property) ?? null;

    setReport(computeHealthReport(property, appliances, tasks));
    setHasData(tasks.length > 0 || appliances.length > 0 || property !== null);
    setLoading(false);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Home Health" onBack={() => navigate(-1)} />
        <Skeleton height={96} />
        <div style={{ height: 24 }} />
        <Skeleton height="180px" />
        <div style={{ height: 16 }} />
        <Skeleton height="120px" />
      </Screen>
    );
  }

  if (failed) {
    return (
      <Screen>
        <Header title="Home Health" onBack={() => navigate(-1)} />
        <EmptyState
          icon="alert"
          title="Home health didn't load"
          body="We couldn't reach your data. Check your connection and try again."
          ctaLabel="Try again"
          onCta={() => void fetchHealth()}
        />
      </Screen>
    );
  }

  if (!hasData) {
    return (
      <Screen>
        <Header title="Home Health" onBack={() => navigate(-1)} />
        <EmptyState
          icon="home"
          title="Not enough to score yet"
          body="Add an appliance and a couple of tasks, and your home health score will show up here."
          ctaLabel="Back to home"
          onCta={() => navigate('/')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Home Health" onBack={() => navigate(-1)} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings.easeOutExpo }}
      >
        <div className="health-header">
          <ScoreRing score={report.total} size={88} strokeWidth={8} />
          <div className="health-score-info">
            <div className="health-score-label">{report.categoryLabel}</div>
            <div className="health-score-blurb">{report.categoryBlurb}</div>
          </div>
        </div>

        <div className="health-sections">
          <h3 className="health-sections-title">Breakdown</h3>
          <div className="health-sections-list">
            {report.sections.map((s) => (
              <motion.div
                key={s.key}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.03 }}
                className="health-section-item"
              >
                <div className="health-section-info">
                  <div className="health-section-name">{s.label}</div>
                  <div className="health-section-hint">{s.hint}</div>
                </div>
                <div className="health-section-score">
                  <span className="health-section-score-value">{s.score}</span>
                  <span className="health-section-score-max">/{s.max}</span>
                </div>
                <div className="health-section-bar">
                  <div
                    className="health-section-bar-fill"
                    style={{
                      width: `${Math.round((s.score / s.max) * 100)}%`,
                      backgroundColor: scoreColor(
                        Math.round((s.score / s.max) * 100)
                      ),
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {report.recommendations.length > 0 && (
          <div className="health-recommendations">
            <h3 className="health-sections-title">Recommended next steps</h3>
            <div className="health-recommendations-list">
              {report.recommendations.map((r) => (
                <div
                  key={r.id}
                  className="health-recommendation-item"
                  onClick={() => navigate(r.linkTo)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(r.linkTo);
                  }}
                >
                  <div className="health-recommendation-info">
                    <div className="health-recommendation-title">{r.title}</div>
                    <div className="health-recommendation-body">{r.body}</div>
                  </div>
                  <div className="health-recommendation-points">+{r.points}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="health-footer">
          <p className="health-footer-text">
            Your score goes up as you add appliances, track warranties, and
            complete tasks.
          </p>
        </div>
      </motion.div>
    </Screen>
  );
}
