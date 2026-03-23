import { applyFullPlannerEdit, applyQuarterEdit, applyYearEdit, createEmptyPlan } from './roadmap';
import { deepCopy } from './util';
import { PlannerYearChangeData, RoadmapPlan } from '../types/roadmap';
import { LOADING_COURSE_PLACEHOLDER } from './courseRequirements';
import { PlannerQuarterData } from '../types/types';

// Shared test fixtures
const plannerA: RoadmapPlan = {
  id: 1,
  name: 'Planner A',
  content: {
    yearPlans: [
      {
        startYear: 2020,
        name: 'Planner A Year',
        quarters: [],
      },
    ],
    invalidCourses: [],
  },
};

const plannerB: RoadmapPlan = {
  id: 2,
  name: 'Planner B',
  content: {
    yearPlans: [
      {
        startYear: 2023,
        name: 'Planner B Year',
        quarters: [],
      },
    ],
    invalidCourses: [],
  },
};

let roadmapPlans = [] as RoadmapPlan[];

beforeEach(() => {
  roadmapPlans = deepCopy([plannerA, plannerB]);
});

describe('applyFullPlannerEdit', () => {
  it('Does nothing when there is no old or new data', () => {
    applyFullPlannerEdit(roadmapPlans, null, null);
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Adds a new blank plan when there is no old data', () => {
    applyFullPlannerEdit(roadmapPlans, null, { id: 3, name: 'after' });
    expect(roadmapPlans).toEqual([plannerA, plannerB, { id: 3, name: 'after', content: createEmptyPlan() }]);
  });

  it('Removes a plan when there is no new data', () => {
    applyFullPlannerEdit(roadmapPlans, plannerB, null);
    expect(roadmapPlans).toEqual([plannerA]);
  });

  it('Updates a plan matching the old id to have the new properties', () => {
    applyFullPlannerEdit(roadmapPlans, { id: 1, name: 'before' }, { id: 1, name: 'after' });
    expect(roadmapPlans).toEqual([
      { ...plannerA, name: 'after' },
      { ...plannerB, name: 'Planner B' },
    ]);
  });
});

describe('applyPlannerYearEdit', () => {
  it('Does nothing when there is no old or new data', () => {
    applyYearEdit(roadmapPlans, 1, null, null);
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Does nothing when the planner ID does not exist', () => {
    const nonExistentId = 999;
    applyYearEdit(roadmapPlans, nonExistentId, null, { startYear: 2025, name: 'New Year' });
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Adds a new year when there is no old data', () => {
    const newYearData: PlannerYearChangeData = { startYear: 2025, name: 'New Year' };
    applyYearEdit(roadmapPlans, 1, null, newYearData);

    const expectedYears = [plannerA.content.yearPlans[0], { ...newYearData, quarters: [] }];
    const expectedPlannerA: RoadmapPlan = {
      ...plannerA,
      content: { yearPlans: expectedYears, invalidCourses: [] },
    };

    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });

  it('Removes a year when there is no new data', () => {
    const yearToRemove: PlannerYearChangeData = { startYear: 2020, name: 'Planner A Year' };
    applyYearEdit(roadmapPlans, 1, yearToRemove, null);

    const expectedPlannerA: RoadmapPlan = {
      ...plannerA,
      content: { yearPlans: [], invalidCourses: [] },
    };

    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });

  it('Updates a year matching the old startYear to have the new properties', () => {
    const oldYearData: PlannerYearChangeData = { startYear: 2020, name: 'Old Name' };
    const newYearData: PlannerYearChangeData = { startYear: 2022, name: 'New Name' };

    applyYearEdit(roadmapPlans, 1, oldYearData, newYearData);

    const expectedYearData = { ...newYearData, quarters: [] };
    const expectedPlannerA: RoadmapPlan = {
      ...plannerA,
      content: { yearPlans: [expectedYearData], invalidCourses: [] },
    };

    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });

  it('Preserves quarters when updating a year', () => {
    // Create a plan with quarters
    const plannerWithQuarters = deepCopy(plannerA);
    const year = plannerWithQuarters.content.yearPlans[0];
    year.quarters = [
      {
        name: 'Fall',
        courses: [{ ...LOADING_COURSE_PLACEHOLDER, id: 'COMPSCI161' }],
      },
      {
        name: 'Winter',
        courses: [{ ...LOADING_COURSE_PLACEHOLDER, id: 'COMPSCI171' }],
      },
    ];

    roadmapPlans = [plannerWithQuarters, plannerB];

    const oldYearData: PlannerYearChangeData = { startYear: 2020, name: 'Old Name' };
    const newYearData: PlannerYearChangeData = { startYear: 2022, name: 'New Name' };

    applyYearEdit(roadmapPlans, 1, oldYearData, newYearData);

    const expectedPlannerA: RoadmapPlan = {
      ...plannerWithQuarters,
      content: {
        yearPlans: [{ ...newYearData, quarters: year.quarters }],
        invalidCourses: [],
      },
    };

    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });

  it('Reorders years to preserve startYear ordering', () => {
    const addedYear: PlannerYearChangeData = { startYear: 2010, name: 'Older Year' };

    applyYearEdit(roadmapPlans, 1, null, addedYear);
    const expectedYearData = { ...addedYear, quarters: [] };
    const expectedYears = [
      { ...expectedYearData, quarters: [] }, // 2010 < 2020
      plannerA.content.yearPlans[0],
    ];
    const expectedPlannerA: RoadmapPlan = {
      ...plannerA,
      content: { yearPlans: expectedYears, invalidCourses: [] },
    };

    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });
});

