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

export type MaintenanceTemplate = {
  id: string;
  title: string;
  repeat: 'monthly' | 'quarterly' | 'yearly';
  dueInDays: number;
  reason: string;
};

export const REPEAT_LABELS: Record<MaintenanceTemplate['repeat'], string> = {
  monthly: 'Every month',
  quarterly: 'Every 3 months',
  yearly: 'Every year',
};

export type ApplianceTemplate = {
  id: string;
  label: string;
  category: ApplianceCategory;
  icon: IconName;
  /** Default maintenance schedule. The first entry is the first reminder. */
  tasks: MaintenanceTemplate[];
};

export type MonthlyFocus = {
  id: string;
  title: string;
  body: string;
  linkTo: string;
  icon: IconName;
  tone: 'error' | 'warning' | 'info';
};

export type SeasonalTask = {
  id: string;
  title: string;
  reason: string;
  repeat: 'once' | 'yearly';
  icon: IconName;
};

export const APPLIANCE_TEMPLATES: ApplianceTemplate[] = [
  {
    id: 'hvac',
    label: 'HVAC system',
    category: 'hvac',
    icon: 'hvac',
    tasks: [
      {
        id: 'mt-hvac-filter',
        title: 'Replace the air filter',
        repeat: 'quarterly',
        dueInDays: 7,
        reason: 'Most residential filters last about 90 days.',
      },
      {
        id: 'mt-hvac-tuneup',
        title: 'Annual heating and cooling tune-up',
        repeat: 'yearly',
        dueInDays: 30,
        reason: 'A spring check catches low refrigerant and dirty coils.',
      },
      {
        id: 'mt-hvac-drain',
        title: 'Clear the condensate drain line',
        repeat: 'yearly',
        dueInDays: 60,
        reason: 'A clogged drain is the most common cause of AC leaks.',
      },
    ],
  },
  {
    id: 'water-heater',
    label: 'Water heater',
    category: 'plumbing',
    icon: 'plumbing',
    tasks: [
      {
        id: 'mt-wh-flush',
        title: 'Flush the tank',
        repeat: 'yearly',
        dueInDays: 30,
        reason: 'Sediment settles in the tank and raises heating costs.',
      },
      {
        id: 'mt-wh-leak',
        title: 'Check around the base for leaks',
        repeat: 'quarterly',
        dueInDays: 21,
        reason: 'Slow drips rot floors long before they show.',
      },
    ],
  },
  {
    id: 'fridge',
    label: 'Refrigerator',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-fridge-coils',
        title: 'Clean the condenser coils',
        repeat: 'yearly',
        dueInDays: 21,
        reason: 'Dusty coils make the compressor work harder.',
      },
      {
        id: 'mt-fridge-temp',
        title: 'Check the fridge temperature',
        repeat: 'monthly',
        dueInDays: 10,
        reason: 'Below 40\u00B0F keeps food safe.',
      },
    ],
  },
  {
    id: 'dishwasher',
    label: 'Dishwasher',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-dish-filter',
        title: 'Clean the filter',
        repeat: 'monthly',
        dueInDays: 14,
        reason: 'Food residue is why dishes come out cloudy.',
      },
      {
        id: 'mt-dish-cycle',
        title: 'Run an empty vinegar cycle',
        repeat: 'quarterly',
        dueInDays: 30,
        reason: 'Clears grease and buildup from the spray arms.',
      },
    ],
  },
  {
    id: 'washer',
    label: 'Washer',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-wash-seal',
        title: 'Wipe the door seal and drum',
        repeat: 'monthly',
        dueInDays: 14,
        reason: 'Mold starts in the fold of a front-loader seal.',
      },
      {
        id: 'mt-wash-hoses',
        title: 'Inspect the supply hoses',
        repeat: 'yearly',
        dueInDays: 21,
        reason: 'Rubber hoses split with age. Braided ones last longer.',
      },
    ],
  },
  {
    id: 'dryer',
    label: 'Dryer',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-dry-vent',
        title: 'Clean the dryer vent line',
        repeat: 'yearly',
        dueInDays: 30,
        reason: 'Lint past the trap is a top cause of house fires.',
      },
      {
        id: 'mt-dry-trap',
        title: 'Vacuum behind and under the dryer',
        repeat: 'yearly',
        dueInDays: 60,
        reason: 'Lint collects where you never look.',
      },
    ],
  },
  {
    id: 'smoke-detectors',
    label: 'Smoke / CO detectors',
    category: 'electrical',
    icon: 'electrical',
    tasks: [
      {
        id: 'mt-det-test',
        title: 'Test every detector',
        repeat: 'monthly',
        dueInDays: 3,
        reason: 'Press the test button on each unit in the house.',
      },
      {
        id: 'mt-det-batt',
        title: 'Replace the batteries',
        repeat: 'yearly',
        dueInDays: 45,
        reason: 'Fresh batteries once a year keeps them reliable.',
      },
    ],
  },
  {
    id: 'garbage-disposal',
    label: 'Garbage disposal',
    category: 'plumbing',
    icon: 'plumbing',
    tasks: [
      {
        id: 'mt-disp-clean',
        title: 'Clean and deodorize the disposal',
        repeat: 'monthly',
        dueInDays: 14,
        reason: 'Ice and salt clear the blades and cut the smell.',
      },
      {
        id: 'mt-disp-leak',
        title: 'Check for leaks underneath',
        repeat: 'yearly',
        dueInDays: 60,
        reason: 'A slow leak at the flange rots the cabinet floor.',
      },
    ],
  },
  {
    id: 'range',
    label: 'Range / oven',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-range-wipe',
        title: 'Wipe the oven interior',
        repeat: 'quarterly',
        dueInDays: 45,
        reason: 'Built-up grease smokes and sets off the smoke alarm.',
      },
      {
        id: 'mt-range-hood',
        title: 'Clean the range hood filter',
        repeat: 'quarterly',
        dueInDays: 30,
        reason: 'A greasy filter stops pulling steam and smoke.',
      },
    ],
  },
  {
    id: 'microwave',
    label: 'Microwave',
    category: 'appliance',
    icon: 'appliance',
    tasks: [
      {
        id: 'mt-micro-wipe',
        title: 'Wipe the interior and turntable',
        repeat: 'monthly',
        dueInDays: 21,
        reason: 'Splatter hardens and starts to smell.',
      },
      {
        id: 'mt-micro-filter',
        title: 'Check the vent filter',
        repeat: 'yearly',
        dueInDays: 90,
        reason: 'Grease clogs the filter above the stove.',
      },
    ],
  },
];

