import type { PlannerQuarterSaveInfo } from '@peterportal/types';
import { sql } from 'drizzle-orm';

import { db, type TransactionType } from '../../../api/src/db';
import { queryGetPlanners, setQuarterCourses } from '../../../api/src/helpers/roadmap';

jest.mock('../../../api/src/db', () => ({ db: { select: jest.fn() } }));

function transaction() {
    const values = jest.fn().mockResolvedValue(undefined);
    const where = jest.fn().mockResolvedValue(undefined);
    const insert = jest.fn().mockReturnValue({ values });
    const remove = jest.fn().mockReturnValue({ where });
    const tx = { insert, delete: remove } as unknown as TransactionType;
    return { tx, values, remove };
}

it('writes separate enrollment states for repeated course IDs during account saves', async () => {
    const { tx, values, remove } = transaction();
    const quarter: PlannerQuarterSaveInfo = {
        plannerId: 1,
        startYear: 2026,
        data: {
            name: 'Fall',
            courses: [
                { courseId: 'COMPSCI199', userChosenUnits: 0, countsForCredit: false },
                { courseId: 'COMPSCI199', userChosenUnits: 4, countsForCredit: true },
            ],
        },
    };
    await setQuarterCourses(tx, [quarter]);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith([
        expect.objectContaining({
            index: 0,
            courseId: 'COMPSCI199',
            units: 0,
            countsForCredit: false,
        }),
        expect.objectContaining({
            index: 1,
            courseId: 'COMPSCI199',
            units: 4,
            countsForCredit: true,
        }),
    ]);
});

it('stores automatic enrollments as null when importing or creating a quarter, including custom cards', async () => {
    const { tx, values, remove } = transaction();
    await setQuarterCourses(
        tx,
        [
            {
                plannerId: 1,
                startYear: 2026,
                data: { name: 'Fall', courses: [{ courseId: 'COMPSCI199' }, { courseId: 'CUSTOM#9' }] },
            },
        ],
        true
    );
    expect(remove).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith([
        expect.objectContaining({ courseId: 'COMPSCI199', countsForCredit: null }),
        expect.objectContaining({
            courseId: 'CUSTOM',
            customCardId: 9,
            countsForCredit: null,
        }),
    ]);
});

it('returns SQL null as automatic while retaining explicit yes and no choices', async () => {
    const raw = [
        {
            id: 1,
            name: 'Plan',
            content: [
                {
                    startYear: 2026,
                    name: 'Year',
                    collapsed: false,
                    quarters: [
                        {
                            name: 'Fall',
                            courses: [
                                { courseId: 'COMPSCI199', userChosenUnits: null, countsForCredit: null },
                                { courseId: 'COMPSCI199', countsForCredit: true },
                                { courseId: 'COMPSCI199', countsForCredit: false },
                            ],
                        },
                    ],
                },
            ],
        },
    ];
    const query = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(raw),
    };
    jest.mocked(db.select).mockReturnValue(query as unknown as ReturnType<typeof db.select>);
    const result = await queryGetPlanners(sql`true`);
    const courses = result[0].content[0].quarters[0].courses;
    expect(courses[0]).not.toHaveProperty('countsForCredit');
    expect(courses[1].countsForCredit).toBe(true);
    expect(courses[2].countsForCredit).toBe(false);
});
