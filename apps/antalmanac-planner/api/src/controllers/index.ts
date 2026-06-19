import { router } from '../helpers/trpc';
import coursesRouter from './courses';
import { courseNotesRouter } from './courseNotes';
import professorsRouter from './professors';
import programsRouter from './programs';
import reportsRouter from './reports';
import reviewsRouter from './reviews';
import roadmapsRouter from './roadmap';
import courseRequirementsRouter from './courseRequirements';
import courseMaterialsRouter from './courseMaterials';
import { savedCoursesRouter } from './savedCourses';
import scheduleRouter from './schedule';
import transferCreditsRouter from './transferCredits';
import usersRouter from './users';
import searchRouter from './search';
import zot4PlanImportRouter from './zot4planimport';
import departmentRouter from './department';
import overrideRouter from './override';
import { externalAppRouter } from './external';
import { customCoursesRouter } from './customCourses';

export const appRouter = router({
  external: externalAppRouter,
  courses: coursesRouter,
  courseNotes: courseNotesRouter,
  courseRequirements: courseRequirementsRouter,
  courseMaterials: courseMaterialsRouter,
  professors: professorsRouter,
  programs: programsRouter,
  roadmaps: roadmapsRouter,
  reports: reportsRouter,
  reviews: reviewsRouter,
  savedCourses: savedCoursesRouter,
  search: searchRouter,
  schedule: scheduleRouter,
  transferCredits: transferCreditsRouter,
  users: usersRouter,
  zot4PlanImport: zot4PlanImportRouter,
  departments: departmentRouter,
  customCourses: customCoursesRouter,
  override: overrideRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