export function getApplianceTemplates(): ApplianceTemplate[] {
  return APPLIANCE_TEMPLATES;
}

export function getApplianceTemplateById(
  id: string
): ApplianceTemplate | undefined {
  return APPLIANCE_TEMPLATES.find((t) => t.id === id);
}

export function getCommonApplianceSuggestions(
  existing: Appliance[]
): CommonAppliance[] {
  const candidates: CommonAppliance[] = APPLIANCE_TEMPLATES.map((t) => ({
    key: t.id,
    label: t.label,
    category: t.category,
  }));
  const existingNames = new Set(
    existing.map((a) => a.name.toLowerCase().trim())
  );

  return candidates.filter((c) => {
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

export function getOnboardingPresets(
  category: ApplianceCategory
): Suggestion[] {
  return getSuggestionsForCategory(category).slice(0, 1);
}

/* ------------------------------------------------------------------ */
/* Season detection                                                    */
/* ------------------------------------------------------------------ */

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export function getSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function seasonLabel(s: Season): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/* Seasonal checklists — real things homes need each season            */
/* ------------------------------------------------------------------ */

const SEASONAL_TASKS: Record<Season, SeasonalTask[]> = {
  spring: [
    {
      id: 'spring-ac',
      title: 'Service the AC before summer',
      reason: 'Catch low refrigerant and airflow issues early.',
      repeat: 'yearly',
      icon: 'hvac',
    },
    {
      id: 'spring-gutters',
      title: 'Clean out the gutters',
      reason: 'Winter debris blocks drainage and causes leaks.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'spring-roof',
      title: 'Inspect the roof for winter damage',
      reason: 'Freeze-thaw cycles crack shingles and flashing.',
      repeat: 'yearly',
      icon: 'wrench',
    },
    {
      id: 'spring-detectors',
      title: 'Test smoke and CO detectors',
      reason: 'A quick button press on every unit in the house.',
      repeat: 'yearly',
      icon: 'electrical',
    },
    {
      id: 'spring-exterior',
      title: 'Check exterior paint and caulk',
      reason: 'Small cracks let in moisture and pests.',
      repeat: 'yearly',
      icon: 'home',
    },
  ],
  summer: [
    {
      id: 'summer-ac',
      title: 'Check the AC filter and efficiency',
      reason: 'Peak usage season. Small issues turn into big bills.',
      repeat: 'yearly',
      icon: 'hvac',
    },
    {
      id: 'summer-dryer',
      title: 'Clean the dryer vent',
      reason: 'Lint buildup is a top cause of house fires.',
      repeat: 'yearly',
      icon: 'appliance',
    },
    {
      id: 'summer-hood',
      title: 'Clean the range hood filter',
      reason: 'Cooking grease collects fast in summer.',
      repeat: 'yearly',
      icon: 'appliance',
    },
    {
      id: 'summer-faucets',
      title: 'Check outdoor faucets and irrigation',
      reason: 'Cracked spigots and broken heads waste water all season.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'summer-pests',
      title: 'Look for pest entry points',
      reason: 'Summer is peak season for insects and rodents.',
      repeat: 'yearly',
      icon: 'wrench',
    },
  ],
  fall: [
    {
      id: 'fall-heating',
      title: 'Service the heating system',
      reason: 'Book it before the first cold snap, not during it.',
      repeat: 'yearly',
      icon: 'hvac',
    },
    {
      id: 'fall-gutters',
      title: 'Clean gutters after the leaves fall',
      reason: 'Clogged gutters turn into ice dams in winter.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'fall-flush',
      title: 'Flush the water heater',
      reason: 'Sediment from summer settles and raises winter bills.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'fall-faucets',
      title: 'Winterize outdoor faucets',
      reason: 'Trapped water freezes and bursts pipes.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'fall-seal',
      title: 'Seal gaps around windows and doors',
      reason: 'Keeps heat in and lowers winter bills.',
      repeat: 'yearly',
      icon: 'home',
    },
  ],
  winter: [
    {
      id: 'winter-pipes',
      title: 'Insulate exposed pipes',
      reason: 'Prevent burst pipes during hard freezes.',
      repeat: 'yearly',
      icon: 'plumbing',
    },
    {
      id: 'winter-roof',
      title: 'Watch for ice dams',
      reason: 'Ice dams force water into walls and ceilings.',
      repeat: 'yearly',
      icon: 'wrench',
    },
    {
      id: 'winter-vents',
      title: 'Keep exterior vents clear of snow',
      reason: 'Blocked vents cause carbon monoxide buildup.',
      repeat: 'yearly',
      icon: 'wrench',
    },
    {
      id: 'winter-detectors',
      title: 'Test smoke and CO detectors',
      reason: 'Extra important with windows closed and heating running.',
      repeat: 'yearly',
      icon: 'electrical',
    },
    {
      id: 'winter-gfci',
      title: 'Test GFCI outlets',
      reason: 'Kitchen and bathroom outlets should trip and reset cleanly.',
      repeat: 'yearly',
      icon: 'electrical',
    },
  ],
};

export function getSeasonalChecklist(
  _climateZone?: string | null
): SeasonalTask[] {
  return SEASONAL_TASKS[getSeason()];
}

/* ------------------------------------------------------------------ */
/* Warranty vault helper                                               */
/* ------------------------------------------------------------------ */

export function hasAnyWarrantyDocs(
  appliances: Appliance[]
): boolean {
  return appliances.some((a) => Boolean(a.warranty_expires_at));
}

/* ------------------------------------------------------------------ */
/* Monthly focus                                                       */
/* ------------------------------------------------------------------ */

function seasonalFocusSuggestion(season: Season): MonthlyFocus | null {
  switch (season) {
    case 'spring':
      return {
        id: 'spring-focus',
        title: 'Spring HVAC tune-up',
        body: 'Before summer heat, get your AC checked.',
        linkTo: '/add',
        icon: 'hvac',
        tone: 'info',
      };
    case 'summer':
      return {
        id: 'summer-focus',
        title: 'Check your HVAC filter',
        body: 'Peak usage season. Filters clog faster.',
        linkTo: '/add',
        icon: 'hvac',
        tone: 'info',
      };
    case 'fall':
      return {
        id: 'fall-focus',
        title: 'Winterize your home',
        body: 'Protect pipes, check furnace, clean gutters.',
        linkTo: '/add',
        icon: 'wrench',
        tone: 'warning',
      };
    case 'winter':
      return {
        id: 'winter-focus',
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

export function getMonthlyFocus(
  appliances: Appliance[],
  tasks: { id: string; title: string; due_date: string; status: string }[]
): MonthlyFocus[] {
  const focus: MonthlyFocus[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter(
    (t) => t.status !== 'done' && new Date(t.due_date).getTime() < now.getTime()
  );
  if (overdue.length > 0) {
    focus.push({
      id: 'overdue',
      title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      body: 'Clear these first. They cost the most Home Health points.',
      linkTo: '/',
      icon: 'alert',
      tone: 'error',
    });
  }

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

  const seasonal = seasonalFocusSuggestion(getSeason());
  if (seasonal && focus.length < 3) {
    focus.push(seasonal);
  }

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

/* ------------------------------------------------------------------ */
/* Maintenance templates for the New appliance screen                  */
/* ------------------------------------------------------------------ */

const MAINTENANCE_TEMPLATES: Record<
  ApplianceCategory,
  MaintenanceTemplate[]
> = {
  hvac: [
    {
      id: 'tpl-hvac-filter',
      title: 'Replace air filter',
      repeat: 'quarterly',
      dueInDays: 7,
      reason: 'Most residential filters last about 90 days.',
    },
    {
      id: 'tpl-hvac-tuneup',
      title: 'Annual heating and cooling tune-up',
      repeat: 'yearly',
      dueInDays: 30,
      reason: 'A spring check catches low refrigerant and dirty coils.',
    },
    {
      id: 'tpl-hvac-drain',
      title: 'Clear the condensate drain line',
      repeat: 'yearly',
      dueInDays: 60,
      reason: 'A clogged drain is the most common cause of AC leaks.',
    },
  ],
  plumbing: [
    {
      id: 'tpl-plumbing-flush',
      title: 'Flush the water heater',
      repeat: 'yearly',
      dueInDays: 14,
      reason: 'Sediment settles in the tank and raises heating costs.',
    },
    {
      id: 'tpl-plumbing-hoses',
      title: 'Inspect washing machine hoses',
      repeat: 'yearly',
      dueInDays: 21,
      reason: 'Rubber hoses split with age. Braided ones last longer.',
    },
    {
      id: 'tpl-plumbing-traps',
      title: 'Check traps and under-sink connections',
      repeat: 'quarterly',
      dueInDays: 10,
      reason: 'Slow drips rot cabinets long before you notice them.',
    },
  ],
  electrical: [
    {
      id: 'tpl-electrical-smoke',
      title: 'Test smoke and CO detectors',
      repeat: 'monthly',
      dueInDays: 3,
      reason: 'Press the test button on every unit in the house.',
    },
    {
      id: 'tpl-electrical-gfci',
      title: 'Test GFCI outlets',
      repeat: 'quarterly',
      dueInDays: 14,
      reason: 'Kitchen and bathroom outlets should trip and reset cleanly.',
    },
    {
      id: 'tpl-electrical-panel',
      title: 'Look over the main electrical panel',
      repeat: 'yearly',
      dueInDays: 45,
      reason: 'Scorch marks or warm breakers need an electrician.',
    },
  ],
  appliance: [
    {
      id: 'tpl-appliance-coils',
      title: 'Clean refrigerator coils',
      repeat: 'yearly',
      dueInDays: 21,
      reason: 'Dusty coils make the compressor work harder.',
    },
    {
      id: 'tpl-appliance-filter',
      title: 'Clear the dishwasher filter',
      repeat: 'quarterly',
      dueInDays: 10,
      reason: 'Food residue is why dishes come out cloudy.',
    },
    {
      id: 'tpl-appliance-dryer',
      title: 'Clean the dryer vent line',
      repeat: 'yearly',
      dueInDays: 30,
      reason: 'Lint past the trap is a fire risk.',
    },
  ],
  other: [],
};

export function getMaintenanceTemplates(
  category: ApplianceCategory
): MaintenanceTemplate[] {
  return MAINTENANCE_TEMPLATES[category] ?? [];
}

/**
 * Local-date helpers. toISOString() reports in UTC, so near midnight
 * it can land on the wrong day for the user's timezone.
 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * When a template task should first come due. Counts from the install or
 * purchase date when one is known, otherwise from today. A schedule that
 * would land in the past (the appliance is older than the interval) starts
 * today instead of creating an overdue task on a brand-new appliance.
 */
export function firstDueDate(
  dueInDays: number,
  startDate?: string | null
): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let base = today;
  if (startDate) {
    const parsed = new Date(`${startDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) base = parsed;
  }
  const due = addDays(base, dueInDays);
  return due.getTime() < today.getTime() ? today : due;
}