describe('applyPlannerQuarterEdit', () => {
  let firstPlannerId: number;
  let firstStartYear: number;

  beforeEach(() => {
    firstPlannerId = roadmapPlans[0].id!;
    firstStartYear = roadmapPlans[0].content.yearPlans[0].startYear;
  });

  it('Does nothing when there is no old or new data', () => {
    applyQuarterEdit(roadmapPlans, firstPlannerId, firstStartYear, null, null);
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Does nothing when the planner ID does not exist', () => {
    const nonExistentId = 999;
    applyQuarterEdit(roadmapPlans, nonExistentId, 2022, null, { name: 'Fall', courses: [] });
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Does nothing when the year does not exist', () => {
    const nonexistentYear = 2050;
    applyQuarterEdit(roadmapPlans, firstPlannerId, nonexistentYear, null, { name: 'Winter', courses: [] });
    expect(roadmapPlans).toEqual([plannerA, plannerB]);
  });

  it('Adds a quarter when there is no old data', () => {
    applyQuarterEdit(roadmapPlans, firstPlannerId, firstStartYear, null, { name: 'Spring', courses: [] });
    expect(roadmapPlans[0].content.yearPlans[0].quarters).toEqual([{ name: 'Spring', courses: [] }]);
  });

  it('Adds a quarter in the correct order when there exists other quarters', () => {
    applyQuarterEdit(roadmapPlans, firstPlannerId, firstStartYear, null, { name: 'Spring', courses: [] });
    applyQuarterEdit(roadmapPlans, firstPlannerId, firstStartYear, null, { name: 'Fall', courses: [] });
    expect(roadmapPlans[0].content.yearPlans[0].quarters).toEqual([
      { name: 'Fall', courses: [] },
      { name: 'Spring', courses: [] },
    ]);
  });

  it('Removes a quarter from the year when there is no new data', () => {
    const firstQuarterExample: PlannerQuarterData = {
      name: 'Fall',
      courses: [{ ...LOADING_COURSE_PLACEHOLDER, id: 'COMPSCI122A' }],
    };
    const quarters = roadmapPlans[0].content.yearPlans[0].quarters;
    quarters.push(firstQuarterExample);

    applyQuarterEdit(roadmapPlans, firstPlannerId, firstStartYear, firstQuarterExample, null);
    const expectedPlannerA: RoadmapPlan = {
      name: 'Planner A',
      id: firstPlannerId,
      content: {
        yearPlans: [{ startYear: firstStartYear, name: 'Planner A Year', quarters: [] }],
        invalidCourses: [],
      },
    };
    expect(roadmapPlans).toEqual([expectedPlannerA, plannerB]);
  });
});

/** @todo write unit tests according to comments */
describe.skip('restoreRevision', () => {
  // All types can be covered throughout these tests

  it('Undo a single revision correctly', () => {}); // quarter

  it('Undo multiple revisions correctly', () => {}); // planner, year

  it('Redo a single revision correctly', () => {}); // year

  it('Redo multiple revisions correctly', () => {}); // quarter, planner
});

describe.skip('compareRoadmaps', () => {
  it('Returns empty change lists for identical roadmaps', () => {}); // do more than one comparison

  it('Returns quarters that have had courses added', () => {});

  it('Returns quarters that have had courses removed', () => {});

  it('Returns quarters that have had courses reordered', () => {});

  it('Returns quarters that are newly created', () => {});

  it('Returns quarters that have been deleted', () => {});

  it('Returns years that have been created with no quarters', () => {});

  it('Returns years and quarters for years created with quarters', () => {});

  it('Returns years that have been deleted', () => {});

  it('Returns years that have had their name changed', () => {});

  it('Returns years that have had their start year changed', () => {}); // equivalent of delete + create

  it('Does not return years that have their quarters changed if their name/start year is the same', () => {});

  it('Returns planners that are newly created', () => {});

  it('Returns planners that have been deleted', () => {});

  it('Returns planners that have had their names changed', () => {});

  it('Does not return planner that have their years/quarters changed if the name is the same', () => {});
});
