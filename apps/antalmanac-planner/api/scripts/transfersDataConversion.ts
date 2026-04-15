import { db } from '.././src/db';
import { transferredMisc, transferredApExam, transferredCourse } from '.././src/db/schema';
import { ANTEATER_API_REQUEST_HEADERS } from '.././src/helpers/headers';
import dotenv from 'dotenv-flow';
import { count, and, eq, or, SQL, sql } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/pg-core';
import { CourseAAPIResponse } from '../../types/src/course';
import * as fs from 'fs';
// load env (because this is a separate script)
dotenv.config();

// Script for organizing items from the transferredMisc table
// into transferredApExam, transferredGe, and transferredCourse
// (transfer items that could not be converted remain in transferredMisc)

// NOTE: you can use `npx tsx ./api/scripts/transfersDataConversion.ts` to run

const AP_CALC_AB_SUBSCORE = 'AP Calculus BC, Calculus AB subscore';
const AP_CALC_AB = 'AP Calculus AB';

type ApExamBasicInfo = {
  fullName: string; // E.g. "AP Microeconomics"
  catalogueName: string | undefined; // E.g. "AP ECONOMICS:MICRO"
};

type TransferredMiscRow = {
  userId: number | null;
  courseName: string | null;
  units: number | null;
};

type TransferredMiscSelectedRow = {
  userId: number;
  courseName: string;
  totalUnits: number;
  count: number;
};

type TransferredApExamRow = {
  userId: number;
  examName: string;
  score: number | null;
  units: number;
};

type TransferredCourseRow = {
  userId: number;
  courseName: string;
  units: number;
};

/** Get all AP exams */
const getAPIApExams = async (): Promise<ApExamBasicInfo[]> => {
  const response = await fetch(`${process.env.PUBLIC_API_URL}apExams`, {
    headers: ANTEATER_API_REQUEST_HEADERS,
  })
    .then((res) => res.json())
    .then((res) => res.data as ApExamBasicInfo[]);
  return response;
};

/** Get courses based on their IDs, or undefined if there was an error, in a batch */
const getAPICoursesByIdBatch = async (courseIds: string[]): Promise<CourseAAPIResponse[] | undefined> => {
  // toString() converts the array into comma-separated values, as expected by the API
  const apiUrl = `${process.env.PUBLIC_API_URL}courses/batch?ids=${encodeURIComponent(courseIds.toString())}`;

  const response = await fetch(apiUrl, {
    headers: ANTEATER_API_REQUEST_HEADERS,
  })
    .then((res) => res.json())
    .then((res) => (res.ok ? (res.data as CourseAAPIResponse[]) : undefined));
  return response;
};

/**
  Efficiently validate a large amount of courses from the API
  Returns a set of all the valid course IDs
*/
const validateCoursesAPI = async (coursesToValidate: Set<string>): Promise<Record<string, string>> => {
  const batchSize = 10;
  const coursesToValidateArr = Array.from(coursesToValidate);
  const validCourses = {};
  for (let i = 0; i < coursesToValidateArr.length; i += batchSize) {
    console.log(`- Validating ${i}..${i + batchSize}`);
    const resp = await getAPICoursesByIdBatch(coursesToValidateArr.slice(i, i + batchSize));
    if (!resp) {
      console.log('x ERROR: API response not ok');
      continue;
    }
    for (const r of resp) {
      validCourses[r.id] = r.department + ' ' + r.courseNumber;
    }
  }
  return validCourses;
};

/** Normalize a transfer name by converting it to lowercase
  then removing punctuation and trailing/leading whitespace;
  if undefined, return an empty string
  "&" will become "and" */
