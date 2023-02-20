import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { PETERPORTAL_REST_ENDPOINT } from '$lib/api/endpoints'
import type { CourseResponse } from '$lib/peterportal.types'

interface QueryResponse {
  title: string
  prerequisite_text: string
  prerequisite_for: string
  description: string
  ge_list: string
}

type RestQueryOptions = UseQueryOptions<QueryResponse, any, QueryResponse, any>

/**
 */
export function useRestQuery(courseId: string, options?: RestQueryOptions) {
  const query = useQuery([PETERPORTAL_REST_ENDPOINT, courseId], {
    async queryFn() {
      const response = await fetch(`${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`)
      if (response.ok) {
        const jsonResp = (await response.json()) as CourseResponse
        return {
          title: jsonResp.title,
          prerequisite_text: jsonResp.prerequisite_text,
          prerequisite_for: jsonResp.prerequisite_for.join(', '),
          description: jsonResp.description,
          ge_list: jsonResp.ge_list.join(', '),
        }
      } else {
        return {
          title: 'No description available',
          prerequisite_text: '',
          prerequisite_for: '',
          description: '',
          ge_list: '',
        }
      }
    },
    ...options,
  })
  return query
}
