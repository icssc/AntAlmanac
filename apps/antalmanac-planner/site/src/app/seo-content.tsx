import Link from 'next/link';

import { ANTALMANAC_PLANNER_TITLE } from './seo-constants';

/**
 * Server-rendered content for search engine indexing and screen readers.
 */
export function SeoContent() {
    return (
        <div className="sr-only" role="complementary" aria-label="About AntAlmanac Planner">
            <h1>{ANTALMANAC_PLANNER_TITLE}</h1>

            <p>
                AntAlmanac Planner helps you find any UCI course and plan your UCI 4-year plan in one place, a UCI
                course planner trusted by tens of thousands of UC Irvine students. Search UCI courses across 140+
                departments, build your UCI 4-year roadmap with prerequisite detection and degree completion tracking,
                and explore course grade distributions and historical offerings before you plan.
            </p>

            <h2>Catalog</h2>
            <p>
                Search and select from 80+ majors and 70+ minors and view how your planned roadmap fulfills your major,
                specialization, minor, and GE requirements.
            </p>

            <h2>Import Credits</h2>
            <p>
                Import any credits you have earned through exams or through another college. Specify any general
                education credits you have earned in any category from other colleges and universities.
            </p>

            <h2>UCI Course Search</h2>
            <p>
                Run a UCI course search across Computer Science, Informatics, Biological Sciences, Mathematics,
                Economics, Engineering, Psychology, Political Science, and 130+ more departments. View recent offerings,
                grade distribution visualizations, visual prerequisite trees, historic scheduling data, and reviews from
                UCI students.
            </p>

            <h2>UCI Instructor Search</h2>
            <p>
                Search through UCI faculty across 140+ departments. View grade distribution visualization, historic
                scheduling data, and reviews from UCI students.
            </p>

            <nav aria-label="AntAlmanac Planner sections">
                <ul>
                    <li>
                        <Link href="/planner">UCI Course Search</Link>
                    </li>
                </ul>
            </nav>

            <footer>
                <p>
                    AntAlmanac is an open-source project by{' '}
                    <a href="https://github.com/icssc" target="_blank" rel="noopener noreferrer">
                        ICS Student Council
                    </a>{' '}
                    at the University of California, Irvine.
                </p>
            </footer>
        </div>
    );
}
