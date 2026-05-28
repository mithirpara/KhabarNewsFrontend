import { useSelector } from 'react-redux';
import { getThemeColors } from '../constants/theme';

export function useAppTheme() {
  const themeMode = useSelector((state: any) => state.theme.mode);

  return {
    mode: themeMode,
    colors: getThemeColors(themeMode),
    isDarkMode: themeMode === 'dark',
  };
}
