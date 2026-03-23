function firstToken(query: string): string {
  return query.split(' ')[0] ?? '';
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  const shortest = Math.min(a.length, b.length);
  while (i < shortest && a[i] === b[i]) i++;
  return i;
}

function isMinorTokenChange(a: string, b: string): boolean {
  const maxDiff = Math.ceil(Math.max(a.length, b.length) / 3);
  const shortest = Math.min(a.length, b.length);

  // difference in length + difference in overlapping characters
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < shortest; i++) if (a[i] !== b[i]) diff++;

  return diff <= maxDiff;
}

export function shouldResetFilters(oldQuery: string, newQuery: string): boolean {
  oldQuery = oldQuery.toLowerCase().trim();
  newQuery = newQuery.toLowerCase().trim();

  if (!newQuery) return false; // no search takes place
  if (!oldQuery) return true; // change from no query -> some query

  const oldFirstToken = firstToken(oldQuery);
  const newFirstToken = firstToken(newQuery);

  // If first token changed significantly, reset filters
  if (!isMinorTokenChange(oldFirstToken, newFirstToken)) return true;

  // Use prefix similarity relative to the shorter query for better handling of expansions
  const minLen = Math.min(oldQuery.length, newQuery.length);
  const maxLen = Math.max(oldQuery.length, newQuery.length);
  const prefixLen = commonPrefixLength(oldQuery, newQuery);

  // If the common prefix covers most of the shorter query, don't reset
  // This handles cases like "ics" -> "ics 33" well
  if (prefixLen / minLen >= 0.6) return false;

  // Otherwise, check against the longer query
  return prefixLen / maxLen < 0.6;
}
