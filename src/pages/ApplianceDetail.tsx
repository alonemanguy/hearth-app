import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import AttachmentsSection from '../components/AttachmentsSection';
import MaintenanceTemplates from '../components/MaintenanceTemplates';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import {
  addDays,
  getMaintenanceTemplates,
  toISODate,
} from '../lib/suggestions';
import {
  Appliance,
  ApplianceCategory,
  CATEGORY_LABELS,
} from '../lib/types';
import { CATEGORY_ICONS, Icon } from '../lib/icons';

const CATEGORIES: ApplianceCategory[] = [
  'hvac',
  'plumbing',
  'electrical',
  'appliance',
  'other',
];

export default function ApplianceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [editing, setEditing] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ApplianceCategory>(() => {
    const param = searchParams.get('category');
    return CATEGORIES.includes(param as ApplianceCategory)
      ? (param as ApplianceCategory)
      : 'appliance';
  });
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [warrantyExpires, setWarrantyExpires] = useState('');
  const [lifespan, setLifespan] = useState('');
  const [notes, setNotes] = useState('');
  const [templateIds, setTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (isNew) return;
    void fetchAppliance();
  }, [id]);

  const fetchAppliance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appliances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching appliance:', error);
      navigate('/appliances');
      return;
    }

    setAppliance(data);
    populateForm(data);
    setLoading(false);
  };

  const populateForm = (a: Appliance) => {
    setName(a.name ?? '');
    setCategory(a.category);
    setMake(a.make ?? '');
    setModel(a.model ?? '');
    setSerial(a.serial_number ?? '');
    setPurchaseDate(a.purchase_date ?? '');
    setInstallDate(a.install_date ?? '');
    setWarrantyExpires(a.warranty_expires_at ?? '');
    setLifespan(a.lifespan_years?.toString() ?? '');
    setNotes(a.notes ?? '');
  };

  const chooseCategory = (c: ApplianceCategory) => {
    setCategory(c);
    // Drop picks that belonged to the previous category.
    setTemplateIds((ids) =>
      ids.filter((tid) =>
        getMaintenanceTemplates(c).some((t) => t.id === tid)
      )
    );
  };

  const toggleTemplate = (tid: string) => {
    setTemplateIds((ids) =>
      ids.includes(tid) ? ids.filter((x) => x !== tid) : [...ids, tid]
    );
  };

  const handleSave = async () => {
    if (!user || !name.trim()) return;

    setSaveError(null);
    setSaving(true);

    const basePayload = {
      user_id: user.id,
      name: name.trim(),
      category,
      make: make.trim() || null,
      model: model.trim() || null,
      serial_number: serial.trim() || null,
      purchase_date: purchaseDate || null,
      install_date: installDate || null,
      warranty_expires_at: warrantyExpires || null,
      lifespan_years: lifespan ? parseInt(lifespan) : null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (appliance) {
      result = await supabase
        .from('appliances')
        .update(basePayload)
        .eq('id', appliance.id)
        .select()
        .single();
    } else {
      const { data: propData } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      result = await supabase
        .from('appliances')
        .insert({ ...basePayload, property_id: propData?.id ?? null })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving appliance:', result.error);
      setSaving(false);
      setSaveError('Could not save. Check your connection and try again.');
      return;
    }

    // Schedule the picked maintenance templates. If this fails the
    // appliance is already saved, so keep the picks: saving again retries.
    let taskError: { message: string } | null = null;
    const rows = getMaintenanceTemplates(category)
      .filter((t) => templateIds.includes(t.id))
      .map((t) => ({
        user_id: user.id,
        appliance_id: result.data.id,
        appliance: result.data.name,
        title: t.title,
        due_date: toISODate(addDays(new Date(), t.dueInDays)),
        repeat: t.repeat,
        status: 'due',
        notes: null,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from('tasks').insert(rows);
      taskError = error;
      if (error) {
        console.error('Error scheduling maintenance tasks:', error);
      } else {
        setTemplateIds([]);
      }
    }

    setSaving(false);
    setAppliance(result.data);
    setEditing(false);
    if (isNew) navigate(`/appliance/${result.data.id}`, { replace: true });
    if (taskError) {
      setSaveError(
        'Appliance saved, but its maintenance tasks were not scheduled. Edit the appliance and save again to retry.'
      );
    }
  };

  const handleDelete = async () => {
    if (!appliance) return;
    if (!confirm(`Delete "${appliance.name}"? This cannot be undone.`)) return;

    setSaveError(null);
    const { error } = await supabase
      .from('appliances')
      .delete()
      .eq('id', appliance.id);
    if (error) {
      console.error('Error deleting:', error);
      setSaveError('Could not delete. Try again in a moment.');
      return;
    }
    navigate('/appliances');
  };

  const handleCancel = () => {
    if (appliance) {
      populateForm(appliance);
      setEditing(false);
    } else {
      navigate('/appliances');
    }
  };

  if (loading) {
    return (
      <Screen>
        <Header title="Appliance" onBack={() => navigate('/appliances')} />
        <Skeleton height="120px" />
        <div style={{ height: 16 }} />
        <Skeleton height="240px" />
      </Screen>
    );
  }

  if (editing) {
    return (
      <Screen>
        <Header
          title={appliance ? 'Edit appliance' : 'New appliance'}
          onBack={handleCancel}
        />
        {saveError && (
          <div className="form-error" role="alert">
            {saveError}
          </div>
        )}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Kitchen Fridge, Main HVAC"
          />

          <div className="input-group">
            <label>Category</label>
            <div className="category-grid">
              {CATEGORIES.map((c) => {
                const CategoryIcon = CATEGORY_ICONS[c];
                return (
                  <button
                    key={c}
                    type="button"
                    className={`category-chip ${
                      category === c ? 'category-chip--active' : ''
                    }`}
                    onClick={() => chooseCategory(c)}
                  >
                    <CategoryIcon size={22} strokeWidth={1.8} />
                    <span className="category-chip-label">
                      {CATEGORY_LABELS[c]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {(isNew || templateIds.length > 0) && (
            <MaintenanceTemplates
              category={category}
              selected={templateIds}
              onToggle={toggleTemplate}
            />
          )}

          <div className="input-row">
            <Input
              label="Make"
              value={make}
              onChange={setMake}
              placeholder="Whirlpool"
            />
            <Input
              label="Model"
              value={model}
              onChange={setModel}
              placeholder="WRX735"
            />
          </div>

          <Input
            label="Serial number (optional)"
            value={serial}
            onChange={setSerial}
            placeholder="ABC123XYZ"
          />

          <div className="input-row">
            <Input
              label="Purchase date"
              type="date"
              value={purchaseDate}
              onChange={setPurchaseDate}
            />
            <Input
              label="Install date"
              type="date"
              value={installDate}
              onChange={setInstallDate}
            />
          </div>

          <div className="input-row">
            <Input
              label="Warranty expires"
              type="date"
              value={warrantyExpires}
              onChange={setWarrantyExpires}
            />
            <Input
              label="Lifespan (years)"
              value={lifespan}
              onChange={setLifespan}
              placeholder="12"
            />
          </div>

          <div className="input-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Filter size, service history, quirks..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : appliance ? 'Save changes' : 'Add appliance'}
          </Button>

          {appliance && (
            <>
              <button className="sheet-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="danger-link" onClick={handleDelete}>
                Delete appliance
              </button>
            </>
          )}
        </motion.div>
      </Screen>
    );
  }

  if (!appliance) return null;

  const CategoryIcon = CATEGORY_ICONS[appliance.category];

  return (
    <Screen>
      <Header title="Appliance" onBack={() => navigate('/appliances')} />

      {saveError && (
        <div className="form-error" role="alert">
          {saveError}
        </div>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easings.easeOutExpo }}
      >
        <div className="property-hero">
          <div className="property-hero-icon">
            <CategoryIcon size={36} strokeWidth={1.6} />
          </div>
          <h2 className="property-hero-title">{appliance.name}</h2>
          <p className="property-hero-subtitle">
            {CATEGORY_LABELS[appliance.category]}
          </p>
        </div>

        <Card className="detail-card">
          {appliance.make && (
            <div className="info-row">
              <span className="info-label">Make</span>
              <span className="info-value">{appliance.make}</span>
            </div>
          )}
          {appliance.model && (
            <div className="info-row">
              <span className="info-label">Model</span>
              <span className="info-value">{appliance.model}</span>
            </div>
          )}
          {appliance.serial_number && (
            <div className="info-row">
              <span className="info-label">Serial</span>
              <span className="info-value">{appliance.serial_number}</span>
            </div>
          )}
          {appliance.purchase_date && (
            <div className="info-row">
              <span className="info-label">Purchased</span>
              <span className="info-value">
                {new Date(appliance.purchase_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {appliance.install_date && (
            <div className="info-row">
              <span className="info-label">Installed</span>
              <span className="info-value">
                {new Date(appliance.install_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {appliance.warranty_expires_at && (
            <div className="info-row">
              <span className="info-label">Warranty expires</span>
              <span className="info-value">
                {new Date(appliance.warranty_expires_at).toLocaleDateString(
                  'en-US',
                  { month: 'long', day: 'numeric', year: 'numeric' }
                )}
              </span>
            </div>
          )}
          {appliance.lifespan_years && (
            <div className="info-row">
              <span className="info-label">Lifespan</span>
              <span className="info-value">
                {appliance.lifespan_years} years
              </span>
            </div>
          )}
        </Card>

        {appliance.notes && (
          <div className="section">
            <h3 className="section-title">Notes</h3>
            <Card>
              <p className="notes-text">{appliance.notes}</p>
            </Card>
          </div>
        )}

        <AttachmentsSection applianceId={appliance.id} editable />

        <div className="action-buttons">
          <Button
            onClick={() => {
              setSaveError(null);
              setEditing(true);
            }}
          >
            <Icon name="edit" size={16} />
            Edit appliance
          </Button>
        </div>
      </motion.div>
    </Screen>
  );
}
