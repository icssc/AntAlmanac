import React from 'react';
import { Theme } from '@peterportal/types';

const ThemeContext = React.createContext<{
  darkMode: boolean;
  usingSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
}>({
  darkMode: false,
  usingSystemTheme: false,
  setTheme: () => {},
});

export default ThemeContext;
