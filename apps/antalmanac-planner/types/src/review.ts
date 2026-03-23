import { z } from 'zod';

export const anonymousName = 'Anonymous Peter';

export const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'] as const;
export const gradesEnum = z.enum(grades);
export type ReviewGrade = z.infer<typeof gradesEnum>;

export const tags = [
  'Clear grading criteria',
  'Tough grader',
  'Amazing lectures',
  'Test heavy',
  'Get ready to read',
  'Extra credit',
  'Participation matters',
  'Graded by few things',
  "Skip class? You won't pass",
  'Accessible outside class',
  'Beware of pop quizzes',
  'Lots of homework',
  'So many papers',
  'Lecture heavy',
  'Group projects',
  'Gives good feedback',
] as const;
export const tagsEnum = z.enum(tags);
export type ReviewTags = z.infer<typeof tagsEnum>;

export const reviewSubmission = z.object({
  professorId: z.string(),
  courseId: z.string(),
  anonymous: z.boolean(),
  content: z.string().max(500).optional(),
  rating: z.number().min(1).max(5),
  difficulty: z.number().min(1).max(5),
  gradeReceived: gradesEnum,
  forCredit: z.boolean(),
  quarter: z.string(),
  takeAgain: z.boolean(),
  textbook: z.boolean(),
  attendance: z.boolean(),
  tags: z.array(tagsEnum),
  updatedAt: z.string().optional(),
});
export type ReviewSubmission = z.infer<typeof reviewSubmission>;

export const editReviewSubmission = reviewSubmission.extend({ id: z.number() });
export type EditReviewSubmission = z.infer<typeof editReviewSubmission>;

export const reviewData = reviewSubmission.omit({ anonymous: true }).extend({
  id: z.number(),
  userId: z.number(),
  userDisplay: z.string(),
  verified: z.boolean(),
  score: z.number(),
  userVote: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  authored: z.boolean(),
});
export type ReviewData = z.infer<typeof reviewData>;

export const reviewInput = z.object({
  courseId: z.string().optional(),
  professorId: z.string().optional(),
  verified: z.boolean().optional(),
  reviewId: z.number().optional(),
});
export type ReviewInput = z.infer<typeof reviewInput>;

export type FeaturedReviewData = Omit<ReviewData, 'score' | 'userVote' | 'userDisplay' | 'authored'>;

export const featuredQuery = z.object({
  type: z.enum(['course', 'professor']),
  id: z.string(),
});
export type FeaturedQuery = z.infer<typeof featuredQuery>;
