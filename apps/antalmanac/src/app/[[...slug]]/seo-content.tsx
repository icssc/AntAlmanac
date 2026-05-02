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
            <h1>AntAlmanac — Free UCI Schedule Planner</h1>

            <p>
                AntAlmanac is a free schedule planner for UC Irvine students. Search UCI courses by department, course
                number, or GE category. Build your weekly class schedule, view locations on an interactive campus map,
                and explore grade distributions and enrollment history.
            </p>

            <h2>Search UCI Courses</h2>
            <p>
                Browse courses across 140+ UCI departments including Computer Science, Informatics, Engineering,
                Biological Sciences, Mathematics, Economics, Psychology, Political Science, and more. Filter by General
                Education category — from Lower Division Writing to Multicultural Studies — or search by course number,
                title, or instructor.
            </p>

            <h2>Schedule Builder</h2>
            <p>
                Add UCI courses to a weekly calendar. AntAlmanac detects time conflicts, tracks your unit count, and
                lets you save multiple schedule variations to compare before enrolling.
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
