import { ReviewData } from '@peterportal/types';
import { CourseGQLData, ProfessorGQLData } from '../types/types';

export function getProfessorTerms(professorGQLData: ProfessorGQLData): string[] {
    return Object.values(professorGQLData.courses).flatMap((c) => c.terms);
}

export function getYears(terms: string[]): string[] {
    return [...new Set(terms.map((t) => t.split(' ')[0]))];
}

export function getQuarters(terms: string[], yearTaken: string): string[] {
    return [...new Set(terms.filter((t) => t.startsWith(yearTaken)).map((t) => t.split(' ')[1]))];
}

export function getReviewHeadingName(
    reviewToEdit: ReviewData | undefined,
    course: CourseGQLData | undefined,
    instructor: ProfessorGQLData | undefined,
) {
    if (!course && !instructor) {
        return `${reviewToEdit?.courseId}`;
    } else if (course) {
        return `${course?.department} ${course?.courseNumber}`;
    } else {
        return `${instructor?.name}`;
    }
}

export function displayReviewDate(date: string | Date): string {
    return new Date(date).toLocaleString('default', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

const avgField = (reviews: ReviewData[], field: 'rating' | 'difficulty'): string | null =>
    reviews.length ? (reviews.reduce((sum, r) => sum + r[field], 0) / reviews.length).toFixed(2) : null;

export const getAvgRating = (reviews: ReviewData[]) => avgField(reviews, 'rating');
export const getAvgDifficulty = (reviews: ReviewData[]) => avgField(reviews, 'difficulty');
