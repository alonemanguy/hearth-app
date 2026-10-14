import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import ScoreRing, { scoreColor } from '../components/ScoreRing';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Appliance, Property, Task } from '../lib/types';
import { computeHealthReport } from '../lib/health';
import { Icon } from '../lib/icons';

export default function HomeHealth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    void fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);

    const [propertyRes, appliancesRes, tasksRes] = await Promise.all([
      supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from('appliances').select('*'),
      supabase.from('tasks').select('*'),
    ]);

    setProperty(propertyRes.data ?? null);
    setAppliances((appliancesRes.data as Appliance[]) ?? []);
    setTasks((tasksRes.data as Task[]) ?? []);
    setLoading(false);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Home Health" onBack={() => navigate('/')} />
        <Skeleton height="220px" radius="16px" />
        <div style={{ height: 16 }} />
        <Skeleton height="120px" />
        <div style={{ height: 12 }} />
        <Skeleton height="120px" />
      </Screen>
    );
  }

  const report = computeHealthReport(property, appliances, tasks);
  const accent = scoreColor(report.total);

  return (
    <Screen>
      <Header title="Home Health" onBack={() => navigate('/')} />

      <motion.div
        className="health-hero"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easings.easeOutExpo }}
      >
        <ScoreRing score={report.total} size={200} strokeWidth={14} />
        <h2 className="health-hero-title" style={{ color: accent }}>
          {report.categoryLabel}
        </h2>
        <p className="health-hero-blurb">{report.categoryBlurb}</p>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: easings.easeOutExpo,
          delay: reduce ? 0 : 0.15,
        }}
      >
        <h3 className="section-title">Breakdown</h3>
        <div className="health-sections">
          {report.sections.map((section, i) => {
            const pct = (section.score / section.max) * 100;
            return (
              <motion.div
                key={section.key}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: easings.easeOutExpo,
                  delay: reduce ? 0 : 0.2 + i * 0.06,
                }}
              >
                <Card className="health-section-card">
                  <div className="health-section-icon">
                    <Icon name={section.icon} size={20} />
                  </div>
                  <div className="health-section-content">
                    <div className="health-section-header">
                      <span className="health-section-label">
                        {section.label}
                      </span>
                      <span className="health-section-score">
                        {section.score}
                        <span className="health-section-max">
                          /{section.max}
                        </span>
                      </span>
                    </div>
                    <div className="health-section-hint">{section.hint}</div>
                    <div className="health-section-bar">
                      <motion.div
                        className="health-section-bar-fill"
                        style={{
                          backgroundColor: scoreColor(pct),
                        }}
                        initial={
                          reduce ? false : { width: 0 }
                        }
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.9,
                          ease: easings.easeOutExpo,
                          delay: reduce ? 0 : 0.3 + i * 0.06,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {report.recommendations.length > 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: easings.easeOutExpo,
            delay: reduce ? 0 : 0.5,
          }}
          style={{ marginTop: 24 }}
        >
          <h3 className="section-title">Improve your score</h3>
          <div className="health-recs">
            {report.recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  ease: easings.easeOutExpo,
                  delay: reduce ? 0 : 0.55 + i * 0.05,
                }}
              >
                <Card
                  className="health-rec-card"
                  onClick={() => navigate(rec.linkTo)}
                >
                  <div className="health-rec-icon">
                    <Icon name={rec.icon} size={18} />
                  </div>
                  <div className="health-rec-content">
                    <div className="health-rec-title">{rec.title}</div>
                    <div className="health-rec-body">{rec.body}</div>
                  </div>
                  <div className="health-rec-points">
                    +{rec.points}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="health-footer">
        <p className="health-footer-text">
          Your Home Health Score updates automatically as you add appliances,
          track warranties, and complete tasks.
        </p>
      </div>
    </Screen>
  );
}