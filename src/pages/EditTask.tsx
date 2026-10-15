import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { Appliance } from '../lib/types';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [taskName, setTaskName] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('once');
  const [notes, setNotes] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void load();
  }, [id]);

  const load = async () => {
    setLoading(true);

    const [taskRes, appliancesRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('id', id).single(),
      supabase.from('appliances').select('id, name').order('name'),
    ]);

    if (taskRes.error || !taskRes.data) {
      console.error('Error fetching task:', taskRes.error);
      navigate('/');
      return;
    }

    const t = taskRes.data;
    setTaskName(t.title ?? '');
    setApplianceId(t.appliance_id ?? '');
    setDueDate(t.due_date ?? '');
    setRepeat(t.repeat ?? 'once');
    setNotes(t.notes ?? '');
    setAppliances((appliancesRes.data as Appliance[]) ?? []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);

    const selectedAppliance = appliances.find((a) => a.id === applianceId);

    const { error: err } = await supabase
      .from('tasks')
      .update({
        title: taskName,
        appliance_id: applianceId || null,
        appliance: selectedAppliance?.name ?? null,
        due_date: dueDate,
        repeat,
        notes: notes || null,
      })
      .eq('id', id);

    setSaving(false);

    if (err) {
      console.error('Error saving task:', err);
      setError(err.message);
      return;
    }

    setToastVisible(true);
    setTimeout(() => navigate(`/detail/${id}`), 900);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Edit Task" onBack={() => navigate(-1)} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="72px" />
        <div style={{ height: 12 }} />
        <Skeleton height="140px" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Edit Task" onBack={() => navigate(-1)} />

      <Input
        label="Task name"
        value={taskName}
        onChange={setTaskName}
        placeholder="e.g. Replace HVAC filter"
      />

      <div className="input-group">
        <label>Appliance</label>
        <select
          value={applianceId}
          onChange={(e) => setApplianceId(e.target.value)}
        >
          <option value="">No appliance</option>
          {appliances.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <Input label="Due date" type="date" value={dueDate} onChange={setDueDate} />

      <div className="input-group">
        <label>Repeat</label>
        <div className="segmented-control">
          {['once', 'monthly', 'quarterly', 'yearly'].map((option) => (
            <button
              key={option}
              type="button"
              className={`segment ${repeat === option ? 'segment--active' : ''}`}
              onClick={() => setRepeat(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        {repeat !== 'once' && (
          <p className="input-hint">
            Recurrence rules apply when you mark tasks complete.
          </p>
        )}
      </div>

      <div className="input-group">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any extra details here..."
          rows={4}
        />
      </div>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!taskName.trim() || !dueDate || saving}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </Button>

      <Toast
        message="Task updated"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}