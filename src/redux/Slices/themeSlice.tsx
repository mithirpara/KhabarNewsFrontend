import { createSlice } from '@reduxjs/toolkit';
import { ThemeMode } from '../../constants/theme';

const initialState = {
  mode: 'light' as ThemeMode,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
    toggleThemeMode: state => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
