import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  comments: [
    {
      id: '1',
      image: require("../../assets/png/comment-1.png"),
      name: 'Wilson Franci',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '4w',
      likes: 125,
      replies: [
        {
          id: '1-1',
          image: require("../../assets/png/comment2.png"),
          name: 'Madelyn Saris',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          text: 'Lorem Ipsum is simply dummy text of the printing and typesetting.',
          time: '4w',
          likes: 3,
        },
      ],
    },
    {
      id: '2',
      image: require("../../assets/png/comment-1.png"),
      name: 'Marley Botosh',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '4w',
      likes: 12,
      replies: [],
    },
    {
      id: '3',
      image: require("../../assets/png/comment-1.png"),
      name: 'Alfonso Septimus',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '4w',
      likes: 14000,
      replies: [],
    },
    {
      id: '4',
      image: require('../../assets/png/comment-1.png'),
      name: 'Omar Herwitz',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      time: '4w',
      likes: 16,
      replies: [],
    },
  ],
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addComment: (state, action) => {
      state.comments.unshift(action.payload);
    },

    likeComment: (state, action) => {
      const comment = state.comments.find(c => c.id === action.payload);
      if (comment) {
        comment.likes += 1;
      }
    },

    addReply: (state, action) => {
      const { commentId, reply } = action.payload;
      const comment = state.comments.find(c => c.id === commentId);
      if (comment) {
        comment.replies.push(reply);
      }
    },
  },
});

export const { addComment, likeComment, addReply } = commentSlice.actions;
export default commentSlice.reducer;
