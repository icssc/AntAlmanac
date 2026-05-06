/**
 * Server-rendered content for search engine indexing and screen readers.
 *
 * This component is visually hidden (sr-only) but present in the initial HTML,
 * giving crawlers real text content to index and screen readers a page summary.
 * Without this, the body is empty because the app renders entirely client-side.
 */
export function SeoContent() {
    return (
        <div className="sr-only" role="complementary" aria-label="About AntAlmanac">
            <h1>AntAlmanac — Free UCI Planner for Your UCI Course Schedule</h1>

            <p>
                AntAlmanac is a free UCI planner for UC Irvine students who want to plan a realistic UCI course
                schedule before registration. Look up any UCI course in the schedule of classes, add sections to a
                week view, and iterate on your UCI course schedule until it fits. Compare alternatives, keep unit
                totals in check, and pair planning with grade history so you know what you are signing up for.
            </p>

            <h2>Search UCI Courses</h2>
            <p>
                Browse courses across 140+ UCI departments including Computer Science, Informatics, Engineering,
                Biological Sciences, Mathematics, Economics, Psychology, Political Science, and more. Filter by General
                Education category — from Lower Division Writing to Multicultural Studies — or search by course number,
                title, or instructor. Whether you are shopping for your next term or mapping prerequisites, this UCI
                course search is built for speed alongside your UCI course schedule.
            </p>

            <h2>Schedule Builder</h2>
            <p>
                Turn search results into a concrete weekly layout: add UCI courses to the calendar, spot overlapping
                lectures and discussions automatically, and save multiple draft schedules. The schedule builder is the
                core of the UCI planner experience—swap sections, preserve backups, and walk into enrollment with a plan
                instead of a guess.
            </p>

            <h2>Interactive Campus Map</h2>
            <p>
                See where your classes meet on a map of UCI. Get walking directions between buildings and plan your
                route between back-to-back classes.
            </p>

            <h2>Grade Distributions</h2>
            <p>
                View historical grade distributions for UCI courses and instructors. See past enrollment data to help
                decide which sections to take.
            </p>

            <nav aria-label="AntAlmanac sections">
                <ul>
                    <li>
                        <a href="/">Course Search</a>
                    </li>
                    <li>
                        <a href="/added">My Schedule</a>
                    </li>
                    <li>
                        <a href="/map">Campus Map</a>
                    </li>
                    <li>
                        <a href="/feedback">Feedback</a>
                    </li>
                </ul>
            </nav>

            <footer>
                <p>
                    AntAlmanac is a free, open-source project by{' '}
                    <a href="https://github.com/icssc">ICS Student Council</a> at the University of California, Irvine.
                </p>
            </footer>
        </div>
    );
}
