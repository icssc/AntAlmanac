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
        name: string;
        content: {
          name: string; 
          startYear: number;
          quarters: {
            name: string;
            courses: string[];
          }[];
        }[];
      }
    ];
  };
};

export async function fetchUserRoadmapsPeterPortal(userId: string) { // maybe add a return promise
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

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    const data: PeterPortalAPIResponse = await response.json();
    return data.result?.data ?? [];

  } catch (e) {
    console.error("PeterPortal fetch failed:", e);
    return [];
  }
}

export function flattenRoadmapCourses(roadmap: any): string[] {
  const courses: Set<string> = new Set();

  for (const year of roadmap.content ?? []) {
    for (const q of year.quarters ?? []) {
      q.courses?.forEach(c => courses.add(c));
    }
  }
  return Array.from(courses);
}