import { z } from 'zod';
import {
  extendedTransferData,
  zodTransferredCourse,
  zodTransferredGE,
  TransferredGE,
  zodTransferredAPExam,
  TransferredAPExam,
  zodTransferredUncategorized,
  zodSelectedApReward,
} from '@peterportal/types';
import { publicProcedure, router, userProcedure } from '../helpers/trpc';
import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';
import { db } from '../db';
import { selectedApReward, transferredApExam, transferredGe } from '../db/schema';
import { APExam } from '@peterportal/types';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { transferredCourse } from '../db/schema';
import { transferredMisc } from '../db/schema';
import { organizeLegacyTransfers } from '../helpers/transferCredits';

interface selectedReward {
  examName: string;
  path: string;
  selectedIndex: number;
}

const transferCreditsRouter = router({
  getTransferredCourses: userProcedure.query(async ({ ctx }) => {
    const response = await db
      .select({ courseName: transferredCourse.courseName, units: transferredCourse.units })
      .from(transferredCourse)
      .where(eq(transferredCourse.userId, ctx.session.userId!));
    return response;
  }),
  addTransferredCourse: userProcedure.input(zodTransferredCourse).mutation(async ({ ctx, input }) => {
    await db
      .insert(transferredCourse)
      .values({ courseName: input.courseName, units: input.units, userId: ctx.session.userId! });
  }),
  removeTransferredCourse: userProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await db
      .delete(transferredCourse)
      .where(and(eq(transferredCourse.userId, ctx.session.userId!), eq(transferredCourse.courseName, input)));
  }),
  updateTransferredCourse: userProcedure.input(zodTransferredCourse).mutation(async ({ ctx, input }) => {
    await db
      .update(transferredCourse)
      .set({ units: input.units })
      .where(
        and(eq(transferredCourse.userId, ctx.session.userId!), eq(transferredCourse.courseName, input.courseName)),
      );
  }),
  getAPExamInfo: publicProcedure.query(async (): Promise<APExam[]> => {
    const response = await fetch(`${process.env.PUBLIC_API_URL}apExams`, {
      headers: ANTEATER_API_REQUEST_HEADERS,
    })
      .then((res) => res.json())
      .then((res) => (res.data ? (res.data as APExam[]) : []));
    return response;
  }),
  getSavedAPExams: userProcedure.query(async ({ ctx }): Promise<TransferredAPExam[]> => {
    const userId = ctx.session.userId;
    if (!userId) return [];

    const res = await db
      .select({ examName: transferredApExam.examName, score: transferredApExam.score, units: transferredApExam.units })
      .from(transferredApExam)
      .where(eq(transferredApExam.userId, userId));
    return res.map((exam) => ({
      examName: exam.examName,
      score: exam.score ?? 0,
      units: exam.units,
    })) as TransferredAPExam[];
  }),
  addUserAPExam: userProcedure.input(zodTransferredAPExam).mutation(async ({ input, ctx }) => {
    const { examName, score, units } = input;
    const userId = ctx.session.userId!;

    await db.insert(transferredApExam).values({ userId, examName, score: score ?? null, units });
  }),
  deleteUserAPExam: userProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const examName = input;
    const userId = ctx.session.userId!;

    await db
      .delete(transferredApExam)
      .where(and(eq(transferredApExam.userId, userId), eq(transferredApExam.examName, examName)));
  }),
  updateUserAPExam: userProcedure.input(zodTransferredAPExam).mutation(async ({ input, ctx }) => {
    const { examName, score, units } = input;
    const userId = ctx.session.userId!;

    await db
      .update(transferredApExam)
      .set({ score: score, units: units })
      .where(and(eq(transferredApExam.userId, userId), eq(transferredApExam.examName, examName)));
  }),
  getSelectedAPRewards: userProcedure.query(async ({ ctx }): Promise<selectedReward[]> => {
    const userId = ctx.session.userId!;

    const res = await db
      .select({
        examName: selectedApReward.examName,
        path: selectedApReward.path,
        selectedIndex: selectedApReward.selectedIndex,
      })
      .from(selectedApReward)
      .where(eq(selectedApReward.userId, userId));
    return res.map((reward) => ({
      examName: reward.examName,
      path: reward.path,
      selectedIndex: reward.selectedIndex,
    }));
  }),
  setSelectedAPReward: userProcedure.input(zodSelectedApReward).mutation(async ({ input, ctx }) => {
    const userId = ctx.session.userId!;
    const valuesDict = {
      userId: userId,
      examName: input.examName,
      path: input.path,
      selectedIndex: input.selectedIndex,
    };

    await db
      .insert(selectedApReward)
      .values(valuesDict)
      .onConflictDoUpdate({
        target: [selectedApReward.userId, selectedApReward.examName, selectedApReward.path],
        set: { selectedIndex: valuesDict.selectedIndex },
      });
  }),
  getTransferredGEs: userProcedure.query(async ({ ctx }): Promise<TransferredGE[]> => {
    const response = await db
      .select({
        geName: transferredGe.geName,
        numberOfCourses: transferredGe.numberOfCourses,
        units: transferredGe.units,
      })
      .from(transferredGe)
      .where(eq(transferredGe.userId, ctx.session.userId!));
    return response as TransferredGE[];
  }),
  setTransferredGE: userProcedure.input(zodTransferredGE).mutation(async ({ input, ctx }) => {
    const { geName, numberOfCourses, units } = input;
    const userId = ctx.session.userId!;
    await db
      .insert(transferredGe)
      .values({ userId, geName, numberOfCourses, units })
      .onConflictDoUpdate({
        target: [transferredGe.userId, transferredGe.geName],
        set: { numberOfCourses, units },
      });
  }),
  getUncategorizedTransfers: userProcedure.query(async ({ ctx }) => {
    const courses = await db
      .select({ name: transferredMisc.courseName, units: transferredMisc.units })
      .from(transferredMisc)
      .where(eq(transferredMisc.userId, ctx.session.userId!));
    return courses;
  }),
  addUncategorizedCourse: userProcedure.input(zodTransferredUncategorized).mutation(async ({ ctx, input }) => {
    await db
      .insert(transferredMisc)
      .values({ courseName: input.name, units: input.units, userId: ctx.session.userId! });
  }),
  updateUncategorizedCourse: userProcedure.input(zodTransferredUncategorized).mutation(async ({ ctx, input }) => {
    await db
      .update(transferredMisc)
      .set({ units: input.units })
      .where(and(eq(transferredMisc.userId, ctx.session.userId!), eq(transferredMisc.courseName, input.name ?? '')));
  }),
  removeUncategorizedCourse: userProcedure.input(zodTransferredUncategorized).mutation(async ({ ctx, input }) => {
    const conditions = [eq(transferredMisc.userId, ctx.session.userId!)];

    if (input.name != null) {
      conditions.push(eq(transferredMisc.courseName, input.name));
    } else {
      conditions.push(isNull(transferredMisc.courseName));
    }

    if (input.units != null) {
      conditions.push(eq(transferredMisc.units, input.units));
    } else {
      conditions.push(isNull(transferredMisc.units));
    }

    await db.delete(transferredMisc).where(and(...conditions));
  }),
  convertUserLegacyTransfers: publicProcedure.input(z.array(extendedTransferData)).query(async ({ input }) => {
    return await organizeLegacyTransfers(input);
  }),
  overrideAllTransfers: userProcedure
    .input(
      z.object({
        courses: z.array(zodTransferredCourse),
        ap: z.array(zodTransferredAPExam),
        ge: z.array(zodTransferredGE),
        other: z.array(zodTransferredUncategorized),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appendUserId = <T extends object>(item: T) => Object.assign(item, { userId: ctx.session.userId! });

      const dbQueries = [];
      if (input.courses.length) {
        const addCoursesOperation = db
          .insert(transferredCourse)
          .values(input.courses.map(appendUserId))
          .onConflictDoUpdate({
            target: [transferredCourse.userId, transferredCourse.courseName],
            set: { units: sql.raw(`EXCLUDED.${transferredCourse.units.name}`) },
          });
        dbQueries.push(addCoursesOperation);
      }
      if (input.ap.length) {
        const addApQuery = db
          .insert(transferredApExam)
          .values(
            input.ap.map((ap) => {
              return { ...appendUserId(ap), score: ap.score >= 1 ? ap.score : null };
            }),
          )
          .onConflictDoUpdate({
            target: [transferredApExam.userId, transferredApExam.examName],
            set: {
              score: sql.raw(`EXCLUDED.${transferredApExam.score.name}`),
              units: sql.raw(`EXCLUDED.${transferredApExam.units.name}`),
            },
          });
        dbQueries.push(addApQuery);
      }
      if (input.ge.length) {
        const addGeQuery = db
          .insert(transferredGe)
          .values(input.ge.map(appendUserId))
          .onConflictDoUpdate({
            target: [transferredGe.userId, transferredGe.geName],
            set: {
              numberOfCourses: sql.raw(`EXCLUDED.${transferredGe.numberOfCourses.name}`),
              units: sql.raw(`EXCLUDED.${transferredGe.units.name}`),
            },
          });
        dbQueries.push(addGeQuery);
      }
      if (input.other.length) {
        const rows = input.other.map(({ name: courseName, units }) => ({
          courseName,
          units,
          userId: ctx.session.userId!,
        }));
        const addOtherQuery = db
          .insert(transferredMisc)
          .values(rows)
          .onConflictDoUpdate({
            target: [transferredMisc.userId, transferredMisc.courseName],
            set: { units: sql.raw(`EXCLUDED.${transferredMisc.units.name}`) },
          });
        dbQueries.push(addOtherQuery);
      }

      await Promise.all([dbQueries.map((q) => q.execute())]);
    }),
});

export default transferCreditsRouter;
