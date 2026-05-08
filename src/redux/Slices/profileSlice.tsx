import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullName: 'Wilson Franci',
  username: '',
  email: '',
  phoneNumber: '',
  website: '',
  image: require("../../assets/png/profile-1.png"),
  followers: 2156,
  following: 567,
  news: 23,
  bio: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',

   newsData: [
    {
      id: '1',
      category: 'NFTs',
      title: 'Bali plans to reopen to international tourists in Septe...',
      time: '15m ago',
      image: require("../../assets/png/NewsImage.png"),
    },
  ],


  recentData: [
    {
      id: '2',
      category: 'Business',
      title: 'Minting Your First NFT: A Beginner’s Guide to Creating...',
      time: '1h ago',
      image: require("../../assets/png/NewsImage.png"),
    },
    {
      id: '3',
      category: 'Travel',
      title: '5 things to know before the stock market opens Monday',
      time: '1w ago',
      image: require("../../assets/png/NewsImage.png"),
    },
    {
      id: '4',
      category: 'Travel',
      title: '5 things to know before the stock market opens Monday',
      time: '1w ago',
      image: require("../../assets/png/NewsImage.png"),
    },
    {
      id: '5',
      category: 'Travel',
      title: '5 things to know before the stock market opens Monday',
      time: '1w ago',
      image: require("../../assets/png/NewsImage.png"),
    },
     {
      id: '6',
      category: 'Travel',
      title: '5 things to know before the stock market opens Monday',
      time: '1w ago',
      image: require("../../assets/png/NewsImage.png"),
    },
  ],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfileData: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateProfileData } = profileSlice.actions;
export default profileSlice.reducer;