const normalizeTransferName = (transferName: string | undefined) => {
  if (!transferName) return '';
  return transferName
    .toLowerCase()
    .replace(/[.,/#!$%^*;:{}=\-_`~()]/g, '')
    .replace(/&/g, 'and')
    .trim();
};

/**
  Substitute words from a normalized transfer name to look closer to an AP exam
  Note: order of the substitutions array DOES matter
*/
const apSubstitutions = (normalizedName: string, substitutions: { from: string; to: string }[]) => {
  let res = normalizedName;
  for (const sub of substitutions) {
    const re = new RegExp(String.raw`(^|\s+)(${sub.from})(\s+|$)`);
    res = res.replace(re, `$1${sub.to}$3`);
  }
  return res;
};

/**
  Check whether a specific AP is a match for a transfer name, returning how good the match is
  0: not a match
  1: a partial match/starts with (with substitutions)
  2: an exact match (with substitutions)
  3: a partial match/starts with (no substitutions)
  4: an exact match (no substitutions)
*/
const apMatchQuality = (normalizedName: string, substitutedName: string, ap: ApExamBasicInfo): number => {
  const normalizedApFull = normalizeTransferName(ap.fullName);
  const normalizedApCat = normalizeTransferName(ap.catalogueName);
  if (normalizedApFull == normalizedName) return 4;
  if (normalizedApCat == normalizedName) return 4;
  if (normalizedApFull == substitutedName) return 3;
  if (normalizedApCat == substitutedName) return 3;
  if (normalizedApFull.startsWith(normalizedName)) return 2;
  if (normalizedApCat.startsWith(normalizedName)) return 2;
  if (normalizedApFull.startsWith(substitutedName)) return 1;
  if (normalizedApCat.startsWith(substitutedName)) return 1;
  return 0;
};

/** Try to find the best match for a transfer name out of all the AP exams; undefined if no match */
const tryMatchAp = (transferName: string, allAps: ApExamBasicInfo[]): ApExamBasicInfo | undefined => {
  const normalizedName = normalizeTransferName(transferName);
  // Some hardcoded exceptions (specifically for matching the full name rather than cat name, order matters)
  const substitutedName = apSubstitutions(normalizedName, [
    // Hardcoded exceptions for specific rows
    { from: 'ap economics ma', to: 'ap macroeconomics' },
    { from: 'ap world modern', to: 'ap world history modern' },
    { from: 'ap chinese lang cult', to: 'ap chinese language and culture' },
    { from: 'ap govt and polc', to: 'ap united states government and politics' },
    { from: 'ap govt and polu', to: 'ap united states government and politics' },
    { from: 'ap modern world history', to: 'ap world history modern' },
    { from: 'ap micro econ', to: 'ap microeconomics' },
    { from: 'ap art studio 3', to: 'ap 3d art and design' },
    { from: 'ap artstudio 2', to: 'ap 2d art and design' },
    // Turn abbreviations into larger ones
    { from: 'us', to: 'united states' },
    { from: 'lang', to: 'language' },
    { from: 'lng', to: 'language' },
    { from: 'lit', to: 'literature' },
    { from: 'hist', to: 'history' },
    { from: 'gov', to: 'government' },
    { from: 'govt', to: 'government' },
    { from: 'stats', to: 'statistics' },
    { from: 'calc', to: 'calculus' },
    { from: 'comp sci', to: 'computer science' },
    { from: 'sci', to: 'science' },
    { from: 'eng', to: 'english' },
    { from: 'spa', to: 'spanish' },
    // Add missing words
    { from: 'ap literature', to: 'ap english literature' },
    { from: 'ap language', to: 'ap english language' },
    { from: 'ap government', to: 'ap united states government' },
  ]);
  let bestMatch: ApExamBasicInfo | undefined = undefined;
  let bestMatchQuality = 0;
  for (const ap of allAps) {
    const matchQuality = apMatchQuality(normalizedName, substitutedName, ap);
    if (matchQuality > bestMatchQuality) {
      bestMatch = ap;
      bestMatchQuality = matchQuality;
    }
  }
  return bestMatch;
};

const removeAllSpaces = (transferName: string) => {
  return transferName.replace(/\s/g, '');
};

/** Try to match a transfer name with an existing validated UCI course; undefined if no match */
const tryMatchCourse = (transferName: string, validCourses: Record<string, string>): string | undefined => {
  return validCourses[removeAllSpaces(transferName)];
};

/** Handle some special cases for AP Calc AB, which could have a subscore,
  returning whether it's okay to proceed to add "AP Calculus AB" */
const handleApCalcAB = (
  transfer: TransferredMiscSelectedRow,
  transferName: string,
  toInsertAp: TransferredApExamRow[],
  usersWithABSubscore: Set<number>,
): boolean => {
  if (usersWithABSubscore.has(transfer.userId)) {
    // Okay to proceed normally because we know the user has an explicit AB subscore
    return true;
  } else if (transfer.count == 1) {
    // Not okay because we don't know whether this is AB or the subscore
    console.log(
      `x FAILED:  x${transfer.count}    '${transferName}'      has ambiguity: AP Calculus AB vs the BC Subscore`,
    );
    return false;
  } else {
    // The user has AP Calculus AB 2+ times and no AB subscore,
    // so we assume one of them is the BC subscore and the other isn't
    // Insert the BC subscore here, then proceed normally so that AB is also inserted
    console.log(`+ MATCHED:       '${transferName}' with the AP Calc AB Subscore on the BC test AS WELL AS:`);
    toInsertAp.push({
      userId: transfer.userId,
      examName: AP_CALC_AB_SUBSCORE,
      score: null,
      units: 0, // The units will be counted for the actual AB later, and the subscore will remain 0 units
    });
    return true;
  }
};

/** Handle organizing an AP exam, returning whether it was successfully categorized */
const organizeApExam = (
  transfer: TransferredMiscSelectedRow,
  transferName: string,
  toDelete: (SQL<unknown> | undefined)[],
  toInsertAp: TransferredApExamRow[],
  usersWithABSubscore: Set<number>,
  allAps: ApExamBasicInfo[],
): boolean => {
  const bestMatch = tryMatchAp(transferName, allAps);
  if (!bestMatch) {
    // Could not match; leave it here
    console.log(`x FAILED:  x${transfer.count}    '${transferName}'      could not be matched with any AP`);
    return false;
  }

  // Handle special case for subscore
  if (bestMatch.fullName == AP_CALC_AB) {
    const proceedToAdd = handleApCalcAB(transfer, transferName, toInsertAp, usersWithABSubscore);
    if (!proceedToAdd) return false;
  }

  // Move this transfer item to the APs table with the name of the best match
  toDelete.push(and(eq(transferredMisc.userId, transfer.userId), eq(transferredMisc.courseName, transfer.courseName)));
  toInsertAp.push({
    userId: transfer.userId,
    examName: bestMatch.fullName,
    score: null,
    units: transfer.totalUnits,
  });
  console.log(
    `  MATCHED: x${transfer.count}    '${transferName}' with: '${bestMatch.fullName}' ('${bestMatch.catalogueName}')`,
  );
  return true;
};

/** Handle organizing a course, returning whether it was successfully categorized */
const organizeCourse = async (
  transfer: TransferredMiscSelectedRow,
  transferName: string,
  toDelete: (SQL<unknown> | undefined)[],
  toInsertCourse: TransferredCourseRow[],
  validCourses: Record<string, string>,
): Promise<boolean> => {
  const bestMatch = tryMatchCourse(transferName, validCourses);
  if (!bestMatch) {
    // Could not match; leave it here
    console.log(`x FAILED:  x${transfer.count}    '${transferName}'      could not be matched with any course`);
    return false;
  }

  // Move this transfer item to the transferred courses table with the name of the best match
  toDelete.push(and(eq(transferredMisc.userId, transfer.userId), eq(transferredMisc.courseName, transfer.courseName)));
  toInsertCourse.push({
    userId: transfer.userId,
    courseName: bestMatch,
    units: transfer.totalUnits,
  });
  console.log(`  MATCHED: x${transfer.count}    '${transferName}' with: '${bestMatch}'`);
  return true;
};

/** Handle organizing a misc transfer, only to deal with duplicate rows */
const organizeMisc = (
  transfer: TransferredMiscSelectedRow,
  transferName: string,
  toDelete: (SQL<unknown> | undefined)[],
  toReinsertMisc: TransferredMiscRow[],
) => {
  if (transfer.count == 1) {
    // It's fine as it is, this is not a duplicate
    return;
  }

  // Delete this then re-add only one copy
  toDelete.push(and(eq(transferredMisc.userId, transfer.userId), eq(transferredMisc.courseName, transfer.courseName)));
  toReinsertMisc.push({
    userId: transfer.userId,
    courseName: transfer.courseName,
    units: transfer.totalUnits,
  });
  console.log(`- COMBINED:      '${transferName}' (above): duplicates will be combined into one entry`);
};

/**
  Merge APs that are duplicated for individual users before inserting into the db
  Produced by different original transfers that have been resolved into the same result
*/
const mergeDuplicateApResults = (toInsertAp: TransferredApExamRow[]) => {
  const uniqueToInsertAp = new Map<string, { score: number | null; units: number }>();
  for (const ap of toInsertAp) {
    const key = JSON.stringify({ userId: ap.userId, examName: ap.examName });
    if (uniqueToInsertAp.has(key)) {
      uniqueToInsertAp.set(key, {
        score: uniqueToInsertAp.get(key)!.score,
        units: uniqueToInsertAp.get(key)!.units + ap.units,
      });
    } else {
      uniqueToInsertAp.set(key, { score: ap.score, units: ap.units });
    }
  }
  const mergedToInsertAp: TransferredApExamRow[] = [];
  uniqueToInsertAp.forEach((val, key) => {
    mergedToInsertAp.push({
      userId: JSON.parse(key).userId,
      examName: JSON.parse(key).examName,
      score: val.score,
      units: val.units,
    });
  });
  return mergedToInsertAp;
};

/**
  Merge courses that are duplicated for individual users before inserting into the db
  Produced by different original transfers that have been resolved into the same result
  E.g. if a user has "MATH 2A" and "MATH2A " -> there will be two instances of "MATH 2A"
*/
const mergeDuplicateCourseResults = (toInsertCourse: TransferredCourseRow[]) => {
  const uniqueToInsertCourse = new Map<string, { units: number }>();
  for (const course of toInsertCourse) {
    const key = JSON.stringify({ userId: course.userId, courseName: course.courseName });
    if (uniqueToInsertCourse.has(key)) {
      uniqueToInsertCourse.set(key, {
        units: uniqueToInsertCourse.get(key)!.units + course.units,
      });
    } else {
      uniqueToInsertCourse.set(key, { units: course.units });
    }
  }
  const mergedToInsertCourse: TransferredCourseRow[] = [];
  uniqueToInsertCourse.forEach((val, key) => {
    mergedToInsertCourse.push({
      userId: JSON.parse(key).userId,
      courseName: JSON.parse(key).courseName,
      units: val.units,
    });
  });
  return mergedToInsertCourse;
};

/** Organize the data in the database */
const organize = async () => {
  const allAps = await getAPIApExams();
  console.log('DEBUG: ALL APS: ');
  for (const ap of allAps) {
    console.log(`  - '${ap.fullName}' (cat: '${ap.catalogueName}')`);
  }
  // Obtain all relevant transfers (invalid ones that cannot be categorized are filtered out here)
  const transfers: TransferredMiscSelectedRow[] = (
    await db
      .select({
        userId: transferredMisc.userId,
        courseName: transferredMisc.courseName,
        totalUnits: sql<number>`coalesce(sum(${transferredMisc.units}), 0)`.mapWith(Number),
        count: count(transferredMisc.userId),
      })
      .from(transferredMisc)
      .groupBy(transferredMisc.userId, transferredMisc.courseName)
  )
    //.limit(40) // For testing, only look at a few entries
    .filter(
      (transfer) => transfer.courseName != null && transfer.userId != null && transfer.count != 0,
    ) as TransferredMiscSelectedRow[];

  // Get all the users who explicitly have an AB subscore
  const usersWithABSubscore = new Set<number>();
  for (const transfer of transfers) {
    const bestMatch = tryMatchAp(transfer.courseName, allAps);
    if (bestMatch && bestMatch.fullName == AP_CALC_AB_SUBSCORE) {
      usersWithABSubscore.add(transfer.userId);
    }
  }

  // Validate all the relevant courses from the API beforehand
  const coursesToValidate = new Set<string>();
  for (const transfer of transfers) {
    const transferName = transfer.courseName.trim();
    if (transferName.startsWith('AP ')) {
      continue;
    }
    coursesToValidate.add(removeAllSpaces(transferName));
  }
  console.log('Validating courses from the API (batch)');
  const validCourses = await validateCoursesAPI(coursesToValidate);
  console.log(`Out of ${coursesToValidate.size} unique courses to validate, ${validCourses.size} are valid`);

  // Build several large queries
  const toDelete: (SQL<unknown> | undefined)[] = [sql`FALSE`]; // Start with false to ensure nothing is deleted by default
  const toInsertAp: TransferredApExamRow[] = [];
  const toInsertCourse: TransferredCourseRow[] = [];
  const toReinsertMisc: TransferredMiscRow[] = [];
  for (const transfer of transfers) {
    const transferName = transfer.courseName.trim();
    if (transferName.startsWith('AP ')) {
      const reorganized = organizeApExam(
        transfer as TransferredMiscSelectedRow,
        transferName,
        toDelete,
        toInsertAp,
        usersWithABSubscore,
        allAps,
      );
      if (!reorganized) {
        organizeMisc(transfer as TransferredMiscSelectedRow, transferName, toDelete, toReinsertMisc);
      }
    } else {
      const reorganized = await organizeCourse(
        transfer as TransferredMiscSelectedRow,
        transferName,
        toDelete,
        toInsertCourse,
        validCourses,
      );
      if (!reorganized) {
        organizeMisc(transfer as TransferredMiscSelectedRow, transferName, toDelete, toReinsertMisc);
      }
    }
  }

  // Merge any duplicates among the AP and course queries to ensure no conflicts in the new data
  const mergedToInsertAp = mergeDuplicateApResults(toInsertAp);
  const mergedToInsertCourse = mergeDuplicateCourseResults(toInsertCourse);

  // Delete and insert everything using the large queries

  // First, logging/debugging
  const qb = new QueryBuilder();
  const delQuery = qb
    .select()
    .from(transferredMisc)
    .where(or(...toDelete))
    .toSQL();

  // Dump into log files (in case there is a lot of data)
  console.log('Dumping the query inputs into log files...');
  console.log('- Delete query');
  fs.writeFileSync('transfersDataConversion_DeleteQuery.log', delQuery.sql);
  console.log('- Delete parameters');
  fs.writeFileSync('transfersDataConversion_DeleteParameters.log', JSON.stringify(delQuery.params, null, 4));
  console.log('- To insert into transferred AP exam table');
  fs.writeFileSync('transfersDataConversion_InsertApExam.log', JSON.stringify(mergedToInsertAp, null, 4));
  console.log('- To insert into transferred course table');
  fs.writeFileSync('transfersDataConversion_InsertCourse.log', JSON.stringify(mergedToInsertCourse, null, 4));
  console.log('- To reinsert into transferred misc table');
  fs.writeFileSync('transfersDataConversion_ReinsertMisc.log', JSON.stringify(toReinsertMisc, null, 4));
  console.log('Finished logging');

  // Debug print (comment out if dealing with a lot of data, use the log files instead)
  /*console.log('Would execute: ' + delQuery.sql + ',\n params: ' + delQuery.params);
  console.log();
  console.log('Would insert into transferredApExam: ' + JSON.stringify(mergedToInsertAp, null, 4));
  console.log('Would insert into transferredCourse: ' + JSON.stringify(mergedToInsertCourse, null, 4));
  console.log('Would delete from transferredMisc as specified above');
  console.log('Would insert into transferredMisc: ' + JSON.stringify(toReinsertMisc, null, 4));*/

  // Finally, execute the actual queries (uncomment when ready to perform the changes)
  // ORDER MATTERS for transferredMisc

  console.log(transferredCourse && 'loaded');
  console.log(transferredApExam && 'loaded');
  console.log(transferredMisc && 'loaded');

  console.log('Starting transaction...');
  await db.transaction(async (tx) => {
    if (mergedToInsertAp.length) {
      await tx
        .insert(transferredApExam)
        .values(mergedToInsertAp)
        .onConflictDoUpdate({
          target: [transferredApExam.userId, transferredApExam.examName],
          set: { units: sql`EXCLUDED.units + ${transferredApExam.units}` },
        });
    }
    if (mergedToInsertCourse.length) {
      await tx
        .insert(transferredCourse)
        .values(mergedToInsertCourse)
        .onConflictDoUpdate({
          target: [transferredCourse.userId, transferredCourse.courseName],
          set: { units: sql`EXCLUDED.units + ${transferredCourse.units}` },
        });
    }
    await tx.delete(transferredMisc).where(or(...toDelete));
    if (toReinsertMisc.length) await tx.insert(transferredMisc).values(toReinsertMisc);
  });
  console.log('Finished transaction');
};

organize();
