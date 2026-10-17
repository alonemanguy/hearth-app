import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Task, Appliance, Property } from '../lib/types';
import { Icon } from '../lib/icons';
import { computeHealthReport } from '../lib/health';

export default function Health() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = setReportPlaceholder();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  function setReportPlaceholder() {
    return {
      total: 0,
      category: 'needs_work' as const,
      categoryLabel: 'Needs work',
      categoryBlurb: '',
      sections: [] as { key: string; label: string; score: number; max: number; icon: string; hint: string }[],
      recommendations: [] as { id: string; title: string; body: string; points: number; linkTo: string; icon: string }[],
    };
  }

  useEffect(() => {
    if (!user) return;
    void fetchHealth();
  }, [user]);

  const fetchHealth = async () => {
    setLoading(true);
    const [tasksRes, appliancesRes, propertyRes] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('appliances').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
    ]);

    if (tasksRes.error || appliancesRes.error || propertyRes.error) {
      console.error('Error fetching health data:', tasksRes.error || appliancesRes.error || propertyRes.error);
      setLoading(false);
      return;
    }

    const tasks = (tasksRes.data as Task[]) ?? [];
    const appliances = (appliancesRes.data as Appliance[]) ?? [];
    const property = (propertyRes.data as Property) ?? null;

    const report = computeHealthReport(property, appliances, tasks);
    setReport(report);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const sectionColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return '#10B981';
    if (ratio >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Home Health" onBack={() => navigate(-1)} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
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
        className="p-4"
      >
        <div className="health-header">
          <div className="health-score-ring">
            <div className="health-score-circle" style={{
              borderColor: sectionColor(report.total, 100),
              borderTopColor: 'transparent',
            }} />
            <div className="health-score-number">{report.total}</div>
          </div>
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
                  <div className="health-section-score-value">{s.score}</div>
                  <div className="health-section-score-max">/{s.max}</div>
                </div>
                <div className="health-section-bar">
                  <div className="health-section-bar-fill" style={{
                    width: `${Math.round((s.score / s.max) * 100)}%`,
                    backgroundColor: sectionColor(s.score, s.max),
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {report.recommendations.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easings.easeOutExpo }}
            className="mt-6"
          >
            <h3 className="health-sections-title">Recommended next steps</h3>
            <div className="health-recommendations-list">
              {report.recommendations.map((r) => (
                <motion.div
                  key={r.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : 0.03 }}
                  className="health-recommendation-item"
                >
                  <div className="health-recommendation-info">
                    <div className="health-recommendation-title">{r.title}</div>
                    <div className="health-recommendation-body">{r.body}</div>
                  </div>
                  <div className="health-recommendation-points">+{r.points}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="health-footer">
          <p className="health-footer-text">
            Your score goes up as you add appliances, track warranties, and complete tasks.
          </p>
        </div>
      </motion.div>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}