export type ThemeMode = 'light' | 'dark';

export const themeColors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    mutedText: '#888888',
    border: '#EEEEEE',
    inputBorder: '#4E4B66',
    icon: '#4E4B66',
    tabBar: '#FFFFFF',
    statusBar: '#F2F2F2',
  },
  dark: {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    mutedText: '#D1D5DB',
    border: '#374151',
    inputBorder: '#6B7280',
    icon: '#FFFFFF',
    tabBar: '#1F2937',
    statusBar: '#111827',
  },
};

export function getThemeColors(mode?: ThemeMode) {
  return themeColors[mode === 'dark' ? 'dark' : 'light'];
}
