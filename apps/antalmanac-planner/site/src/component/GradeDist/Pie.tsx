import { Component } from 'react';
import { ResponsivePie, PieTooltipProps } from '@nivo/pie';

import { GradesRaw } from '@peterportal/types';
import ChartTooltip from '../ChartTooltip/ChartTooltip.tsx';
import { getCssVariable } from '../../helpers/styling.ts';

const gradeScale = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
const gpaScale = [4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0, 7];

interface Slice {
  id: 'A' | 'B' | 'C' | 'D' | 'F' | 'P' | 'NP';
  value: number;
  label: string;
  color: string;
}

interface PieProps {
  gradeData: GradesRaw;
  quarter: string;
  professor?: string;
  course?: string;
}

export default class Pie extends Component<PieProps> {
  total = 0;
  totalPNP = 0;
  averageGPA = '';
  averageGrade = '';
  averagePNP = '';

  getClassData = (): Slice[] => {
    const { professor, quarter, course } = this.props;

    let gradeACount = 0,
      gradeBCount = 0,
      gradeCCount = 0,
      gradeDCount = 0,
      gradeFCount = 0,
      gradePCount = 0,
      gradeNPCount = 0;

    this.total = 0;
    this.totalPNP = 0;
    this.averageGPA = '';
    this.averageGrade = '';
    this.averagePNP = '';

    let sum = 0;

    this.props.gradeData.forEach((data) => {
      const quarterMatch = quarter === 'ALL' || data.quarter + ' ' + data.year === quarter;
      const profMatch = professor === 'ALL' || data.instructors.includes(this.props.professor ?? '');
      const courseMatch = course === 'ALL' || data.department + ' ' + data.courseNumber === this.props.course;
      if (quarterMatch && (profMatch || courseMatch)) {
        gradeACount += data.gradeACount;
        gradeBCount += data.gradeBCount;
        gradeCCount += data.gradeCCount;
        gradeDCount += data.gradeDCount;
        gradeFCount += data.gradeFCount;
        gradePCount += data.gradePCount;
        gradeNPCount += data.gradeNPCount;
        sum += 4.0 * data.gradeACount + 3.0 * data.gradeBCount + 2.0 * data.gradeCCount + 1.0 * data.gradeDCount;
        this.total +=
          data.gradeACount +
          data.gradeBCount +
          data.gradeCCount +
          data.gradeDCount +
          data.gradeFCount +
          data.gradePCount +
          data.gradeNPCount;
        this.totalPNP += data.gradePCount + data.gradeNPCount;

        if (data.gradePCount >= data.gradeNPCount) {
          this.averagePNP = 'P';
        } else {
          this.averagePNP = 'NP';
        }
      }
    });

    this.averageGPA = (sum / (this.total - this.totalPNP)).toFixed(1);
    this.gpaToGradeConverter(this.averageGPA);

    const pnpData: Slice[] = [
      {
        id: 'P',
        label: 'P',
        value: gradePCount,
        color: getCssVariable('--mui-palette-chart-pass'),
      },
      {
        id: 'NP',
        label: 'NP',
        value: gradeNPCount,
        color: getCssVariable('--mui-palette-chart-noPass'),
      },
    ];

    if (this.totalPNP == this.total) {
      return pnpData;
    }

    const gradeData: Slice[] = [
      {
        id: 'A',
        label: 'A',
        value: gradeACount,
        color: getCssVariable('--mui-palette-chart-blue'),
      },
      {
        id: 'B',
        label: 'B',
        value: gradeBCount,
        color: getCssVariable('--mui-palette-chart-green'),
      },
      {
        id: 'C',
        label: 'C',
        value: gradeCCount,
        color: getCssVariable('--mui-palette-chart-yellow'),
      },
      {
        id: 'D',
        label: 'D',
        value: gradeDCount,
        color: getCssVariable('--mui-palette-chart-orange'),
      },
      {
        id: 'F',
        label: 'F',
        value: gradeFCount,
        color: getCssVariable('--mui-palette-chart-red'),
      },
    ];

    return gradeData.concat(pnpData).filter((slice) => slice.value !== 0);
  };

  gpaToGradeConverter(gpa: string) {
    let i;
    for (i = 0; Number(gpa) < gpaScale[i]; i++);
    this.averageGrade = gradeScale[i];
  }

  styleTooltip = (props: PieTooltipProps<Slice>) => {
    const gradePercent = ((props.datum.value / this.total) * 100).toFixed(2) + '%';
    return <ChartTooltip label={props.datum.id} value={gradePercent} />;
  };

  render() {
    const gradeDistribution = this.getClassData();
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <ResponsivePie<Slice>
          data={gradeDistribution}
          margin={{
            top: 50,
            bottom: 50,
            left: 15,
            right: 15,
          }}
          enableArcLabels={false}
          enableArcLinkLabels={false}
          innerRadius={0.8}
          padAngle={2}
          colors={gradeDistribution.map((grade) => grade.color)}
          cornerRadius={3}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          tooltip={this.styleTooltip}
        />
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {this.totalPNP == this.total ? <h3 className="pie-text">Average Grade: {this.averagePNP}</h3> : null}
          {this.totalPNP != this.total ? (
            <h3 className="pie-text">
              Average Grade: {this.averageGrade} ({this.averageGPA})
            </h3>
          ) : null}
          <h3 className="pie-text" style={{ marginBottom: '6px' }}>
            Total Enrolled: <strong>{this.total}</strong>
          </h3>
          {this.totalPNP > 0 ? <small>{this.totalPNP} enrolled as P/NP</small> : null}
        </div>
      </div>
    );
  }
}
