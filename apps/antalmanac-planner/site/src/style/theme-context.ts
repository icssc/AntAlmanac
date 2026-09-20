import { Theme } from '@peterportal/types';
import React from 'react';

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
