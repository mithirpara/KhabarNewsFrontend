import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: '',
  email: '',
  username: '',
  fullName: '',
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: true,
      };
    },
    clearAuthUser: () => initialState,
  },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
