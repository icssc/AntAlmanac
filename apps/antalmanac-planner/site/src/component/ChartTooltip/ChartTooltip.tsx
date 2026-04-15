import { FC } from 'react';
import { tooltipStyle } from '../../helpers/styling';

const ChartTooltip: FC<{ label: string | number; value: string | number }> = ({ label, value }) => {
  return (
    <div style={tooltipStyle.tooltip?.container}>
      <strong>
        {label}: {value}
      </strong>
    </div>
  );
};

export default ChartTooltip;
