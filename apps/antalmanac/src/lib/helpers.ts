import React from 'react';

import { PETERPORTAL_GRAPHQL_ENDPOINT } from './api/endpoints';
import { openSnackbar } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { RepeatingCustomEvent } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import trpc from '$lib/api/trpc';

export async function queryGraphQL<PromiseReturnType>(queryString: string): Promise<PromiseReturnType | null> {
    const query = JSON.stringify({
        query: queryString,
    });

    const res = await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: query,
    });

    const json = await res.json();

    if (!res.ok || json.data === null) return null;

    return json as Promise<PromiseReturnType>;
}

export interface ZotCourseResponse {
    codes: string[];
    customEvents: RepeatingCustomEvent[];
}
export async function queryZotCourse(schedule_name: string) {
    const response = await trpc.zotcourse.getUserData.mutate({ scheduleName: schedule_name });
    // For custom event, there is no course attribute in each.
    const codes = response.data
        .filter((section: { eventType: number }) => section.eventType === 3)
        .map((section: { course: { code: string } }) => section.course.code) as string[];
    const days = [false, false, false, false, false, false, false];
    const customEvents: RepeatingCustomEvent[] = response.data
        .filter((section: { eventType: number }) => section.eventType === 1)
        .map((event: { title: string; start: string; end: string; dow: number[] }) => {
            return {
                title: event.title,
                start: event.start,
                end: event.end,
                days: days.map((_, index) => event.dow.includes(index)),
                scheduleIndices: [AppStore.getCurrentScheduleIndex()],
                customEventID: Date.now(),
                color: '#551a8b',
            };
        }) as RepeatingCustomEvent[];
    return {
        codes: codes,
        customEvents: customEvents,
    };
}

export const termsInSchedule = (term: string) =>
    new Set([term, ...AppStore.schedule.getCurrentCourses().map((course) => course.term)]);

export const warnMultipleTerms = (terms: Set<string>) => {
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${[...terms].sort().join(', ')}.`,
        undefined,
        undefined,
        { whiteSpace: 'pre-line' }
    );
};

export async function clickToCopy(event: React.MouseEvent<HTMLElement, MouseEvent>, sectionCode: string) {
    event.stopPropagation();
    await navigator.clipboard.writeText(sectionCode);
    openSnackbar('success', 'WebsocSection code copied to clipboard');
}

export function isDarkMode() {
    switch (AppStore.getTheme()) {
        case 'light':
            return false;
        case 'dark':
            return true;
        default:
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

/**
 * @param courseNumber A string that represents the course number of a course (eg. '122A', '121')
 * @returns This function returns an int or number with a decimal representation of the passed in string (eg. courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121)
 */
export function courseNumAsDecimal(courseNumber: string): number {
    // I wanted to split the course detail number into letters and digits
    const courseNumArr = courseNumber.split(/(\d+)/);
    // Gets rid of empty strings in courseNumArr
    const filtered = courseNumArr.filter((value) => value !== '');

    // Return 0 if array is empty
    if (filtered.length === 0) {
        console.error(`No characters were found, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    const lastElement = filtered[filtered.length - 1].toUpperCase(); // .toUpperCase() won't affect numeric characters
    const lastElementCharCode = lastElement.charCodeAt(0); // Just checks the first character of the last element in the array
    // Return the last element of the filtered array as an integer if it represents an integer
    if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
        return parseInt(lastElement);
    }

    // If the string does not have any numeric characters
    if (filtered.length === 1) {
        console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`);
        return 0;
    }

    // This element is the second to last element of the array, supposedly a string of numeric characters
    const secondToLastElement = filtered[filtered.length - 2];
    // The characters within [A-I] or [a-i] will be converted to 1-9, respectively
    const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (1 <= letterAsNumber && letterAsNumber <= 9) {
        return parseFloat(`${secondToLastElement}.${letterAsNumber}`);
    } else {
        console.error(
            `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
                filtered[filtered.length - 1][0]
            }, Input: ${courseNumber}`
        );
        // This will represent an integer at this point because the split in the beginning split the array into strings of digits and strings of other characters
        // If the last element in the array does not represent an integer, then the second to last element must represent an integer
        return parseInt(secondToLastElement);
    }
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];
