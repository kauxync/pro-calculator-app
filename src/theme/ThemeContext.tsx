import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId, ThemePalette, THEMES } from './themes';
import { triggerLightHaptic } from '../utils/haptics';

const THEME_STORAGE_KEY = '@calculator_theme_id_v1';

interface ThemeContextProps {
  theme: ThemePalette;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>('midnight');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && (saved in THEMES)) {
          setThemeIdState(saved as ThemeId);
        }
      } catch (err) {
        console.error('Failed to load theme from storage', err);
      }
    })();
  }, []);

  const setTheme = (id: ThemeId) => {
    triggerLightHaptic();
    setThemeIdState(id);
    AsyncStorage.setItem(THEME_STORAGE_KEY, id).catch((err) =>
      console.error('Failed to persist theme', err)
    );
  };

  const theme = THEMES[themeId] || THEMES.midnight;
  const availableThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

