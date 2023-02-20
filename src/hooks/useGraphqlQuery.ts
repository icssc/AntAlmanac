import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { PETERPORTAL_GRAPHQL_ENDPOINT } from '$lib/api/endpoints'
import type { AACourse } from '$lib/peterportal.types'

interface GradesGraphQLResponse {
  data: {
    courseGrades: {
      aggregate: {
        average_gpa: number
        sum_grade_a_count: number
        sum_grade_b_count: number
        sum_grade_c_count: number
        sum_grade_d_count: number
        sum_grade_f_count: number
        sum_grade_np_count: number
        sum_grade_p_count: number
      }
    }
  }
}

interface GraphqlQueryResponse {
  datasets: number[]
  grades: GradesGraphQLResponse['data']['courseGrades']['aggregate']
}

type GraphqlQueryOptions = UseQueryOptions<GraphqlQueryResponse, any, GraphqlQueryResponse, any>

function getQuery(course: AACourse) {
  const query = `
      { courseGrades: grades(department: "${course.deptCode}", number: "${course.courseNumber}", ) {
          aggregate {
            sum_grade_a_count
            sum_grade_b_count
            sum_grade_c_count
            sum_grade_d_count
            sum_grade_f_count
            sum_grade_p_count
            sum_grade_np_count
            average_gpa
          }
      },
    }`
  return query
}

/**
 * hook to query graphQL api
 */
export function useGraphqlQuery(course: AACourse, options?: GraphqlQueryOptions) {
  const query = useQuery([PETERPORTAL_GRAPHQL_ENDPOINT, ...Object.keys(course), ...Object.values(course)], {
    async queryFn() {
      const body = { query: getQuery(course) }

      const res: GradesGraphQLResponse = await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json())

      const grades = res.data.courseGrades.aggregate
      const datasets = Object.entries(grades)
        .filter(([key]) => key !== 'average_gpa')
        .map(([, value]) => value)

      const graphqlResponse = { datasets, grades }
      return graphqlResponse
    },
    ...options,
  })
  return query
}
