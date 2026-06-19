import dotenv from 'dotenv-flow';
import { asc, eq, and } from 'drizzle-orm';
import { planner } from '../src/db/schema';
import { db } from '../src/db';

// `npx tsx ./scripts/duplicatePlannerNames.ts`

dotenv.config();

type Planner = typeof planner.$inferSelect;

async function getExistingPlannerNames(userId: number) {
  const planners = await db.select().from(planner).where(eq(planner.userId, userId));

  return new Set(planners.map((planner) => planner.name));
}

function getAvailablePlannerName(baseName: string, existingNames: Set<string>) {
  let suffix = 2;
  let candidate = `${baseName} (${suffix})`;

  while (existingNames.has(candidate)) {
    suffix += 1;
    candidate = `${baseName} (${suffix})`;
  }

  existingNames.add(candidate);

  return candidate;
}

async function cleanupDuplicatePlannerNames() {
  const allPlanners = await db.select().from(planner).orderBy(asc(planner.userId), asc(planner.name), asc(planner.id));

  const plannersByUserAndName = allPlanners.reduce<Record<string, Planner[]>>((groups, plannerRow) => {
    const key = `${plannerRow.userId}::${plannerRow.name}`;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(plannerRow);

    return groups;
  }, {});

  const duplicateGroups = Object.values(plannersByUserAndName).filter((group) => group.length > 1);

  console.log(`Found ${duplicateGroups.length} duplicate planner name groups`);

  await db.transaction(async (tx) => {
    const userNameCache = new Map<number, Set<string>>();

    for (const group of duplicateGroups) {
      const [plannerToKeep, ...plannersToRename] = group;

      if (!userNameCache.has(plannerToKeep.userId)) {
        const existingNames = await getExistingPlannerNames(plannerToKeep.userId);
        userNameCache.set(plannerToKeep.userId, existingNames);
      }

      const existingNames = userNameCache.get(plannerToKeep.userId)!;

      for (const plannerToRename of plannersToRename) {
        const newName = getAvailablePlannerName(plannerToRename.name, existingNames);

        await tx
          .update(planner)
          .set({ name: newName })
          .where(and(eq(planner.id, plannerToRename.id), eq(planner.userId, plannerToRename.userId)));

        console.log(`Renamed planner ${plannerToRename.id} to "${newName}"`);
      }
    }
  });

  console.log('Done');

  process.exit();
}

cleanupDuplicatePlannerNames();
