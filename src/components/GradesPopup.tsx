import { Chart as ChartJS, registerables } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useQuery } from '@tanstack/react-query'
import { Box, Link, Skeleton, useMediaQuery } from '@mui/material'
import { PETERPORTAL_GRAPHQL_ENDPOINT } from '$lib/api/endpoints'
import type { AACourse } from '$types/peterportal'
import { useSettingsStore } from '$stores/settings'

ChartJS.register(...registerables)

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

export default function GradesPopup(props: { course: AACourse }) {
  const isMobileScreen = useMediaQuery('(max-width: 750px)')
  const { isDarkMode } = useSettingsStore()
  const { course } = props
  const queryString = `
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

  const query = useQuery([], {
    async queryFn() {
      const query = JSON.stringify({
        query: queryString,
      })

      const res = (await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: query,
      }).then((res) => res.json())) as GradesGraphQLResponse
      const grades = res.data.courseGrades.aggregate
      const datasets = Object.entries(grades)
        .filter(([key]) => key !== 'average_gpa')
        .map(([, value]) => value)
      return {
        datasets,
        grades,
      }
    },
  })

  const encodedDept = encodeURIComponent(course.deptCode)
  const color = isDarkMode() ? '#fff' : '#111'
  const title = `Grade Distribution | Average GPA: ${query.data?.grades?.average_gpa}`
  const width = isMobileScreen ? 300 : 500
  const height = isMobileScreen ? 200 : 300

  const data: ChartData<'bar', number[] | undefined, string> = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'P', 'NP'],
    datasets: [
      {
        data: query.data?.datasets || [],
        backgroundColor: '#5182ed',
      },
    ],
  }

  /**
   * @see {@link https://www.chartjs.org/docs/latest/configuration/} for general
   * @see {@link https://www.chartjs.org/docs/latest/configuration/title.html} for title
   * @see {@link https://www.chartjs.org/docs/latest/axes/styling.html} for styling x and y axes
   */
  const options: ChartOptions<'bar'> = {
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color,
        font: {
          size: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color,
        },
        ticks: {
          color,
        },
        title: {
          display: true,
          text: 'Grade',
          color,
        },
      },
      y: {
        grid: {
          color,
        },
        ticks: {
          color,
        },
      },
    },
  }

  return (
    <Box sx={{ padding: 2 }}>
      {!query.data ? (
        <Skeleton variant="text" animation="wave" height={height} width={width}></Skeleton>
      ) : (
        <Box>
          <Box height={height} width={width}>
            <Bar data={data} height={height} width={width} options={options} />
          </Box>
          <Box textAlign="center">
            <Link
              href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${course.courseNumber}&code=&submit=Submit`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Zotistics
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  )
}
