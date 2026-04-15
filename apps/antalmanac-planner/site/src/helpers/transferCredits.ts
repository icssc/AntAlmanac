import {
  APExam,
  TransferredGE,
  TransferredCourse,
  TransferredUncategorized,
  TransferredAPExam,
} from '@peterportal/types';
import { TransferWithUnread } from '../store/slices/transferCreditsSlice';
import trpc from '../trpc';

/**
 * Gets a list of names of courses and AP Exams from transferred credits. Courses and AP Exams
 * are the only things that are used to clear prerequisites and corequisites (and thus validate the planner)
 * @param courses The list of transferred courses that the user has
 * @param apExams The list of AP Exams the user has added credits for
 * @returns ...
 */
export function getNamesOfTransfers(
  courses: TransferredCourse[],
  apExams: TransferredAPExam[],
  apExamInfo: APExam[],
): string[] {
  // a prerequisite examName may be "AP COMP SCI A", "AP CALCULUS BC" (catalogue name?????)
  const transferNames: string[] = [];

  apExams.forEach((exam) => {
    const examInfo = apExamInfo.find((info) => info.fullName === exam.examName);
    transferNames.push((examInfo?.catalogueName as string | null) ?? exam.examName);
  });

  courses.forEach((course) => {
    transferNames.push(course.courseName);
  });

  return transferNames;
}

/**
 * Returns the total number of units across transferred credits
 * @param courses The list of transferred courses that the user has
 * @param apExams The list of AP Exams the user has added credits for
 * @param otherTransfers A list of other (uncategorized) transferred units
 */
export function getTotalUnitsFromTransfers(
  courses: TransferredCourse[],
  apExams: TransferredAPExam[],
  geTransfers: TransferredGE[],
  otherTransfers: TransferredUncategorized[],
) {
  let total = 0;

  courses.forEach((course) => {
    total += course.units;
  });
  apExams.forEach((apExam) => {
    total += apExam.units;
  });
  geTransfers.forEach((ge) => {
    total += ge.units;
  });
  otherTransfers.forEach((otherTransfer) => {
    total += otherTransfer.units ?? 0;
  });

  return total;
}

/** Make all transfers in the given list of transfers unread */
export function markTransfersAsUnread<T>(transfer: T[]): TransferWithUnread<T>[] {
  return transfer.map((item) => ({
    unread: true,
    ...item,
  }));
}

export enum LocalTransferSaveKey {
  Course = 'transferredCourses',
  AP = 'transferredAPs',
  GE = 'transferredGEs',
  Uncategorized = 'uncategorizedTransfers',
}

async function loadTransferData<T>(
  trpcRouteName: keyof (typeof trpc)['transferCredits'],
  isLoggedIn: boolean,
  localKey: LocalTransferSaveKey,
): Promise<T[]> {
  if (isLoggedIn) {
    // Fetch from tRPC if logged in
    type OperationType = { query: () => Promise<T[]> };
    return await (trpc.transferCredits[trpcRouteName] as OperationType).query();
  } else {
    // Get array from local storage if logged out
    let localArray: T[] = [];
    try {
      localArray = JSON.parse(localStorage['roadmap__' + localKey]);
    } catch {
      /* ignore */
    }
    return localArray;
  }
}

export function loadTransferredCourses(isLoggedIn: boolean): Promise<TransferredCourse[]> {
  return loadTransferData<TransferredCourse>('getTransferredCourses', isLoggedIn, LocalTransferSaveKey.Course);
}
export function loadTransferredAPs(isLoggedIn: boolean): Promise<TransferredAPExam[]> {
  return loadTransferData<TransferredAPExam>('getSavedAPExams', isLoggedIn, LocalTransferSaveKey.AP);
}
export function loadTransferredGEs(isLoggedIn: boolean): Promise<TransferredGE[]> {
  return loadTransferData<TransferredGE>('getTransferredGEs', isLoggedIn, LocalTransferSaveKey.GE);
}
export function loadTransferredOther(isLoggedIn: boolean): Promise<TransferredUncategorized[]> {
  return loadTransferData<TransferredUncategorized>(
    'getUncategorizedTransfers',
    isLoggedIn,
    LocalTransferSaveKey.Uncategorized,
  );
}

export function saveLocalTransfers<T>(localKey: LocalTransferSaveKey, data: T[]): void {
  localStorage['roadmap__' + localKey] = JSON.stringify(data);
}
