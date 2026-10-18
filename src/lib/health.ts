import { Appliance, Property, Task } from './types';
import { IconName } from './icons';

export type HealthSectionKey =
  | 'maintenance'
  | 'warranties'
  | 'appliances'
  | 'documentation';

export type HealthSection = {
  key: HealthSectionKey;
  label: string;
  score: number;
  max: number;
  icon: IconName;
  hint: string;
};

export type Recommendation = {
  id: string;
  title: string;
  body: string;
  points: number;
  linkTo: string;
  icon: IconName;
};

export type HealthCategory = 'excellent' | 'good' | 'fair' | 'needs_work';

export type HealthReport = {
  total: number;
  category: HealthCategory;
  categoryLabel: string;
  categoryBlurb: string;
  sections: HealthSection[];
  recommendations: Recommendation[];
};

/* ----------------------------------------------------------------
 * Score each dimension
 * -------------------------------------------------------------- */

function scoreMaintenance(tasks: Task[]): { score: number; max: number } {
  const max = 30;
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const overdue = tasks.filter((t) => t.status === 'overdue');
  const completed = tasks.filter((t) => t.status === 'done');

  const totalRelevant = openTasks.length + completed.length;

  // No tasks at all → baseline of half credit
  if (totalRelevant === 0) {
    return { score: Math.round(max * 0.5), max };
  }

  const completionRatio = completed.length / totalRelevant;
  const overduePenalty = Math.min(overdue.length * 3, 15);

  let score = Math.round(completionRatio * max);
  score -= overduePenalty;

  return {
    score: Math.max(0, Math.min(score, max)),
    max,
  };
}

function scoreWarranties(appliances: Appliance[]): {
  score: number;
  max: number;
} {
  const max = 25;
  if (appliances.length === 0) return { score: 0, max };

  const withWarranty = appliances.filter(
    (a) => a.warranty_expires_at
  ).length;
  const coverageRatio = withWarranty / appliances.length;

  const now = new Date();
  const activeWarranties = appliances.filter(
    (a) =>
      a.warranty_expires_at && new Date(a.warranty_expires_at) > now
  ).length;
  const activeRatio = activeWarranties / appliances.length;

  const score = Math.round(coverageRatio * 15 + activeRatio * 10);
  return { score: Math.min(score, max), max };
}

function scoreAppliances(appliances: Appliance[]): {
  score: number;
  max: number;
} {
  const max = 25;
  if (appliances.length === 0) return { score: 0, max };

  // Up to 10 pts for having a reasonable set of appliances documented
  const quantityScore = Math.min(appliances.length * 3.5, 10);

  // 10 pts scaled by % with make + model
  const withDetails = appliances.filter((a) => a.make && a.model).length;
  const detailsScore = (withDetails / appliances.length) * 10;

  // 5 pts scaled by % with any notes
  const withNotes = appliances.filter(
    (a) => a.notes && a.notes.trim().length > 5
  ).length;
  const notesScore = (withNotes / appliances.length) * 5;

  const score = Math.round(quantityScore + detailsScore + notesScore);
  return { score: Math.min(score, max), max };
}

function scoreDocumentation(
  property: Property | null,
  appliances: Appliance[]
): { score: number; max: number } {
  const max = 20;
  let score = 0;

  if (property) {
    if (property.address) score += 3;
    if (property.year_built) score += 3;
    if (property.square_feet) score += 2;
    if (property.purchase_date) score += 2;
  }

  if (appliances.length > 0) {
    const withPurchaseDate = appliances.filter(
      (a) => a.purchase_date
    ).length;
    score += (withPurchaseDate / appliances.length) * 5;

    const withSerial = appliances.filter((a) => a.serial_number).length;
    score += (withSerial / appliances.length) * 5;
  }

  return { score: Math.round(score), max };
}

/* ----------------------------------------------------------------
 * Category bucket
 * -------------------------------------------------------------- */

function categorize(total: number): {
  category: HealthCategory;
  label: string;
  blurb: string;
} {
  if (total >= 85) {
    return {
      category: 'excellent',
      label: 'Excellent',
      blurb: 'Records are current, and nothing is overdue.',
    };
  }
  if (total >= 70) {
    return {
      category: 'good',
      label: 'Good',
      blurb: 'Mostly current. A couple of gaps in the records.',
    };
  }
  if (total >= 50) {
    return {
      category: 'fair',
      label: 'Fair',
      blurb: 'Some tasks have slipped and a few records are missing.',
    };
  }
  return {
    category: 'needs_work',
    label: 'Needs work',
    blurb: 'Behind on tasks, and most records are missing.',
  };
}

/* ----------------------------------------------------------------
 * Recommendations engine
 * -------------------------------------------------------------- */

