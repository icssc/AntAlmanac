import { ProgramRequirement } from '@peterportal/types';

export const labelSubstitutions: Record<string, string> = {
  Div: 'Division',
  "Int'l": 'International',
  US: 'United States',
};

export function formatLabel(label: string): string {
  let expandedLabel = label.replace(/\s\(.*/g, ''); // remove all text after parentheses

  /* expand any abbreviations */
  for (const [abbrev, substitution] of Object.entries(labelSubstitutions)) {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    expandedLabel = expandedLabel.replace(regex, substitution);
  }

  return expandedLabel;
}

export function findCommonLabelPrefix(labels: string[]): string {
  if (labels.length === 0) return '';

  const expandedLabels = labels.map(formatLabel);
  expandedLabels.sort();

  const first = expandedLabels[0].split(' ');
  const last = expandedLabels.at(-1)!.split(' ');

  let i = 0;
  while (i < first.length && first[i] === last[i]) {
    i++;
  }
  return first.slice(0, i).join(' ');
}

export function normalizeTitleLabels(fetchedRequirements: ProgramRequirement[]): void {
  fetchedRequirements.forEach((requirement) => {
    /* if a top level "Select 1 of the following" group of requirements is seen, attempt to replace the label */
    if (requirement.requirementType !== 'Group' || requirement.label !== 'Select 1 of the following') return;

    const nestedLabels = requirement.requirements.map((req) => req.label);
    const commonLabelPrefix = findCommonLabelPrefix(nestedLabels);

    if (commonLabelPrefix) {
      requirement.label = commonLabelPrefix; // if a common label prefix is found, use it as the top level label
    }
  });
}
