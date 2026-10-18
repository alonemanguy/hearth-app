import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { Appliance, Task } from '../lib/types';

export default function Add() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [taskName, setTaskName] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('once');
  const [notes, setNotes] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  useEffect(() => {
    void fetchAppliances();
    if (isEdit && id) {
      void fetchTask(id);
    }
  }, [id]);

  const fetchAppliances = async () => {
    const { data } = await supabase
      .from('appliances')
      .select('id, name')
      .order('name');
    setAppliances((data as Appliance[]) ?? []);
  };

  const fetchTask = async (taskId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !data) {
      console.error('Error fetching task:', error);
      navigate('/');
      return;
    }

    const task = data as Task;
    setTaskName(task.title ?? '');
    setApplianceId(task.appliance_id ?? '');
    setDueDate(task.due_date ?? '');
    setRepeat(task.repeat ?? 'once');
    setNotes(task.notes ?? '');
    setLoading(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setSaveError('Your session ended. Sign in again to save.');
      return;
    }

    const selectedAppliance = appliances.find((a) => a.id === applianceId);

    const payload = {
      title: taskName,
      appliance_id: applianceId || null,
      appliance: selectedAppliance?.name ?? null,
      due_date: dueDate,
      repeat,
      notes: notes || null,
    };

    let error: { message: string } | null = null;

    if (isEdit && id) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('tasks').insert({
        ...payload,
        status: 'due',
        user_id: user.id,
      });
      error = insertError;
    }

    setSaving(false);

    if (error) {
      console.error('Error saving task:', error);
      setSaveError('Could not save. Check your connection and try again.');
      return;
    }

    setToastVisible(true);
    setTimeout(() => navigate(isEdit && id ? `/detail/${id}` : '/'), 1200);
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Edit task" onBack={() => navigate(-1)} />
        <Skeleton height="48px" />
        <div style={{ height: 16 }} />
        <Skeleton height="48px" />
        <div style={{ height: 16 }} />
        <Skeleton height="48px" />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title={isEdit ? 'Edit task' : 'New task'}
        onBack={() => navigate(-1)}
      />

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
              className={`segment ${
                repeat === option ? 'segment--active' : ''
              }`}
              onClick={() => setRepeat(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        {repeat !== 'once' && (
          <p className="input-hint">
            When you mark this done, the next one is scheduled automatically.
          </p>
        )}
      </div>

      <div className="input-group">
        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Filter size 20x25x1"
          rows={4}
        />
      </div>

      {saveError && (
        <div className="form-error" role="alert">
          {saveError}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={!taskName || !dueDate || saving}
      >
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save task'}
      </Button>

      <Toast
        message={isEdit ? 'Task updated' : 'Task saved'}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}