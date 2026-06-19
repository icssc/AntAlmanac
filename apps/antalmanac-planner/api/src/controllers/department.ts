/**
 @module DepartmentRoute
*/
import { publicProcedure, router } from '../helpers/trpc';
import { DepartmentsAAPIResponse } from '@peterportal/types';
import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';

const DEPARTMENT_YEAR_RANGE = 10;

const departmentRouter = router({
  get: publicProcedure.query(async () => {
    const minYear = new Date().getFullYear() - DEPARTMENT_YEAR_RANGE;
    const r = fetch(`${process.env.PUBLIC_API_URL}websoc/departments?since=${minYear}`, {
      headers: ANTEATER_API_REQUEST_HEADERS,
    });

    return r.then((response) => response.json()).then((data) => data.data as DepartmentsAAPIResponse);
  }),
});

export default departmentRouter;
