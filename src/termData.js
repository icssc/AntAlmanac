// The index of the default term in termData, as per WebSOC
const defaultTerm = 0;

function Term(shortName, longName, startDate) {
    this.shortName = shortName;
    this.longName = longName;
    this.startDate = startDate;
}

// Quarterly Academic Calendar: https://www.reg.uci.edu/calendars/quarterly/2022-2023/quarterly22-23.html
// Note: months are 0-indexed
const termData = [
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

//returns the default term
function getDefaultTerm() {
    return termData[defaultTerm];
}

export { termData, defaultTerm, getDefaultTerm };
