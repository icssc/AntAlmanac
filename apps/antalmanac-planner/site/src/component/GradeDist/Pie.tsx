import { Component } from 'react';
import { ResponsivePie, PieTooltipProps } from '@nivo/pie';

import { GradesRaw } from '@peterportal/types';
import { getAggregateGradeData } from '../../helpers/gradeDist.ts';
import ChartTooltip from '../ChartTooltip/ChartTooltip.tsx';
import { getCssVariable } from '../../helpers/styling.ts';

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

    const aggregateGradeData = getAggregateGradeData(this.props.gradeData, professor, quarter, course);
    this.total = aggregateGradeData.total;
    this.totalPNP = aggregateGradeData.totalPNP;
    this.averageGPA = aggregateGradeData.averageGPA;
    this.averageGrade = aggregateGradeData.averageGrade;
    this.averagePNP = aggregateGradeData.averagePNP;

    const pnpData: Slice[] = [
      {
        id: 'P',
        label: 'P',
        value: aggregateGradeData.gradePCount,
        color: getCssVariable('--mui-palette-chart-pass'),
      },
      {
        id: 'NP',
        label: 'NP',
        value: aggregateGradeData.gradeNPCount,
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
        value: aggregateGradeData.gradeACount,
        color: getCssVariable('--mui-palette-chart-blue'),
      },
      {
        id: 'B',
        label: 'B',
        value: aggregateGradeData.gradeBCount,
        color: getCssVariable('--mui-palette-chart-green'),
      },
      {
        id: 'C',
        label: 'C',
        value: aggregateGradeData.gradeCCount,
        color: getCssVariable('--mui-palette-chart-yellow'),
      },
      {
        id: 'D',
        label: 'D',
        value: aggregateGradeData.gradeDCount,
        color: getCssVariable('--mui-palette-chart-orange'),
      },
      {
        id: 'F',
        label: 'F',
        value: aggregateGradeData.gradeFCount,
        color: getCssVariable('--mui-palette-chart-red'),
      },
    ];

    return gradeData.concat(pnpData).filter((slice) => slice.value !== 0);
  };

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
