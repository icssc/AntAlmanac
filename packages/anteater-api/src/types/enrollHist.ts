import type { EnrollmentHistoryResponse } from './generated/anteater-api-types';

export type EnrollmentHistoryAPIResult = EnrollmentHistoryResponse;

export type EnrollmentHistory = EnrollmentHistoryAPIResult['data'];

export type EnrollmentHistoryEntry = EnrollmentHistory[number];
