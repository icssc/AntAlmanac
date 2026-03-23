'use client';
import { FC } from 'react';
import './RecentOfferingsTable.scss';
import { QuarterName } from '@peterportal/types';
import { sortTerms } from '../../helpers/util';

import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { useAppSelector } from '../../store/hooks';

type RecentOfferingsTableSize = 'thin' | 'wide';

function parseOfferings(terms: string[]) {
  const offerings: { [academicYear: string]: boolean[] } = {};

  for (const term of terms) {
    const [yearStr, quarter] = term.split(' ') as [string, QuarterName];
    const year = parseInt(yearStr);

    const quarterIndexMap = {
      Fall: 0,
      Winter: 1,
      Spring: 2,
      Summer10wk: 3,
      Summer1: 3,
      Summer2: 3,
    };
    const quarterIndex = quarterIndexMap[quarter];

    // If the course is not described as a "Fall" course, it should be listed as starting in the previous academic year
    // e.g. "Winter 2023" should be in "2022-2023", but "Fall 2023" should be in "2023-2024"
    const academicYear = quarterIndex === 0 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    // If this academic year hasn't already been parsed, initialize all four quarters as false
    offerings[academicYear] ??= [false, false, false, false];

    offerings[academicYear][quarterIndex] = true;
  }

  // Sort offerings by academic year in descending order
  const sortedOfferings = Object.entries(offerings).sort(([yearA], [yearB]) => yearB.localeCompare(yearA));
  const top4Offerings = sortedOfferings.slice(0, 4);

  return top4Offerings;
}

function getYearColumnValue(size: RecentOfferingsTableSize, academicYear: string) {
  if (size === 'wide') return academicYear;
  const [startYear, endYear] = academicYear.split('-');
  return `${startYear.substring(2)}-${endYear.substring(2)}`;
}

function isFutureTerm(currentTerm: string, academicYear: string, quarterIndex: number) {
  // if the actual current term hasn't been fetched yet, return false
  if (!currentTerm) return false;

  // get the term from the table cell's academic year and quarter index
  const [startYear, endYear] = academicYear.split('-');
  const termYear = quarterIndex === 0 ? startYear : endYear;
  const termQuarter = ['Fall', 'Winter', 'Spring', 'Summer'][quarterIndex];
  const term = `${termYear} ${termQuarter}`;

  // determine if the term from the table cell comes first (sortTerms is in descending order)
  const sortedTerms = sortTerms([term, currentTerm]);
  return sortedTerms[0] === term;
}

interface RecentOfferingsTableProps {
  terms: string[];
  size: RecentOfferingsTableSize;
}

const RecentOfferingsTable: FC<RecentOfferingsTableProps> = ({ terms, size }) => {
  const currentQuarter = useAppSelector((state) => state.schedule.currentQuarter);
  const offerings = parseOfferings(terms);

  if (terms.length === 0) return null;

  return (
    <div className="recent-offerings">
      <table className="ppc-table recent-offerings-table">
        <thead>
          <tr>
            <th>{size === 'wide' ? 'Academic Year' : 'Year'}</th>
            <th>🍂</th>
            <th>❄️</th>
            <th>🌸</th>
            <th>☀️</th>
          </tr>
        </thead>
        <tbody>
          {offerings.map(([academicYear, quarters]) => (
            <tr key={academicYear}>
              <td>{getYearColumnValue(size, academicYear)}</td>
              {quarters.map((offered, index) => (
                <td key={index} className="recent-offerings-quarter">
                  {offered ? (
                    <CheckIcon />
                  ) : isFutureTerm(currentQuarter, academicYear, index) ? (
                    <QuestionMarkIcon className="question-mark" />
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOfferingsTable;
