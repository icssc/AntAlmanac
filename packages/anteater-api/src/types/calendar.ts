import type { AllCalendarTermsResponse, CalendarTermResponse } from '$generated/anteater-api-types';

export type CalendarAllAPIResult = AllCalendarTermsResponse;

export type CalendarTerm = CalendarTermResponse['data'];

export type Year = CalendarTerm['year'];

export type Quarter = CalendarTerm['quarter'];
