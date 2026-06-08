import { ANTALMANAC_TITLE } from '$src/app/seo-constants';
import Link from 'next/link';

/**
 * Server-rendered content for search engine indexing and screen readers.
 */
export function SeoContent() {
    return (
        <div className="sr-only" role="complementary" aria-label="About AntAlmanac">
            <h1>{ANTALMANAC_TITLE}</h1>

            <p>
                AntAlmanac helps you find any UCI course and plan your UCI schedule in one place, a UCI course planner
                and UCI schedule planner trusted by tens of thousands of UC Irvine students. Search UCI courses across
                140+ departments, build your UCI schedule with conflict detection and unit counts, and explore grade
                distributions and enrollment history before you enroll.
            </p>

            <h2>UCI course search</h2>
            <p>
                Run a UCI course search across Computer Science, Informatics, Biological Sciences, Mathematics,
                Economics, Engineering, Psychology, Political Science, and 130+ more departments. Filter by GE category:
                Writing, Multicultural Studies, Science &amp; Technology, and more, or search by course number, title,
                or instructor name.
            </p>

            <h2>UCI class schedule &amp; weekly planner</h2>
            <p>
                Add UCI courses to a weekly calendar to preview your UCI class schedule. AntAlmanac detects time
                conflicts, tracks your unit count, and lets you save multiple schedule variations to compare before
                enrolling. Use it as your UCI schedule planner to finalize your ideal UCI schedule before enrollment
                opens.
            </p>

            <h2>Interactive UCI Campus Map</h2>
            <p>
                See where your UCI classes meet on an interactive campus map. Get walking directions between buildings
                and plan your route between back-to-back classes.
            </p>

            <h2>Grade Distributions &amp; Enrollment History</h2>
            <p>
                View historical grade distributions for UCI courses and instructors. See past enrollment data and
                waitlist trends to help decide which sections to take.
            </p>

            <nav aria-label="AntAlmanac sections">
                <ul>
                    <li>
                        <Link href="/">UCI Course Search</Link>
                    </li>
                    <li>
                        <Link href="/calendar">My Calendar</Link>
                    </li>
                    <li>
                        <Link href="/added">My Schedule</Link>
                    </li>
                    <li>
                        <Link href="/map">Campus Map</Link>
                    </li>
                    <li>
                        <Link href="/feedback">Feedback</Link>
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
