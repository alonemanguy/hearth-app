import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';
import { Appliance } from '../lib/types';

export default function Add() {
  const navigate = useNavigate();

  const [taskName, setTaskName] = useState('');
  const [applianceId, setApplianceId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('once');
  const [notes, setNotes] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    const { data } = await supabase
      .from('appliances')
      .select('id, name')
      .order('name');
    setAppliances((data as Appliance[]) ?? []);
  };

  const handleSave = async () => {
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      alert('Not signed in.');
      return;
    }

    const selectedAppliance = appliances.find((a) => a.id === applianceId);

    const { error } = await supabase.from('tasks').insert({
      title: taskName,
      appliance_id: applianceId || null,
      appliance: selectedAppliance?.name ?? null,
      due_date: dueDate,
      repeat,
      notes: notes || null,
      status: 'due',
      user_id: user.id,
    });

    setSaving(false);

    if (error) {
      console.error('Error saving task:', error);
      alert('Could not save task. Please try again.');
      return;
    }

    setToastVisible(true);
    setTimeout(() => navigate('/'), 1200);
  };

  return (
    <Screen>
      <Header title="New Task" onBack={() => navigate(-1)} />

      <Input
        label="Task name"
        value={taskName}
        onChange={setTaskName}
        placeholder="e.g. Replace HVAC filter"
      />

      <div className="input-group">
        <label>Appliance</label>
        <select value={applianceId} onChange={(e) => setApplianceId(e.target.value)}>
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
            When you mark this done, the next one is scheduled automatically.
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

      <Button onClick={handleSave} disabled={!taskName || !dueDate || saving}>
        {saving ? 'Saving...' : 'Save Task'}
      </Button>

      <Toast
        message="Task saved"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Screen>
  );
}