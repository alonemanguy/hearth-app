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

export type MonthlyFocus = {
  id: string;
  title: string;
  body: string;
  linkTo: string;
  icon: IconName;
  tone: 'error' | 'warning' | 'info';
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

/**
 * When a user adds an appliance during onboarding,
 * return 1-2 presets to auto-create as tasks.
 */
export function getOnboardingPresets(
  category: ApplianceCategory
): Suggestion[] {
  return getSuggestionsForCategory(category).slice(0, 1);
}

function getSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function seasonalSuggestion(season: string): MonthlyFocus | null {
  switch (season) {
    case 'spring':
      return {
        id: 'spring-hvac',
        title: 'Spring HVAC tune-up',
        body: 'Before summer heat, get your AC checked.',
        linkTo: '/add',
        icon: 'hvac',
        tone: 'info',
      };
    case 'summer':
      return {
        id: 'summer-filter',
        title: 'Check your HVAC filter',
        body: 'Peak usage season \u2014 filters clog faster.',
        linkTo: '/add',
        icon: 'hvac',
        tone: 'info',
      };
    case 'fall':
      return {
        id: 'fall-winterize',
        title: 'Winterize your home',
        body: 'Protect pipes, check furnace, clean gutters.',
        linkTo: '/add',
        icon: 'wrench',
        tone: 'warning',
      };
    case 'winter':
      return {
        id: 'winter-pipes',
        title: 'Watch for frozen pipes',
        body: 'Keep cabinets open on cold nights.',
        linkTo: '/add',
        icon: 'plumbing',
        tone: 'warning',
      };
    default:
      return null;
  }
}

/**
 * Compute the top 3 things a user should focus on right now.
 * Priority: overdue tasks > expiring warranties > season > suggested appliance tasks.
 */
export function getMonthlyFocus(
  appliances: Appliance[],
  tasks: { id: string; title: string; due_date: string; status: string }[]
): MonthlyFocus[] {
  const focus: MonthlyFocus[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Overdue tasks
  const overdue = tasks.filter(
    (t) => t.status !== 'done' && new Date(t.due_date).getTime() < now.getTime()
  );
  if (overdue.length > 0) {
    focus.push({
      id: 'overdue',
      title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      body: 'Clear these first \u2014 they drag down your Home Health.',
      linkTo: '/',
      icon: 'alert',
      tone: 'error',
    });
  }

  // 2. Warranty expiring soon
  const soon = new Date(now.getTime() + 30 * 86400000);
  const expiring = appliances.filter((a) => {
    if (!a.warranty_expires_at) return false;
    const exp = new Date(a.warranty_expires_at);
    return exp.getTime() > now.getTime() && exp.getTime() <= soon.getTime();
  });
  if (expiring.length > 0) {
    focus.push({
      id: 'warranty',
      title: `${expiring.length} warrant${
        expiring.length === 1 ? 'y' : 'ies'
      } expiring soon`,
      body: 'Check coverage before it lapses.',
      linkTo: '/warranties',
      icon: 'warranty',
      tone: 'warning',
    });
  }

  // 3. Seasonal suggestion
  const seasonal = seasonalSuggestion(getSeason());
  if (seasonal && focus.length < 3) {
    focus.push(seasonal);
  }

  // 4. Fill remaining slots with appliance suggestions
  if (focus.length < 3 && appliances.length > 0) {
    for (const appliance of appliances) {
      if (focus.length >= 3) break;
      const suggestions = getSuggestionsForCategory(appliance.category);
      for (const s of suggestions) {
        if (focus.length >= 3) break;
        const alreadyThere = focus.some(
          (f) => f.title.toLowerCase() === s.title.toLowerCase()
        );
        if (alreadyThere) continue;
        focus.push({
          id: `suggest-${appliance.id}-${s.id}`,
          title: s.title,
          body: s.reason,
          linkTo: '/add',
          icon: s.icon,
          tone: 'info',
        });
      }
    }
  }

  return focus.slice(0, 3);
}