function buildRecommendations(
  property: Property | null,
  appliances: Appliance[],
  tasks: Task[],
  sectionScores: Record<HealthSectionKey, number>
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Property
  if (!property) {
    recs.push({
      id: 'add-property',
      title: 'Add your home details',
      body: 'Year built, size, and purchase date make the score more accurate.',
      points: 10,
      linkTo: '/property',
      icon: 'home',
    });
  } else {
    if (!property.year_built) {
      recs.push({
        id: 'add-year',
        title: 'Add your home\u2019s year built',
        body: 'Counts toward the documentation score.',
        points: 3,
        linkTo: '/property',
        icon: 'calendar',
      });
    }
    if (!property.address) {
      recs.push({
        id: 'add-address',
        title: 'Add your home address',
        body: 'Kept on file for warranty and service paperwork.',
        points: 3,
        linkTo: '/property',
        icon: 'pin',
      });
    }
  }

  // Appliances
  if (appliances.length === 0) {
    recs.push({
      id: 'add-appliance',
      title: 'Add your first appliance',
      body: 'Track warranties, service dates, and manuals in one place.',
      points: 15,
      linkTo: '/appliance/new',
      icon: 'appliance',
    });
  } else {
    if (appliances.length < 3) {
      recs.push({
        id: 'add-more-appliances',
        title: 'Add more appliances',
        body: `Three documented appliances is where this score starts moving. You have ${appliances.length}.`,
        points: 5,
        linkTo: '/appliance/new',
        icon: 'appliance',
      });
    }

    const missingWarranty = appliances.filter(
      (a) => !a.warranty_expires_at
    ).length;
    if (missingWarranty > 0) {
      recs.push({
        id: 'add-warranties',
        title: `Track ${missingWarranty} ${
          missingWarranty === 1 ? 'warranty' : 'warranties'
        }`,
        body: 'Add expiry dates so nothing lapses unnoticed.',
        points: Math.min(missingWarranty * 2, 8),
        linkTo: '/appliances',
        icon: 'warranty',
      });
    }

    const missingSerial = appliances.filter(
      (a) => !a.serial_number
    ).length;
    if (missingSerial >= 2) {
      recs.push({
        id: 'add-serials',
        title: 'Record appliance serial numbers',
        body: 'Service calls and claims go faster with the serial on file.',
        points: 3,
        linkTo: '/appliances',
        icon: 'documents',
      });
    }
  }

  // Tasks
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  if (overdue > 0) {
    recs.push({
      id: 'clear-overdue',
      title: `Complete ${overdue} overdue task${overdue === 1 ? '' : 's'}`,
      body: 'Overdue tasks cost the most points.',
      points: Math.min(overdue * 3, 12),
      linkTo: '/',
      icon: 'alert',
    });
  }

  // Sort by points descending, cap at 4
  return recs.sort((a, b) => b.points - a.points).slice(0, 4);
}

/* ----------------------------------------------------------------
 * Main report
 * -------------------------------------------------------------- */

export function computeHealthReport(
  property: Property | null,
  appliances: Appliance[],
  tasks: Task[]
): HealthReport {
  const maintenance = scoreMaintenance(tasks);
  const warranties = scoreWarranties(appliances);
  const appliancesScore = scoreAppliances(appliances);
  const documentation = scoreDocumentation(property, appliances);

  const total = Math.min(
    100,
    maintenance.score +
      warranties.score +
      appliancesScore.score +
      documentation.score
  );

  const sections: HealthSection[] = [
    {
      key: 'maintenance',
      label: 'Maintenance',
      score: maintenance.score,
      max: maintenance.max,
      icon: 'wrench',
      hint: 'What is done on time',
    },
    {
      key: 'warranties',
      label: 'Warranties',
      score: warranties.score,
      max: warranties.max,
      icon: 'warranty',
      hint: 'Coverage dates recorded',
    },
    {
      key: 'appliances',
      label: 'Appliances',
      score: appliancesScore.score,
      max: appliancesScore.max,
      icon: 'appliance',
      hint: 'Makes, models, and notes on file',
    },
    {
      key: 'documentation',
      label: 'Documentation',
      score: documentation.score,
      max: documentation.max,
      icon: 'documents',
      hint: 'Serial numbers and purchase dates',
    },
  ];

  const { category, label, blurb } = categorize(total);

  const recommendations = buildRecommendations(
    property,
    appliances,
    tasks,
    {
      maintenance: maintenance.score,
      warranties: warranties.score,
      appliances: appliancesScore.score,
      documentation: documentation.score,
    }
  );

  return {
    total,
    category,
    categoryLabel: label,
    categoryBlurb: blurb,
    sections,
    recommendations,
  };
}