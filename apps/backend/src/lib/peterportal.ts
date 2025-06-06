import { ppEnvSchema } from '../env';

export const PETERPORTAL_API_URL = "https://peterportal.org/api/trpc/external.roadmaps.getByGoogleID";

export function getCurrentTerm(): { year: number; quarter: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const quarter =
    month <= 3 ? 'Winter' :
    month <= 6 ? 'Spring' :
    month <= 9 ? 'Summer' : 'Fall';
  return { year, quarter };
}

export type PeterPortalAPIResponse = {
  result: {
    data: [
      {
        name: string; // e.g., "Peter's Roadmap"
        content: {
          name: string; // e.g., "Year 1"
          startYear: number;
          quarters: {
            name: string; // e.g., "Fall", "Winter"
            courses: string[];
          }[];
        }[];
      }
    ];
  };
};

export async function fetchUserCoursesPeterPortal(userId: string): Promise<Set<string>> {
  const { year, quarter } = getCurrentTerm();
  const env = ppEnvSchema.parse(process.env);
  const apiKey = env.PETERPORTAL_CLIENT_API_KEY;

  const searchParams = new URLSearchParams();
  searchParams.set('input', JSON.stringify({ googleUserId: userId }));
  const url = `${PETERPORTAL_API_URL}?${searchParams}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    const data: PeterPortalAPIResponse = await response.json();

    const courses = new Set<string>();
    const yearList = data.result?.data?.[0]?.content ?? [];

    for (const yearData of yearList) {
      for (const q of yearData.quarters ?? []) {
        q.courses?.forEach(c => courses.add(c));
        if (yearData.startYear === year && q.name === quarter) {
          return courses;
        }
      }
    }

    return courses;
  } catch (e) {
    console.error("PeterPortal fetch failed:", e);
    return new Set();
  }
}