import { readUserSnapshot, writeUserSnapshot } from './userSnapshot';

beforeEach(() => localStorage.clear());

it('returns what was written for the same user', () => {
    writeUserSnapshot('selected-majors', 'a@uci.edu', { majors: ['CS'] });
    expect(readUserSnapshot('selected-majors', 'a@uci.edu')).toEqual({ majors: ['CS'] });
});

it("never returns another user's snapshot, and keeps each user's own", () => {
    writeUserSnapshot('selected-majors', 'a@uci.edu', { majors: ['CS'] });
    expect(readUserSnapshot('selected-majors', 'b@uci.edu')).toBeNull();

    writeUserSnapshot('selected-majors', 'b@uci.edu', { majors: ['Math'] });
    expect(readUserSnapshot('selected-majors', 'a@uci.edu')).toEqual({ majors: ['CS'] });
    expect(readUserSnapshot('selected-majors', 'b@uci.edu')).toEqual({ majors: ['Math'] });
});

it('keeps snapshots with different names apart', () => {
    writeUserSnapshot('selected-majors', 'a@uci.edu', { majors: [] });
    expect(readUserSnapshot('selected-minors', 'a@uci.edu')).toBeNull();
});

it('treats corrupt storage as no snapshot', () => {
    writeUserSnapshot('selected-majors', 'a@uci.edu', { majors: ['CS'] });
    expect(readUserSnapshot('selected-majors', 'a@uci.edu')).toEqual({ majors: ['CS'] });
    const [key] = Object.keys(localStorage);
    localStorage.setItem(key, '{not json');
    expect(readUserSnapshot('selected-majors', 'a@uci.edu')).toBeNull();
});
