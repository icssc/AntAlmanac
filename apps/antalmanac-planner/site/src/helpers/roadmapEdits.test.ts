/** @todo write unit tests according to comments */
describe.skip('addPlanner', () => {
  it('Creates a revision to add an empty planner', () => {});

  it('Creates a revision, with multiple edits, to add a planner with a year but no quarters', () => {});

  it('Creates a revision, with multiple edits, to add a planner with a year and quarters', () => {});
});

describe.skip('deletePlanner', () => {
  it('Creates a revision to delete an empty planner', () => {});

  it('Creates a revision, with multiple edits, to delete a planner with a year but no quarters', () => {});

  it('Creates a revision, with multiple edits, to delete a planner with a year and quarters', () => {});
});

describe.skip('updatePlannerName', () => {
  it('Creates a revision to change the name of the planner', () => {});
});

describe.skip('addPlannerYear', () => {
  it('Creates a revision to add an empty year', () => {});

  it('Creates a revision, with multiple edits, to add a year with quarters', () => {});
});

describe.skip('deletePlannerYear', () => {
  it('Creates a revision to delete an empty year', () => {});

  it('Creates a revision, with multiple edits, to delete a year with quarters', () => {});
});

describe.skip('modifyPlannerYear', () => {
  it('Creates an empty revision when no details are changed', () => {});

  it('Creates a revision to only add quarters', () => {});

  it('Creates a revision to only remove quarters', () => {});

  it('Creates a revision to only add and remove quarters', () => {});

  it('Creates a revision to only update the year name', () => {});

  it('Creates a revision to only update the start year', () => {});

  it('Creates a revision to add quarters and update the start year', () => {});

  it('Creates a revision to remove quarters and update the name', () => {});

  it('Creates a revision to add quarters, remove quarters, and update both start year and name', () => {});
});

describe.skip('addPlannerQuarter', () => {
  it('Creates a revision to add a quarter with no courses', () => {});

  it('Creates a revision to add a quarter with courses', () => {});
});

describe.skip('modifyQuarterCourse', () => {
  it('Creates an empty revision when no added/removed quarter are specified', () => {});

  it('Creates a revision to add a course to a quarter', () => {});

  it('Creates a revision to remove a course from a quarter', () => {});

  it('Creates a revision to add and remove a quarter', () => {});

  it('Removes Loading Course Placeholders', () => {});
});
