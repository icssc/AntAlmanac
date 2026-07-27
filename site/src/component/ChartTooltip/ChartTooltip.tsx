import { FC } from 'react';
import { Box } from '@mui/material';

const ChartTooltip: FC<{ label: string | number; value: string | number }> = ({ label, value }) => {
  return (
    <Box
      sx={{
        background: 'rgba(0,0,0,.87)',
        color: '#ffffff',
        fontSize: '1.2rem',
        outline: 'none',
        margin: 0,
        padding: '0.25em 0.5em',
        borderRadius: '2px',
      }}
    >
      <strong>
        {label}: {value}
      </strong>
    </Box>
  );
};

export default ChartTooltip;
