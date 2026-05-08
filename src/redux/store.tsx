import { configureStore } from '@reduxjs/toolkit';
import newsReducer from '../../src/redux/Slices/newcSlices';
import commentReducer from '../../src/redux/Slices/commentSlices';
import profileReducer from '../../src/redux/Slices/profileSlice';
import editProfileReducer from '../redux/Slices/editProfileSlice';
import authReducer from '../redux/Slices/authSlice';

export const store = configureStore({
  reducer: {
    news: newsReducer,
    comments: commentReducer,
    profile: profileReducer,
    editProfile: editProfileReducer,
    auth: authReducer,
  },
});
