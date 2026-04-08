export type BuildTier = 'enterprise' | 'principal' | 'studio';

export interface TierContent {
  label: string;
  positioning: string;
  focuses: string[];
  startingPoints: string[];
  changesAfter: string[];
  fitCriteria: string[];
  transitionLine: string;
  dynamicQuestion: string;
}

export const TIER_CONTENT: Record<BuildTier, TierContent> = {
  enterprise: {
    label: 'Enterprise',
    positioning:
      'Designed for complex organizations operating across multiple teams, systems, and layers of decision-making.',
    focuses: [
      'Cross-team pipeline architecture across departments and stakeholders',
      'Data infrastructure + reporting layers',
      'Deal flow, capital, or program orchestration',
      'Integration with existing systems',
      'Alignment across leadership and operations',
    ],
    startingPoints: [
      'Disconnected systems across departments',
      'Heavy manual coordination',
      'Limited visibility into pipeline and performance',
      'Existing tools not communicating',
      'Scaling complexity without infrastructure',
    ],
    changesAfter: [
      'Unified infrastructure across teams',
      'Clear visibility into pipeline and performance',
      'Automated coordination across systems',
      'Reduced operational friction',
      'Infrastructure supporting internal and external stakeholders',
    ],
    fitCriteria: [
      'Multiple teams interact with pipeline',
      'Internal + external stakeholders involved',
      'Managing complexity & growth',
      'Systems exist but are not aligned',
    ],
    transitionLine:
      'This is typically where infrastructure becomes the constraint rather than the opportunity.',
    dynamicQuestion:
      'Where are systems, teams, or stakeholders currently misaligned or creating friction?',
  },
  principal: {
    label: 'Principal',
    positioning:
      'Built for operators scaling toward $10M\u2013$50M who need structured, repeatable systems.',
    focuses: [
      'Pipeline generation systems',
      'CRM structure and hygiene',
      'Sales process standardization',
      'Lead qualification and routing',
      'Decision-grade reporting',
    ],
    startingPoints: [
      'Inconsistent lead flow',
      'Underutilized CRM',
      'Inconsistent sales process',
      'Lack of conversion clarity',
      'Manual growth maintenance',
    ],
    changesAfter: [
      'Predictable pipeline generation',
      'Clean CRM aligned to workflows',
      'Standardized sales process',
      'Clear performance visibility',
      'Reduced founder dependence',
    ],
    fitCriteria: [
      'Revenue exists but growth is inconsistent',
      'Founder-led sales still dominant',
      'Systems not driving outcomes',
      'Need structure before scaling',
    ],
    transitionLine:
      'This is typically where growth begins to depend on structure rather than effort.',
    dynamicQuestion:
      'What parts of your pipeline, CRM, or sales process are currently inconsistent or manual?',
  },
  studio: {
    label: 'Studio',
    positioning:
      'For early-stage teams building their first integrated system for consistent pipeline and growth.',
    focuses: [
      'Foundational pipeline setup',
      'Lightweight CRM structure',
      'Lead tracking and qualification',
      'Simple automation',
      'Outreach and follow-up systems',
    ],
    startingPoints: [
      'No centralized system',
      'Tracking across spreadsheets/tools',
      'Inconsistent follow-up',
      'Missed opportunities',
      'Burst-based growth',
    ],
    changesAfter: [
      'Clear pipeline from lead to close',
      'Organized opportunity tracking',
      'Consistent follow-up',
      'Immediate time savings',
      'Scalable foundation',
    ],
    fitCriteria: [
      'No formal pipeline or CRM',
      'Leads managed manually',
      'Need clarity before scaling',
      'Want scalable foundation',
    ],
    transitionLine:
      'This is typically where clarity replaces guesswork in how pipeline is built.',
    dynamicQuestion:
      'Where are you currently losing track of leads, follow-up, or opportunities?',
  },
};
