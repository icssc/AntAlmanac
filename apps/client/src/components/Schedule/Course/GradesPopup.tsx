import { Chart as ChartJS, registerables } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Bar as BarChart } from 'react-chartjs-2'
import { Box, Link, Skeleton, useMediaQuery, useTheme } from '@mui/material'
import { useGraphqlQuery } from '$hooks/useGraphqlQuery'
import type { WebsocCourse } from 'peterportal-api-next-types'

/**
 * register everything
 */
ChartJS.register(...registerables)

interface Props {
  course: WebsocCourse
}

/**
 * button that opens a grade distribution bar chart popup
 */
export default function GradesPopup(props: Props) {
  const { course } = props

  const query = useGraphqlQuery(course)

  const theme = useTheme()
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'))

  const encodedDept = encodeURIComponent(course.deptCode)
  const href = `https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${course.courseNumber}&code=&submit=Submit`

  const color = theme.palette.getContrastText(theme.palette.background.paper)
  const title = `Grade Distribution | Average GPA: ${query.data?.grades?.average_gpa?.toFixed(3)}`
  const width = isMobileScreen ? 300 : 500
  const height = isMobileScreen ? 200 : 300

  const data: ChartData<'bar', number[], string> = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'P', 'NP'],
    datasets: [
      {
        data: query.data?.datasets || [],
        backgroundColor: '#5182ed',
      },
    ],
  }

  /**
   * general styling: @see {@link https://www.chartjs.org/docs/latest/configuration/}
   * title styling: @see {@link https://www.chartjs.org/docs/latest/configuration/title.html}
   * x/y axes styling: @see {@link https://www.chartjs.org/docs/latest/axes/styling.html}
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
        <Skeleton variant="text" animation="wave" height={height} width={width} />
      ) : (
        <>
          <Box height={height} width={width}>
            <BarChart data={data} height={height} width={width} options={options} />
          </Box>
          <Box textAlign="center">
            <Link href={href} target="_blank" rel="noopener noreferrer">
              View on Zotistics
            </Link>
          </Box>
        </>
      )}
    </Box>
  )
}
