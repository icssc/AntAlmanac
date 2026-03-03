import { asc, eq, SQL, sql, or, and, inArray } from 'drizzle-orm';
import { db, TransactionType } from '../db';
import { planner, plannerQuarter, plannerYear, plannerCourse, user } from '../db/schema';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { quarters, SavedPlannerData } from '@peterportal/types';
import {
  PlannerDeletion,
  PlannerQuarterDeletion,
  PlannerQuarterSaveInfo,
  PlannerSaveInfo,
  PlannerYearDeletion,
  PlannerYearSaveInfo,
} from '@peterportal/types';

export async function queryGetPlanners(where: SQL) {
  const planYearTableName = getTableConfig(plannerYear).name;
  const planners = await db
    .select({
      id: planner.id,
      name: planner.name,
      chc: planner.chc,
      content: sql.raw(`jsonb_agg(jsonb_build_object(
        'name', ${planYearTableName}."${plannerYear.name.name}",
        'startYear', ${planYearTableName}."${plannerYear.startYear.name}",
        'quarters', (SELECT jsonb_agg(jsonb_build_object(
          'name', ${plannerQuarter.quarterName.name},
          'courses', (
            SELECT COALESCE(jsonb_agg(pc.course_id ORDER BY pc.index ASC), '[]'::jsonb)
            FROM planner_course pc
            WHERE pc.planner_id = pq.planner_id
              AND pc.start_year = pq.start_year
              AND pc.quarter_name = pq.quarter_name
          )
        )) AS quarters FROM planner_quarter pq
          WHERE pq.planner_id = ${planYearTableName}."${plannerYear.plannerId.name}"
            AND pq.start_year = ${planYearTableName}."${plannerYear.startYear.name}"
        )
      ) ORDER BY ${planYearTableName}."${plannerYear.startYear.name}" ASC)`),
    })
    .from(planner)
    .innerJoin(plannerYear, eq(planner.id, plannerYear.plannerId))
    .innerJoin(user, eq(planner.userId, user.id))
    .where(where)
    .groupBy(planner.id, planner.name)
    .orderBy(asc(planner.id));

  (planners as SavedPlannerData[]).forEach((planner) =>
    planner.content.forEach((year) => {
      year.quarters.sort((a, b) => quarters.indexOf(a.name) - quarters.indexOf(b.name));
    }),
  );

  return planners;
}

export async function deletePlanners(tx: TransactionType, planners: PlannerDeletion[]) {
  if (!planners.length) return;
  await tx.delete(planner).where(
    inArray(
      planner.id,
      planners.map((p) => p.id),
    ),
  );
}

export async function deletePlannerYears(tx: TransactionType, years: PlannerYearDeletion[]) {
  if (!years.length) return;
  const conditions = years.map((year) =>
    and(eq(plannerYear.plannerId, year.plannerId), eq(plannerYear.startYear, year.id)),
  );
  await tx.delete(plannerYear).where(or(...conditions));
}

export async function deletePlannerQuarters(tx: TransactionType, quarters: PlannerQuarterDeletion[]) {
  if (!quarters.length) return;
  const conditions = quarters.map((quarter) =>
    and(
      eq(plannerQuarter.plannerId, quarter.plannerId),
      eq(plannerQuarter.startYear, quarter.startYear),
      eq(plannerQuarter.quarterName, quarter.id),
    ),
  );
  await tx.delete(plannerQuarter).where(or(...conditions));
}

export async function setQuarterCourses(tx: TransactionType, quarters: PlannerQuarterSaveInfo[], skipDelete = false) {
  // Because name is the identifier, a rename shows up as deleted & recreated quarters
  // in the diff as opposed to an update
  const updates = quarters.map(async (quarter) => {
    const {
      plannerId,
      startYear,
      data: { name: quarterName },
    } = quarter;

    // Delete old courses associated with the quarter
    const matchesQuarter = and(
      eq(plannerCourse.plannerId, plannerId),
      eq(plannerCourse.startYear, startYear),
      eq(plannerCourse.quarterName, quarterName),
    );
    if (!skipDelete) await tx.delete(plannerCourse).where(matchesQuarter);

    if (quarter.data.courses.length === 0) return;

    const rows = quarter.data.courses.map((courseId, index) => ({
      plannerId,
      startYear,
      quarterName,
      courseId,
      index,
    }));
    await tx.insert(plannerCourse).values(rows).onConflictDoNothing();
  });
  await Promise.all(updates);
}

export async function updateYears(tx: TransactionType, years: PlannerYearSaveInfo[]) {
  const updates = years.map(async (year) => {
    await tx
      .update(plannerYear)
      .set({ name: year.data.name })
      .where(and(eq(plannerYear.plannerId, year.plannerId), eq(plannerYear.startYear, year.data.startYear)));
  });
  await Promise.all(updates);
}

export async function updatePlanners(tx: TransactionType, planners: PlannerSaveInfo[]) {
  const updates = planners.map(async ({ data }) => {
    await tx.update(planner).set({ name: data.name }).where(eq(planner.id, data.id));
  });
  // db.$with('test').as(tx.select().from(planner)).
  await Promise.all(updates);
}

export async function createPlanners(
  tx: TransactionType,
  planners: PlannerSaveInfo[],
  userId: number,
): Promise<Record<number, number>> {
  if (!planners.length) return {};

  // insert values one-by-one so we can guarantee the returned IDs match with their
  // corresponding planners. While observations detail that RETURNING should return
  // results in the same order, there is no explicit guarantee of this in any docs.
  const insertionIds = planners.map(async (plan) => {
    const result = await tx.insert(planner).values({ userId, name: plan.data.name }).returning({ id: planner.id });
    return { [plan.data.id]: result[0].id };
  });

  const lookups = await Promise.all(insertionIds);
  // Convert ID lookups from [{ old1: new1 }, { old2: new2 }] into one dict { old1: new1, old2: new2 }
  return lookups.reduce((dict, curr) => Object.assign(dict, curr), {});
}

export async function createYears(tx: TransactionType, years: PlannerYearSaveInfo[]) {
  if (!years.length) return;
  await tx
    .insert(plannerYear)
    .values(
      years.map((year) => ({
        plannerId: year.plannerId,
        startYear: year.data.startYear,
        name: year.data.name,
      })),
    )
    .onConflictDoNothing();
}

export async function createQuarters(tx: TransactionType, quarters: PlannerQuarterSaveInfo[]) {
  if (!quarters.length) return;
  await tx
    .insert(plannerQuarter)
    .values(
      quarters.map((quarter) => ({
        plannerId: quarter.plannerId,
        startYear: quarter.startYear,
        quarterName: quarter.data.name,
      })),
    )
    .onConflictDoNothing();
  await setQuarterCourses(tx, quarters, true);
}
