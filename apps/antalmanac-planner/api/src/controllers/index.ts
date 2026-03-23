import { router } from '../helpers/trpc';
import coursesRouter from './courses';
import professorsRouter from './professors';
import programsRouter from './programs';
import reportsRouter from './reports';
import reviewsRouter from './reviews';
import roadmapsRouter from './roadmap';
import courseRequirementsRouter from './courseRequirements';
import { savedCoursesRouter } from './savedCourses';
import scheduleRouter from './schedule';
import transferCreditsRouter from './transferCredits';
import usersRouter from './users';
import searchRouter from './search';
import zot4PlanImportRouter from './zot4planimport';
import departmentRouter from './department';
import { externalAppRouter } from './external';

export const appRouter = router({
  external: externalAppRouter,
  courses: coursesRouter,
  courseRequirements: courseRequirementsRouter,
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
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
