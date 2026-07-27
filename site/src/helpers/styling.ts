import { styled } from '@mui/material';

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

export const getCssVariable = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const bodyStyles = getComputedStyle(document.body);
  const valueFromBody = bodyStyles.getPropertyValue(name).trim();
  return valueFromBody;
};
