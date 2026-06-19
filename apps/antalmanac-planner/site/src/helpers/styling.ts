import { styled } from '@mui/material';
import { type Theme } from '@nivo/core';

export const tooltipStyle: Theme = {
  tooltip: {
    container: {
      background: 'rgba(0,0,0,.87)',
      color: '#ffffff',
      fontSize: '1.2rem',
      outline: 'none',
      margin: 0,
      padding: '0.25em 0.5em',
      borderRadius: '2px',
    },
  },
};

export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export const getChartTheme = (darkMode: boolean): Theme => {
  return {
    axis: {
      ticks: {
        text: {
          fill: darkMode ? '#eee' : '#333',
        },
      },
      legend: {
        text: {
          fill: darkMode ? '#eee' : '#333',
        },
      },
    },
  };
};

export const getCssVariable = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const bodyStyles = getComputedStyle(document.body);
  const valueFromBody = bodyStyles.getPropertyValue(name).trim();
  return valueFromBody;
};
