import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  username: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  bio: '',
  website: '',
  image: '',
};

const editProfileSlice = createSlice({
  name: 'editProfile',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProfile } = editProfileSlice.actions;
export default editProfileSlice.reducer;