import { readUserSnapshot, writeUserSnapshot } from './userSnapshot';

beforeEach(() => localStorage.clear());

it('returns what was written for the same user', () => {
    writeUserSnapshot('transfers', 'a@uci.edu', { courses: ['ICS 31'] });
    expect(readUserSnapshot('transfers', 'a@uci.edu')).toEqual({ courses: ['ICS 31'] });
});

it("never returns another user's snapshot", () => {
    writeUserSnapshot('transfers', 'a@uci.edu', { courses: ['ICS 31'] });
    expect(readUserSnapshot('transfers', 'b@uci.edu')).toBeNull();
});

it('keeps snapshots with different names apart', () => {
    writeUserSnapshot('selected-majors', 'a@uci.edu', { majors: [] });
    expect(readUserSnapshot('transfers', 'a@uci.edu')).toBeNull();
});

it('treats corrupt storage as no snapshot', () => {
    localStorage.setItem('planner-user-snapshot-v1:transfers', '{not json');
    expect(readUserSnapshot('transfers', 'a@uci.edu')).toBeNull();
});
