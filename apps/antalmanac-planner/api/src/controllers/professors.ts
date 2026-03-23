/**
 @module ProfessorsRoute
*/

import { z } from 'zod';
import { publicProcedure, router } from '../helpers/trpc';
import { GradesRaw, ProfessorAAPIResponse, ProfessorBatchAAPIResponse } from '@peterportal/types';
import { ANTEATER_API_REQUEST_HEADERS } from '../helpers/headers';

const professorsRouter = router({
  /**
   * Anteater API proxy for getting professor data
   */
  get: publicProcedure.input(z.object({ ucinetid: z.string() })).query(async ({ input }) => {
    const r = fetch(`${process.env.PUBLIC_API_URL}instructors/${input.ucinetid}`, {
      headers: ANTEATER_API_REQUEST_HEADERS,
    });

    return r.then((response) => response.json()).then((data) => data.data as ProfessorAAPIResponse);
  }),

  /**
   * Anteater API proxy for batch professor data
   */
  batch: publicProcedure.input(z.object({ professors: z.array(z.string()) })).mutation(async ({ input }) => {
    if (input.professors.length == 0) {
      return {};
    } else {
      const r = fetch(
        `${process.env.PUBLIC_API_URL}instructors/batch?ucinetids=${input.professors.map(encodeURIComponent).join(',')}`,
        { headers: ANTEATER_API_REQUEST_HEADERS },
      );

      return r
        .then((response) => response.json())
        .then(
          (data: { data: ProfessorAAPIResponse[] }) =>
            Object.fromEntries(data.data.map((x) => [x.ucinetid, x])) as ProfessorBatchAAPIResponse,
        );
    }
  }),

  /**
   * Anteater API proxy for grade distribution
   */
  grades: publicProcedure.input(z.object({ name: z.string() })).query(async ({ input }) => {
    const r = fetch(`${process.env.PUBLIC_API_URL}grades/raw?instructor=${encodeURIComponent(input.name)}`, {
      headers: ANTEATER_API_REQUEST_HEADERS,
    });

    return r.then((response) => response.json()).then((data) => data.data as GradesRaw);
  }),
});

export default professorsRouter;
