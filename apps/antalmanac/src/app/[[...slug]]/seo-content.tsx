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
            <h1>AntAlmanac — UCI Course &amp; Schedule Planner</h1>

            <p>
                AntAlmanac is UCI&apos;s most-used course and schedule planner, trusted by tens of thousands of UC
                Irvine students. Search UCI courses across 140+ departments, build your weekly class schedule with
                conflict detection, and explore grade distributions and enrollment history.
            </p>

            <h2>Browse UCI Courses by Department</h2>
            <p>
                Search UCI courses in Computer Science, Informatics, Biological Sciences, Mathematics, Economics,
                Engineering, Psychology, Political Science, and 130+ more departments. Filter by GE category — Writing,
                Multicultural Studies, Science &amp; Technology, and more — or search by course number, title, or
                instructor name.
            </p>

            <h2>UCI Schedule Builder</h2>
            <p>
                Add UCI courses to a weekly calendar. AntAlmanac detects time conflicts, tracks your unit count, and
                lets you save multiple schedule variations to compare before enrolling. Plan your ideal UCI class
                schedule before enrollment opens.
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
                        <a href="/">UCI Course Search</a>
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
                    AntAlmanac is an open-source project by <a href="https://github.com/icssc">ICS Student Council</a>{' '}
                    at the University of California, Irvine.
                </p>
            </footer>
        </div>
    );
}
