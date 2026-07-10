import { router } from '../helpers/trpc';
import courseMaterialsRouter from './courseMaterials';
import { courseNotesRouter } from './courseNotes';
import courseRequirementsRouter from './courseRequirements';
import coursesRouter from './courses';
import { customCoursesRouter } from './customCourses';
import departmentRouter from './department';
import { externalAppRouter } from './external';
import overrideRouter from './override';
import professorsRouter from './professors';
import programsRouter from './programs';
import reportsRouter from './reports';
import reviewsRouter from './reviews';
import roadmapsRouter from './roadmap';
import { savedCoursesRouter } from './savedCourses';
import scheduleRouter from './schedule';
import searchRouter from './search';
import transferCreditsRouter from './transferCredits';
import usersRouter from './users';
import zot4PlanImportRouter from './zot4planimport';

export const plannerAppRouter = router({
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
export type PlannerAppRouter = typeof plannerAppRouter;
