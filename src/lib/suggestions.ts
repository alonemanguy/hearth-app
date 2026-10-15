import { Appliance, ApplianceCategory } from './types';
import { IconName } from './icons';

export type Suggestion = {
  id: string;
  title: string;
  repeat: 'once' | 'monthly' | 'quarterly' | 'yearly';
  dueInDays: number;
  icon: IconName;
  reason: string;
};

export type CommonAppliance = {
  key: string;
  label: string;
  category: ApplianceCategory;
};

const COMMON_APPLIANCES: CommonAppliance[] = [
  { key: 'hvac', label: 'HVAC system', category: 'hvac' },
  { key: 'water-heater', label: 'Water heater', category: 'plumbing' },
  { key: 'fridge', label: 'Refrigerator', category: 'appliance' },
  { key: 'dishwasher', label: 'Dishwasher', category: 'appliance' },
  { key: 'washer-dryer', label: 'Washer / dryer', category: 'appliance' },
  { key: 'smoke-detector', label: 'Smoke detectors', category: 'electrical' },
];

export function getCommonApplianceSuggestions(
  existing: Appliance[]
): CommonAppliance[] {
  const existingNames = new Set(
    existing.map((a) => a.name.toLowerCase().trim())
  );

  return COMMON_APPLIANCES.filter((c) => {
    const name = c.label.toLowerCase();
    for (const existing of existingNames) {
      if (existing.includes(name.split(' ')[0])) return false;
      if (name.includes(existing)) return false;
    }
    return true;
  }).slice(0, 4);
}

export function getSuggestionsForCategory(
  category: ApplianceCategory
): Suggestion[] {
  switch (category) {
    case 'hvac':
      return [
        {
          id: 'hvac-filter',
          title: 'Replace HVAC filter',
          repeat: 'quarterly',
          dueInDays: 7,
          icon: 'hvac',
          reason: 'Most filters need replacing every 3 months.',
        },
        {
          id: 'hvac-tuneup',
          title: 'Schedule HVAC tune-up',
          repeat: 'yearly',
          dueInDays: 30,
          icon: 'hvac',
          reason: 'Annual servicing extends system life.',
        },
      ];
    case 'plumbing':
      return [
        {
          id: 'plumbing-flush',
          title: 'Flush water heater',
          repeat: 'yearly',
          dueInDays: 14,
          icon: 'plumbing',
          reason: 'Removes sediment and improves efficiency.',
        },
        {
          id: 'plumbing-leaks',
          title: 'Check for leaks under sinks',
          repeat: 'quarterly',
          dueInDays: 7,
          icon: 'plumbing',
          reason: 'Small leaks become big repairs.',
        },
      ];
    case 'electrical':
      return [
        {
          id: 'elec-smoke',
          title: 'Test smoke detectors',
          repeat: 'monthly',
          dueInDays: 3,
          icon: 'electrical',
          reason: 'Recommended every month.',
        },
        {
          id: 'elec-gfci',
          title: 'Test GFCI outlets',
          repeat: 'quarterly',
          dueInDays: 14,
          icon: 'electrical',
          reason: 'Safety check for wet areas.',
        },
      ];
    case 'appliance':
      return [
        {
          id: 'app-clean',
          title: 'Clean appliance coils and vents',
          repeat: 'quarterly',
          dueInDays: 14,
          icon: 'appliance',
          reason: 'Keeps appliances running efficiently.',
        },
        {
          id: 'app-temp',
          title: 'Check fridge temperature',
          repeat: 'monthly',
          dueInDays: 3,
          icon: 'appliance',
          reason: 'Below 40\u00B0F keeps food safe.',
        },
      ];
    default:
      return [
        {
          id: 'generic-walk',
          title: 'Walk through and check for issues',
          repeat: 'monthly',
          dueInDays: 7,
          icon: 'wrench',
          reason: 'A quick scan catches problems early.',
        },
      ];
  }
}