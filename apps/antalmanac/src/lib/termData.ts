import { termsArray, TermNames } from '@packages/antalmanac-types';

// The index of the default term in termData, as per WebSOC
const defaultTerm = 0;

class Term {
    shortName: TermNames;
    longName: string;
    startDate?: [number, number, number];
    constructor(shortName: TermNames, longName: string, startDate?: [number, number, number]) {
        this.shortName = shortName;
        this.longName = longName;
        this.startDate = startDate;
    }
}

// We need to convert the termsArray to a Term[] so that we can use it in the frontend, it needs to be a const array to work for static type checking

const termData: Term[] = termsArray.map((term): Term => {
    if ('startDate' in term) {
        return new Term(term.shortName, term.longName, term.startDate as [number, number, number]); // Type assertion since startDate is readonly
    } else {
        return new Term(term.shortName, term.longName);
    }
});

// returns the default term
function getDefaultTerm() {
    return termData[defaultTerm].shortName;
}

export { defaultTerm, getDefaultTerm, termData };
