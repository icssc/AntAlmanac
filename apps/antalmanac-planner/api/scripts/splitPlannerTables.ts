/**
 * This migration script is to be run with the planner-v4 branch (the branch that converts a single planners
 * table into a series of "flattened" tables). The migration script will take the "content" of existing items
 * in the "planner" table and create rows in the new tables that map back to the same data.
 */

import dotenv from 'dotenv-flow';
import { planner, plannerCourse, plannerQuarter, plannerYear } from '../src/db/schema';
import { db } from '../src/db';

dotenv.config();

interface LegacyDBPlannerQuarter {
  name: string;
  courses?: string[];
}

interface LegacyDBPlannerYear {
  name: string;
  startYear: number;
  quarters?: LegacyDBPlannerQuarter[];
}

async function splitTableData() {
  const allPlanners = await db.select().from(planner);

  // list of years to add, grouped by planner
  const plannersYearsToAdd = allPlanners.map((planner) => {
    return (planner.years as LegacyDBPlannerYear[]).map((year) => ({
      plannerId: planner.id,
      startYear: year.startYear,
      name: year.name,
      /* This will be ignored by drizzle upon add, but we have it here so that it's easier
       * to generate the quarter rows from */
      quarters: year.quarters,
    }));
  });

  // list of quarters to add, grouped by planner
  const quartersToAdd = plannersYearsToAdd.map((yearsPerPlanner) => {
    return yearsPerPlanner.flatMap((year) => {
      return year.quarters!.map((q) => ({
        plannerId: year.plannerId,
        startYear: year.startYear,
        quarterName: q.name,
        courses: q.courses,
      }));
    });
  });

  // list of courses to add, grouped by planner
  const coursesToAdd = quartersToAdd.map((quartersPerPlanner) => {
    return quartersPerPlanner.flatMap((quarter) => {
      return quarter.courses!.map((courseId, index) => ({
        plannerId: quarter.plannerId,
        startYear: quarter.startYear,
        quarterName: quarter.quarterName,
        index,
        courseId,
      }));
    });
  });

  console.log({ allPlanners, plannersYearsToAdd, quartersToAdd, coursesToAdd });

  await db.transaction(async (tx) => {
    const addYearQueries = plannersYearsToAdd.map(async (yearsPerPlanner) => {
      if (!yearsPerPlanner.length) return null;
      await tx.insert(plannerYear).values(yearsPerPlanner);
      console.log(`Inserted ${yearsPerPlanner.length} years...`);
    });
    await Promise.all(addYearQueries);

    const addQuarterQueries = quartersToAdd.map(async (quartersPerPlanner) => {
      if (!quartersPerPlanner.length) return null;
      await tx.insert(plannerQuarter).values(quartersPerPlanner);
      console.log(`Inserted ${quartersPerPlanner.length} quarters...`);
    });
    await Promise.all(addQuarterQueries);

    const addCourseQueries = coursesToAdd.map(async (coursesPerPlanner) => {
      if (!coursesPerPlanner.length) return null;
      await tx.insert(plannerCourse).values(coursesPerPlanner);
      console.log(`Inserted ${coursesPerPlanner.length} courses...`);
    });
    await Promise.all(addCourseQueries);
  });
  console.log('Done!');

  process.exit();
}

splitTableData();
