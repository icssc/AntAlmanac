/**
 @module Zot4PlanImportRoute
*/

import { z } from 'zod';
import { db } from '../db';
import { publicProcedure, router } from '../helpers/trpc';
import { zot4PlanImports } from '../db/schema';
import { TRPCError } from '@trpc/server';
import {
  SavedRoadmap,
  SavedPlannerData,
  SavedPlannerQuarterData,
  QuarterName,
  TransferredAPExam,
} from '@peterportal/types';
import { tryMatchAp, getAPIApExams } from '../helpers/transferCredits';

type Zot4PlanYears = string[][][];

type Zot4PlanSchedule = {
  years: Zot4PlanYears;
  selectedPrograms: {
    value: number;
    label: string;
    is_major: boolean;
  }[][];
  addedCourses: [];
  courses: [];
  apExam: {
    id: number;
    name: string;
    score: number;
    courses: string[];
    GE: [];
    units: number;
  }[];
};

/**
 * Get a JSON schedule from Zot4Plan by name
 * Throw an error if it does not exist
 */
const getFromZot4Plan = async (scheduleName: string) => {
  let res = {};
  await fetch('https://api.zot4plan.com/api/loadSchedule/' + scheduleName, {
    method: 'PUT',
  })
    .then((response) => {
      if (!response.ok) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Schedule name could not be obtained from Zot4Plan',
        });
      }
      return response.json();
    })
    .then((json) => {
      res = json;
    });
  return res as Zot4PlanSchedule;
};

/**
 * Convert a Zot4Plan course name into a PeterPortal course ID
 */
const convertIntoCourseID = (zot4PlanCourse: string): string => {
  // PeterPortal course IDs are the same as Zot4Plan course IDs except all spaces are removed
  return zot4PlanCourse.replace(/\s/g, '');
};

/**
 * Trim the empty years off the end of a saved roadmap planner
 * (Other than the first year)
 */
const trimEmptyYears = (planner: SavedPlannerData) => {
  // Empty years in the middle aren't trimmed because that makes it hard to add years there
  while (planner.content.length > 1) {
    let yearHasCourses = false;
    for (const quarter of planner.content[planner.content.length - 1].quarters) {
      if (quarter.courses.length != 0) {
        yearHasCourses = true;
      }
    }
    if (!yearHasCourses) {
      // The year does not have courses, so trim it
      planner.content.pop();
    } else {
      // The year does have courses, so we are done
      break;
    }
  }
};

/**
 * Determine a student's start year based on their current year in school
 * (ex. a first-year's current year is "1")
 */
const getStartYear = (studentYear: string): number => {
  let startYear = new Date().getFullYear();
  startYear -= parseInt(studentYear);
  // First-years in Fall start this year, not the previous year
  // Month index 7 is August, when Fall quarter is approaching
  if (new Date().getMonth() >= 7) startYear += 1;
  return startYear;
};

/**
 * Convert the years of a Zot4Plan schedule into the saved roadmap planner format
 */
const convertIntoSavedPlanner = (
  originalScheduleYears: Zot4PlanYears,
  scheduleName: string,
  startYear: number,
  temporaryId: number,
): SavedPlannerData => {
  const converted: SavedPlannerData = {
    id: temporaryId,
    name: scheduleName,
    content: [],
  };

  // Add courses
  for (let i = 0; i < originalScheduleYears.length; i++) {
    const year = originalScheduleYears[i];
    const quartersList: SavedPlannerQuarterData[] = [];
    for (let j = 0; j < year.length; j++) {
      const quarter = year[j];
      const courses: string[] = [];
      for (let k = 0; k < quarter.length; k++) {
        courses.push(convertIntoCourseID(quarter[k]));
      }
      if (j >= 3 && courses.length == 0) {
        // Do not include the summer quarter if it has no courses (it is irrelevant)
        continue;
      }
      quartersList.push({
        name: ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer2', 'Summer10wk'][Math.min(j, 5)] as QuarterName,
        courses: courses,
      });
    }
    converted.content.push({
      startYear: startYear + i,
      name: 'Year ' + (i + 1),
      quarters: quartersList,
    });
  }
  // Trim trailing years
  trimEmptyYears(converted);

  return converted;
};

/**
 * Fetches all AP exams from the Zot4Plan schedule, matching their names to PeterPortal AP Exam names; filter out duplicates
 */
const getApExamsFromZot4Plan = async (originalSchedule: Zot4PlanSchedule): Promise<TransferredAPExam[]> => {
  const allAps = await getAPIApExams();
  const examMap = new Map<string, TransferredAPExam>();

  originalSchedule.apExam.forEach((z4pExam) => {
    const bestMatchedExamName = tryMatchAp(z4pExam.name, allAps)?.fullName ?? z4pExam.name;
    const score = z4pExam.score;
    const units = z4pExam.units;

    examMap.set(bestMatchedExamName, {
      examName: bestMatchedExamName,
      score,
      units,
    });
  });

  return Array.from(examMap.values());
};

/**
 * Convert a Zot4Plan schedule into the saved roadmap format
 */
const convertIntoSavedRoadmap = (
  originalSchedule: Zot4PlanSchedule,
  scheduleName: string,
  startYear: number,
  temporaryId: number,
): SavedRoadmap => {
  // Convert the individual components
  const convertedPlanner = convertIntoSavedPlanner(originalSchedule.years, scheduleName, startYear, temporaryId);
  const res: SavedRoadmap = { planners: [convertedPlanner] };
  return res;
};

const zot4PlanImportRouter = router({
  /**
   * Get a roadmap formatted for PeterPortal based on a Zot4Plan schedule by name
   * and labeled with years based on the current year and the student's year
   */
  getScheduleFormatted: publicProcedure
    .input(z.object({ scheduleName: z.string(), studentYear: z.string(), temporaryId: z.number().max(-1) }))
    .query(async ({ input, ctx }) => {
      const originalScheduleRaw = await getFromZot4Plan(input.scheduleName);
      const savedRoadmap = convertIntoSavedRoadmap(
        originalScheduleRaw,
        input.scheduleName,
        getStartYear(input.studentYear),
        input.temporaryId,
      );
      const apExams = await getApExamsFromZot4Plan(originalScheduleRaw);
      await db.insert(zot4PlanImports).values({ scheduleId: input.scheduleName, userId: ctx.session.userId });
      return { savedRoadmap, apExams };
    }),
});

export default zot4PlanImportRouter;
