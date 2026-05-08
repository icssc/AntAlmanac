import type { Metadata } from 'next';

export const metadata: Metadata = {
    alternates: {
        canonical: 'https://antalmanac.com',
    },
};

export default function SearchPage() {
    return (
        <div className="sr-only" role="complementary" aria-label="UCI Course Search">
            <h1>AntAlmanac — UCI Course &amp; Schedule Planner</h1>
            <p>
                Search UCI courses across 140+ departments, build your weekly class schedule with conflict detection,
                and explore grade distributions and enrollment history.
            </p>

            <h2>UCI Courses</h2>
            <p>
                Search UCI courses in Computer Science, Informatics, Biological Sciences, Mathematics, Economics,
                Engineering, Psychology, Political Science, and 130+ more departments. Filter by GE category — Writing,
                Multicultural Studies, Science &amp; Technology, and more — or search by course number, title, or
                instructor name.
            </p>

            <h2>UCI Schedule Builder</h2>
            <p>
                Add UCI courses to a weekly calendar. AntAlmanac detects time conflicts, tracks your unit count, and
                lets you save multiple schedule variations to compare before enrolling.
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
                </ul>
            </nav>
        </div>
    );
}
