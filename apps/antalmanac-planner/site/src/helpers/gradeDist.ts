import { GradesRaw } from '@peterportal/types';

const gradeScale = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
const gpaScale = [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0, 7];

export type GradesAggregate = {
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  gradeDCount: number;
  gradeFCount: number;
  gradePCount: number;
  gradeNPCount: number;
  total: number;
  totalPNP: number;
  averageGPA: string;
  averageGrade: string;
  averagePNP: string;
};

function gpaToGradeConverter(gpa: string): string {
  let i;
  for (i = 0; Number(gpa) < gpaScale[i]; i++);
  return gradeScale[i];
}

export function getAggregateGradeData(
  gradeData: GradesRaw,
  professor: string | undefined,
  quarter: string,
  course: string | undefined,
): GradesAggregate {
  const classGradeData: GradesAggregate = {
    gradeACount: 0,
    gradeBCount: 0,
    gradeCCount: 0,
    gradeDCount: 0,
    gradeFCount: 0,
    gradePCount: 0,
    gradeNPCount: 0,
    total: 0,
    totalPNP: 0,
    averageGPA: '',
    averageGrade: '',
    averagePNP: '',
  };

  let sum = 0;

  gradeData.forEach((data) => {
    const quarterMatch = quarter === 'ALL' || data.quarter + ' ' + data.year === quarter;
    const profMatch = professor === 'ALL' || data.instructors.includes(professor ?? '');
    const courseMatch = course === 'ALL' || data.department + ' ' + data.courseNumber === course;
    if (quarterMatch && (profMatch || courseMatch)) {
      classGradeData.gradeACount += data.gradeACount;
      classGradeData.gradeBCount += data.gradeBCount;
      classGradeData.gradeCCount += data.gradeCCount;
      classGradeData.gradeDCount += data.gradeDCount;
      classGradeData.gradeFCount += data.gradeFCount;
      classGradeData.gradePCount += data.gradePCount;
      classGradeData.gradeNPCount += data.gradeNPCount;
      sum += 4.0 * data.gradeACount + 3.0 * data.gradeBCount + 2.0 * data.gradeCCount + 1.0 * data.gradeDCount;
      classGradeData.total +=
        data.gradeACount +
        data.gradeBCount +
        data.gradeCCount +
        data.gradeDCount +
        data.gradeFCount +
        data.gradePCount +
        data.gradeNPCount;
      classGradeData.totalPNP += data.gradePCount + data.gradeNPCount;

      if (data.gradePCount >= data.gradeNPCount) {
        classGradeData.averagePNP = 'P';
      } else {
        classGradeData.averagePNP = 'NP';
      }
    }
  });

  classGradeData.averageGPA = (sum / (classGradeData.total - classGradeData.totalPNP)).toFixed(1);
  classGradeData.averageGrade = gpaToGradeConverter(classGradeData.averageGPA);

  return classGradeData;
}
