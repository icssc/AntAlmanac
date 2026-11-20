import { loadPlannerCourses } from './plannerCourseCache';
import { searchAPIResults } from './util';

jest.mock('./util', () => ({ searchAPIResults: jest.fn() }));
const fetchCourses = jest.mocked(searchAPIResults);

beforeEach(() => {
    sessionStorage.clear();
    fetchCourses.mockReset();
    fetchCourses.mockResolvedValue({});
});

afterEach(() => jest.restoreAllMocks());

it('deduplicates IDs and reuses the same course set across reloads', async () => {
    await loadPlannerCourses(['B', 'A', 'A']);
    jest.resetModules();
    const reloaded = await import('./plannerCourseCache');
    const reloadedUtil = await import('./util');
    await reloaded.loadPlannerCourses(['A', 'B']);
    expect(fetchCourses).toHaveBeenCalledWith('courses', ['A', 'B']);
    expect(jest.mocked(reloadedUtil.searchAPIResults)).not.toHaveBeenCalled();
});

it('refreshes expired data and a different course set', async () => {
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1000);
    await loadPlannerCourses(['A']);
    clock.mockReturnValue(301001);
    await loadPlannerCourses(['A']);
    await loadPlannerCourses(['B']);
    expect(fetchCourses).toHaveBeenCalledTimes(3);
});

it('recovers from corrupt or unavailable storage', async () => {
    sessionStorage.setItem('planner-course-details-v1', '{');
    await loadPlannerCourses(['A']);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('full');
    });
    await expect(loadPlannerCourses(['A'])).resolves.toEqual({});
    expect(fetchCourses).toHaveBeenCalledTimes(2);
});

it('does not cache failures or request empty course lists', async () => {
    await expect(loadPlannerCourses([])).resolves.toEqual({});
    expect(fetchCourses).not.toHaveBeenCalled();
    fetchCourses.mockRejectedValueOnce(new Error('offline'));
    await expect(loadPlannerCourses(['A'])).rejects.toThrow('offline');
    await loadPlannerCourses(['A']);
    expect(fetchCourses).toHaveBeenCalledTimes(2);
});
