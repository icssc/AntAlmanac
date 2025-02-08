import { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';

class Term {
    shortName: `${string} ${string}`;
    longName: string;
    startDate?: [number, number, number];
    finalsStartDate?: [number, number, number];
    socAvailableDate?: [number, number, number];

    constructor(
        shortName: `${string} ${string}`,
        longName: string,
        startDate?: [number, number, number],
        finalsStartDate?: [number, number, number],
        socAvailableDate?: [number, number, number]
    ) {
        this.shortName = shortName;
        this.longName = longName;
        this.startDate = startDate;
        this.finalsStartDate = finalsStartDate;
        this.socAvailableDate = socAvailableDate;
    }

    getStartDate(): Date | undefined {
        if (!this.startDate) {
            return;
        }

        const [year, month, day] = this.startDate;
        return new Date(year, month, day);
    }

    getFinalsStartDate(): Date | undefined {
        if (!this.finalsStartDate) {
            return;
        }

        const [year, month, day] = this.finalsStartDate;
        return new Date(year, month, day);
    }

    getSocAvailableDate(): Date | undefined {
        if (!this.socAvailableDate) {
            return;
        }

        const [year, month, day] = this.socAvailableDate;
        return new Date(year, month, day);
    }
}

/**
 * Quarterly Academic Calendar {@link https://www.reg.uci.edu/calendars/quarterly/2023-2024/quarterly23-24.html}
 * Quick Reference Ten Year Calendar {@link https://www.reg.uci.edu/calendars/academic/tenyr-19-29.html}
 * The `startDate`, if available, should correspond to the __instruction start date__ (not the quarter start date)
 * The `finalsStartDate`, if available, should correspond to the __final exams__ first date (should be a Saturday)
 *
 * NB: Months are 0-indexed, Days are 1-index
 */
const termData = [
    new Term('2025 Fall', '2025 Fall Quarter', [2025, 8, 25], [2025, 11, 6], [2025, 4, 3]),
    new Term('2025 Summer2', '2025 Summer Session 2', [2025, 7, 4], [2025, 8, 9], [2025, 2, 1]),
    new Term('2025 Summer10wk', '2025 10-wk Summer', [2025, 5, 23], [2025, 7, 29], [2025, 2, 1]),
    new Term('2025 Summer1', '2025 Summer Session 1', [2025, 5, 23], [2025, 6, 29], [2025, 2, 1]),
    new Term('2025 Spring', '2025 Spring Quarter', [2025, 2, 31], [2025, 5, 7], [2025, 1, 8]),
    new Term('2025 Winter', '2025 Winter Quarter', [2025, 0, 6], [2025, 2, 15], [2024, 10, 2]),
    new Term('2024 Fall', '2024 Fall Quarter', [2024, 8, 26], [2024, 11, 7]),
    new Term('2024 Summer2', '2024 Summer Session 2', [2024, 7, 5], [2024, 8, 10]),
    new Term('2024 Summer10wk', '2024 10-wk Summer', [2024, 5, 24], [2024, 7, 30]),
    new Term('2024 Summer1', '2024 Summer Session 1', [2024, 5, 24], [2024, 6, 31]),
    new Term('2024 Spring', '2024 Spring Quarter', [2024, 3, 1], [2024, 5, 8]),
    new Term('2024 Winter', '2024 Winter Quarter', [2024, 0, 8], [2024, 2, 16]),
    new Term('2023 Fall', '2023 Fall Quarter', [2023, 8, 28], [2023, 11, 9]),
    new Term('2023 Summer2', '2023 Summer Session 2', [2023, 7, 7]),
    new Term('2023 Summer10wk', '2023 10-wk Summer', [2023, 5, 26]),
    new Term('2023 Summer1', '2023 Summer Session 1', [2023, 5, 26]),
    new Term('2023 Spring', '2023 Spring Quarter', [2023, 3, 3]),
    new Term('2023 Winter', '2023 Winter Quarter', [2023, 0, 9]),
    new Term('2022 Fall', '2022 Fall Quarter', [2022, 8, 22]),
    new Term('2022 Summer2', '2022 Summer Session 2', [2022, 7, 1]),
    new Term('2022 Summer10wk', '2022 10-wk Summer', [2022, 5, 20]), // nominal start date for SS1 and SS10wk
    new Term('2022 Summer1', '2022 Summer Session 1', [2022, 5, 20]), // since Juneteenth is observed 6/20/22
    new Term('2022 Spring', '2022 Spring Quarter', [2022, 2, 28]),
    new Term('2022 Winter', '2022 Winter Quarter', [2022, 0, 3]),
    new Term('2021 Fall', '2021 Fall Quarter', [2021, 8, 23]),
    new Term('2021 Summer2', '2021 Summer Session 2'),
    new Term('2021 Summer10wk', '2021 10-wk Summer'),
    new Term('2021 Summer1', '2021 Summer Session 1'),
    new Term('2021 Spring', '2021 Spring Quarter', [2021, 2, 29]),
    new Term('2021 Winter', '2021 Winter Quarter', [2021, 0, 4]),
    new Term('2020 Fall', '2020 Fall Quarter', [2020, 9, 1]),
    new Term('2020 Summer2', '2020 Summer Session 2'),
    new Term('2020 Summer10wk', '2020 10-wk Summer'),
    new Term('2020 Summer1', '2020 Summer Session 1'),
    new Term('2020 Spring', '2020 Spring Quarter', [2020, 2, 30]),
    new Term('2020 Winter', '2020 Winter Quarter', [2020, 0, 6]),
    new Term('2019 Fall', '2019 Fall Quarter', [2019, 8, 26]),
    new Term('2019 Summer2', '2019 Summer Session 2'),
    new Term('2019 Summer10wk', '2019 10-wk Summer'),
    new Term('2019 Summer1', '2019 Summer Session 1'),
    new Term('2019 Spring', '2019 Spring Quarter'),
    new Term('2019 Winter', '2019 Winter Quarter'),
    new Term('2018 Fall', '2018 Fall Quarter'),
    new Term('2018 Summer2', '2018 Summer Session 2'),
    new Term('2018 Summer10wk', '2018 10-wk Summer'),
    new Term('2018 Summer1', '2018 Summer Session 1'),
    new Term('2018 Spring', '2018 Spring Quarter'),
    new Term('2018 Winter', '2018 Winter Quarter'),
    new Term('2017 Fall', '2017 Fall Quarter'),
    new Term('2017 Summer2', '2017 Summer Session 2'),
    new Term('2017 Summer10wk', '2017 10-wk Summer'),
    new Term('2017 Summer1', '2017 Summer Session 1'),
    new Term('2017 Spring', '2017 Spring Quarter'),
    new Term('2017 Winter', '2017 Winter Quarter'),
    new Term('2016 Fall', '2016 Fall Quarter'),
    new Term('2016 Summer2', '2016 Summer Session 2'),
    new Term('2016 Summer10wk', '2016 10-wk Summer'),
    new Term('2016 Summer1', '2016 Summer Session 1'),
    new Term('2016 Spring', '2016 Spring Quarter'),
    new Term('2016 Winter', '2016 Winter Quarter'),
    new Term('2015 Fall', '2015 Fall Quarter'),
    new Term('2015 Summer2', '2015 Summer Session 2'),
    new Term('2015 Summer10wk', '2015 10-wk Summer'),
    new Term('2015 Summer1', '2015 Summer Session 1'),
    new Term('2015 Spring', '2015 Spring Quarter'),
    new Term('2015 Winter', '2015 Winter Quarter'),
    new Term('2014 Fall', '2014 Fall Quarter'),
];

/**
 * Get the default term.
 *
 * By default, use a static index.
 * If an array of events is provided, select the first term found.
 */
function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): Term {
    let term = getSocAvailableTerms().find((t) => {
        if (!t.socAvailableDate) {
            return false;
        }

        // Prefer defaulting to a "major" quarter
        if (t.shortName.includes('Summer')) {
            return false;
        }

        const [year, month, day] = t.socAvailableDate;

        return new Date(2025, 6, 1) >= new Date(year, month, day);
    });

    for (const event of events) {
        if (!event.isCustomEvent && event.term) {
            const existingTerm = termData.find((t) => t.shortName === event.term);
            if (existingTerm) {
                term = existingTerm;
                break;
            }
        }
    }

    return term ?? termData[0];
}

/**
 *
 * @param termShortName the `shortName` property of a Term
 * @returns the Term corresponding, or the default if prop is not provided
 */
function getTerm(termShortName?: string): Term {
    return termData.find((t) => t.shortName === termShortName) ?? getDefaultTerm();
}

/**
 * Returns all terms that are available on SOC
 */
function getSocAvailableTerms(): Term[] {
    const socAvailableIndex = termData.findIndex((t) => {
        const socAvailableDate = t.getSocAvailableDate();

        if (!socAvailableDate) {
            return false;
        }

        return Date.now() >= socAvailableDate.getTime();
    });

    return termData.slice(socAvailableIndex);
}

export { getTerm, getDefaultTerm, getSocAvailableTerms };
