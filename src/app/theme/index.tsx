import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './colors';
import { Spacing, BorderRadius, Shadow } from './spacing';
import { Typography } from './typography';

type ColorMode = 'light' | 'dark';
type BaseColors = typeof Colors.light | typeof Colors.dark;

interface Theme {
  colors: BaseColors & { accent: typeof Colors.accent; semantic: typeof Colors.semantic };
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadow: typeof Shadow;
  typography: typeof Typography;
  mode: ColorMode;
}

function buildTheme(mode: ColorMode): Theme {
  return {
    colors: { ...Colors[mode], accent: Colors.accent, semantic: Colors.semantic },
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadow: Shadow,
    typography: Typography,
    mode,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = buildTheme(scheme === 'dark' ? 'dark' : 'light');
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
