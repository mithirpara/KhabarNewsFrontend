import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  newsList: [
    {
      id: '1',
      category: 'Europe',
      title: "Ukraine's President Zelensky to \nBBC: Blood money being paid...",
      source: 'BBC News',
      time: '14m ago',
      image1: require("../../assets/png/News1.png"),
      image2: require("../../assets/png/BCClogo2.png"),
    },
    {
      id: '2',
      category: 'Travel',
      title: 'Her train broke down. Her phone \ndied. And then she met her...',
      source: 'CNN',
      time: '1h ago',
      image1: require("../../assets/png/News2.png"),
      image2: require("../../assets/png/CNNlogo.png"),
    },
  ],
  searchText: '',
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
  },
});

export const { setSearchText } = newsSlice.actions;
export default newsSlice.reducer;
