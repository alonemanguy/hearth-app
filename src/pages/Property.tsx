import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { easings } from '../lib/motion';
import { Property as PropertyType, HomeType } from '../lib/types';
import { Icon } from '../lib/icons';

const HOME_TYPES: { value: HomeType; label: string }[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'other', label: 'Other' },
];

export default function Property() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduce = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyType | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [homeType, setHomeType] = useState<HomeType>('house');
  const [yearBuilt, setYearBuilt] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  useEffect(() => {
    void fetchProperty();
  }, []);

  const fetchProperty = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching property:', error);
      setLoading(false);
      return;
    }

    setProperty(data);
    if (data) {
      populateForm(data);
    } else {
      setEditing(true);
    }
    setLoading(false);
  };

  const populateForm = (p: PropertyType) => {
    setNickname(p.nickname ?? '');
    setAddress(p.address ?? '');
    setCity(p.city ?? '');
    setStateField(p.state ?? '');
    setCountry(p.country ?? '');
    setPostalCode(p.postal_code ?? '');
    setHomeType(p.home_type ?? 'house');
    setYearBuilt(p.year_built?.toString() ?? '');
    setSquareFeet(p.square_feet?.toString() ?? '');
    setBedrooms(p.bedrooms?.toString() ?? '');
    setBathrooms(p.bathrooms?.toString() ?? '');
    setClimateZone(p.climate_zone ?? '');
    setPurchaseDate(p.purchase_date ?? '');
    setPurchasePrice(p.purchase_price?.toString() ?? '');
  };

  const handleSave = async () => {
    if (!user || !nickname.trim()) return;

    setSaving(true);

    const payload = {
      user_id: user.id,
      nickname: nickname.trim(),
      address: address.trim() || null,
      city: city.trim() || null,
      state: stateField.trim() || null,
      country: country.trim() || null,
      postal_code: postalCode.trim() || null,
      home_type: homeType,
      year_built: yearBuilt ? parseInt(yearBuilt) : null,
      square_feet: squareFeet ? parseInt(squareFeet) : null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseFloat(bathrooms) : null,
      climate_zone: climateZone.trim() || null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (property) {
      result = await supabase
        .from('properties')
        .update(payload)
        .eq('id', property.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      console.error('Error saving property:', result.error);
      alert('Could not save. Please try again.');
      return;
    }

    setProperty(result.data);
    setEditing(false);
  };

  const handleCancel = () => {
    if (property) {
      populateForm(property);
      setEditing(false);
    } else {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <Screen>
        <Header title="My Home" onBack={() => navigate('/profile')} />
        <Skeleton height="80px" />
        <div style={{ height: 16 }} />
        <Skeleton height="200px" />
      </Screen>
    );
  }

  if (editing) {
    return (
      <Screen>
        <Header
          title={property ? 'Edit Home' : 'Add Your Home'}
          onBack={handleCancel}
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.easeOutExpo }}
        >
          <Input
            label="Nickname"
            value={nickname}
            onChange={setNickname}
            placeholder="e.g. Home, Beach House"
          />

          <Input
            label="Address"
            value={address}
            onChange={setAddress}
            placeholder="123 Main St"
          />

          <div className="input-row">
            <Input label="City" value={city} onChange={setCity} placeholder="City" />
            <Input
              label="State"
              value={stateField}
              onChange={setStateField}
              placeholder="State"
            />
          </div>

          <div className="input-row">
            <Input
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="Country"
            />
            <Input
              label="Postal code"
              value={postalCode}
              onChange={setPostalCode}
              placeholder="000000"
            />
          </div>

          <div className="input-group">
            <label>Home type</label>
            <div className="segmented-control">
              {HOME_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`segment ${
                    homeType === t.value ? 'segment--active' : ''
                  }`}
                  onClick={() => setHomeType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-row">
            <Input
              label="Year built"
              value={yearBuilt}
              onChange={setYearBuilt}
              placeholder="1998"
            />
            <Input
              label="Square feet"
              value={squareFeet}
              onChange={setSquareFeet}
              placeholder="1800"
            />
          </div>

          <div className="input-row">
            <Input
              label="Bedrooms"
              value={bedrooms}
              onChange={setBedrooms}
              placeholder="3"
            />
            <Input
              label="Bathrooms"
              value={bathrooms}
              onChange={setBathrooms}
              placeholder="2"
            />
          </div>

          <Input
            label="Climate zone (optional)"
            value={climateZone}
            onChange={setClimateZone}
            placeholder="e.g. Temperate, Tropical, Arid"
          />

          <div className="input-row">
            <Input
              label="Purchase date"
              type="date"
              value={purchaseDate}
              onChange={setPurchaseDate}
            />
            <Input
              label="Purchase price"
              value={purchasePrice}
              onChange={setPurchasePrice}
              placeholder="350000"
            />
          </div>

          <Button onClick={handleSave} disabled={!nickname.trim() || saving}>
            {saving ? 'Saving...' : property ? 'Save Changes' : 'Create Home'}
          </Button>

          {property && (
            <button className="sheet-cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </motion.div>
      </Screen>
    );
  }

  if (!property) {
    return (
      <Screen>
        <Header title="My Home" onBack={() => navigate('/profile')} />
        <EmptyState
          icon="home"
          title="No home added yet"
          body="Add your home to start tracking appliances, warranties, and value."
          ctaLabel="Add your home"
          onCta={() => setEditing(true)}
        />
      </Screen>
    );
  }

  const addressLine = [
    property.address,
    property.city,
    property.state,
    property.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Screen>
      <Header title="My Home" onBack={() => navigate('/profile')} />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: easings.easeOutExpo }}
      >
        <div className="property-hero">
          <div className="property-hero-icon">
            <Icon name="home" size={36} strokeWidth={1.6} />
          </div>
          <h2 className="property-hero-title">{property.nickname}</h2>
          {addressLine && (
            <p className="property-hero-subtitle">{addressLine}</p>
          )}
        </div>

        <Card className="detail-card">
          <div className="info-row">
            <span className="info-label">Type</span>
            <span className="info-value" style={{ textTransform: 'capitalize' }}>
              {property.home_type}
            </span>
          </div>
          {property.year_built && (
            <div className="info-row">
              <span className="info-label">Year built</span>
              <span className="info-value">{property.year_built}</span>
            </div>
          )}
          {property.square_feet && (
            <div className="info-row">
              <span className="info-label">Square feet</span>
              <span className="info-value">
                {property.square_feet.toLocaleString()}
              </span>
            </div>
          )}
          {(property.bedrooms || property.bathrooms) && (
            <div className="info-row">
              <span className="info-label">Beds / Baths</span>
              <span className="info-value">
                {property.bedrooms ?? '—'} / {property.bathrooms ?? '—'}
              </span>
            </div>
          )}
          {property.climate_zone && (
            <div className="info-row">
              <span className="info-label">Climate zone</span>
              <span className="info-value">{property.climate_zone}</span>
            </div>
          )}
          {property.purchase_date && (
            <div className="info-row">
              <span className="info-label">Purchased</span>
              <span className="info-value">
                {new Date(property.purchase_date).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {property.purchase_price && (
            <div className="info-row">
              <span className="info-label">Purchase price</span>
              <span className="info-value">
                {property.purchase_price.toLocaleString()}
              </span>
            </div>
          )}
        </Card>

        <div className="action-buttons">
          <Button onClick={() => setEditing(true)}>Edit Home</Button>
          <Button variant="secondary" onClick={() => navigate('/appliances')}>
            View Appliances
          </Button>
        </div>
      </motion.div>
    </Screen>
  );
}